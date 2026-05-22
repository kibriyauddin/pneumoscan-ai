import os
import io
import base64
import numpy as np
import torch
import timm
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PneumoScan AI API")

# Allow requests from Lovable frontend (and localhost for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Model loading ----------

_model = None
_device = None

def get_model():
    global _model, _device
    if _model is not None:
        return _model, _device

    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = timm.create_model("swin_base_patch4_window7_224", pretrained=False, num_classes=2)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "swin_transformer_weights.pth")

    if not os.path.exists(model_path):
        raise RuntimeError(f"Model file not found at: {model_path}")

    checkpoint = torch.load(model_path, map_location=_device, weights_only=False)
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]
    checkpoint = {k.replace("module.", ""): v for k, v in checkpoint.items()}
    model_dict = model.state_dict()
    checkpoint = {k: v for k, v in checkpoint.items() if k in model_dict}
    model.load_state_dict(checkpoint, strict=False)
    model.to(_device)
    model.eval()

    _model = model
    return _model, _device


# ---------- Helpers ----------

def preprocess(image: Image.Image) -> torch.Tensor:
    if image.mode != "RGB":
        image = image.convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    return transform(image).unsqueeze(0)


def swin_reshape(tensor):
    h = w = int(tensor.size(1) ** 0.5)
    result = tensor.reshape(tensor.size(0), h, w, tensor.size(2))
    return result.permute(0, 3, 1, 2)


def image_to_base64(img_array: np.ndarray) -> str:
    pil_img = Image.fromarray(img_array)
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ---------- X-Ray Validation ----------

def validate_xray(image: Image.Image):
    img = image.convert("RGB")
    arr = np.array(img).astype(np.float32) / 255.0
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

    # Color check
    mean_color_diff = (np.abs(r-g).mean() + np.abs(g-b).mean() + np.abs(b-r).mean()) / 3.0
    if mean_color_diff > 0.08:
        return False, "This appears to be a color image. Chest X-rays are grayscale. Please upload a valid chest X-ray."

    gray = 0.299*r + 0.587*g + 0.114*b
    mean_brightness = gray.mean()
    std_brightness = gray.std()

    if mean_brightness < 0.05:
        return False, "The image is too dark to be a valid chest X-ray."
    if mean_brightness > 0.95:
        return False, "The image is too bright to be a valid chest X-ray."
    if std_brightness < 0.05:
        return False, "The image has very low contrast. A valid chest X-ray should show clear contrast between bones and soft tissue."

    h, w = arr.shape[:2]
    if w/h > 2.5 or w/h < 0.4:
        return False, "The image dimensions are unusual for a chest X-ray."
    if h < 100 or w < 100:
        return False, "The image resolution is too low."

    gray_uint8 = (gray * 255).astype(np.uint8)
    gy = np.abs(np.diff(gray_uint8.astype(np.float32), axis=0))
    gx = np.abs(np.diff(gray_uint8.astype(np.float32), axis=1))
    edge_density = (gy.mean() + gx.mean()) / 2.0
    if edge_density < 1.0:
        return False, "The image appears too uniform. This does not look like a chest X-ray."
    if edge_density > 40.0:
        return False, "This image appears to be a natural photograph, not a chest X-ray."

    gray_resized = np.array(image.convert("L").resize((224, 224))).astype(np.float32) / 255.0
    left = gray_resized[:, :75].mean()
    center = gray_resized[:, 75:149].mean()
    right = gray_resized[:, 149:].mean()
    side = (left + right) / 2.0
    dark_ratio = (gray_resized < 0.3).sum() / gray_resized.size
    bright_ratio = (gray_resized > 0.7).sum() / gray_resized.size

    if dark_ratio > 0.70:
        return False, "This does not appear to be a chest X-ray. Please upload a chest X-ray only."
    if bright_ratio < 0.02:
        return False, "This does not appear to be a chest X-ray. Insufficient bone/tissue contrast detected."
    if abs(left - right) > 0.15:
        return False, "This does not appear to be a chest X-ray. The image lacks bilateral symmetry characteristic of chest X-rays."

    return True, ""


# ---------- Routes ----------

@app.get("/")
def root():
    return {"status": "PneumoScan AI backend is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        if image.mode != "RGB":
            image = image.convert("RGB")

        is_valid, error_msg = validate_xray(image)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        model, device = get_model()
        input_tensor = preprocess(image).to(device)

        # Prediction
        with torch.no_grad():
            output = model(input_tensor)
            probs = F.softmax(output, dim=1)[0]

        normal_prob = round(probs[0].item() * 100, 2)
        pneumonia_prob = round(probs[1].item() * 100, 2)
        prediction = "NORMAL" if normal_prob > pneumonia_prob else "PNEUMONIA"
        confidence = max(normal_prob, pneumonia_prob)

        # Heatmap
        target_layers = [model.layers[-2].blocks[-1].norm2]
        cam = EigenCAM(model=model, target_layers=target_layers, reshape_transform=swin_reshape)
        predicted_class = 0 if prediction == "NORMAL" else 1
        targets = [ClassifierOutputTarget(predicted_class)]
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]

        cam_tensor = torch.tensor(grayscale_cam).unsqueeze(0).unsqueeze(0)
        cam_up = F.interpolate(cam_tensor, size=(224, 224), mode="bilinear", align_corners=False)
        grayscale_cam = cam_up.squeeze().numpy()
        grayscale_cam = (grayscale_cam - grayscale_cam.min()) / (grayscale_cam.max() - grayscale_cam.min() + 1e-8)

        rgb_img = np.array(image.resize((224, 224))).astype(np.float32) / 255.0
        rgb_img = np.clip(rgb_img, 0, 1)
        cam_image = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

        original_b64 = image_to_base64(np.array(image.resize((224, 224))))
        heatmap_b64 = image_to_base64(cam_image)

        # AI Insights text
        if prediction == "PNEUMONIA":
            heatmap_title = "Suspected Pneumonia Regions"
            heatmap_info = "Red/yellow regions highlight areas where the model detected pneumonia patterns such as opacity, infiltrates, or consolidation in the lung tissue."
            insight_title = "Pneumonia Detected"
            insight_body = "The AI model has identified patterns consistent with pneumonia. The highlighted areas show where the model detected concerning features such as lung opacity or cloudiness, infiltrates or consolidation, and abnormal patterns in lung tissue."
            insight_note = "This is an AI prediction and should be verified by a qualified radiologist."
        else:
            heatmap_title = "Areas Confirming Normal Lungs"
            heatmap_info = "Red/yellow regions show where the model confirmed healthy lung patterns. These are areas the model examined to verify the absence of pneumonia — not areas of concern."
            insight_title = "Normal Classification"
            insight_body = "The AI model has classified this chest X-ray as normal. No obvious signs of pneumonia were detected. The heatmap shows areas where the model confirmed clear lung fields, normal lung tissue appearance, and absence of opacity or infiltrates."
            insight_note = "This does not rule out other conditions and should not replace professional medical evaluation."

        return {
            "prediction": prediction,
            "confidence": confidence,
            "normal_prob": normal_prob,
            "pneumonia_prob": pneumonia_prob,
            "original": original_b64,
            "heatmap": heatmap_b64,
            "heatmap_title": heatmap_title,
            "heatmap_info": heatmap_info,
            "insight_title": insight_title,
            "insight_body": insight_body,
            "insight_note": insight_note,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
