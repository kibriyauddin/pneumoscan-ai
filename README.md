# PneumoScan AI

AI-powered pneumonia detection from chest X-rays using Swin Transformer.

🔗 **Live Demo**: [pneumo-scan.lovable.app](https://pneumo-scan.lovable.app)

---

## What it does

Upload a chest X-ray and get:
- Normal / Pneumonia prediction with confidence score
- EigenCAM attention heatmap showing which lung regions influenced the decision
- AI insights explaining the prediction

## Tech Stack

**Frontend**
- React + TypeScript (Lovable)
- Tailwind CSS + shadcn/ui

**Backend**
- FastAPI + Uvicorn
- PyTorch + timm (Swin Transformer Base)
- EigenCAM (pytorch-grad-cam)
- Deployed on Hugging Face Spaces

**Model**
- Architecture: `swin_base_patch4_window7_224`
- Pre-trained on ImageNet, fine-tuned on Kaggle Chest X-Ray dataset
- Dataset: 5,856 images (Normal / Pneumonia)
- Accuracy: 94% | Precision: 94% | Recall: 94% | F1: 94%

---

## Project Structure

```
pneumoscan-ai/
├── src/                  # React frontend
│   ├── components/       # UI components
│   └── routes/           # Page routes
├── backend/              # FastAPI backend
│   ├── main.py           # API endpoints + model inference
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Docker config for HF Spaces
└── package.json
```

---

## Running Locally

**Frontend**
```bash
npm install
npm run dev
```

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

The frontend calls `http://localhost:8000` by default. Update `API_BASE` in `src/components/UploadAnalysis.tsx` to point to your backend URL.

---

## API Endpoints

`POST /predict` — Upload a chest X-ray, returns prediction + heatmap + insights

```json
{
  "prediction": "PNEUMONIA",
  "confidence": 95.4,
  "normal_prob": 4.6,
  "pneumonia_prob": 95.4,
  "original": "<base64 png>",
  "heatmap": "<base64 png>",
  "heatmap_title": "Suspected Pneumonia Regions",
  "heatmap_info": "...",
  "insight_title": "Pneumonia Detected",
  "insight_body": "...",
  "insight_note": "..."
}
```

---

## Disclaimer

This is a BTech final year academic project for educational purposes only. Not intended for clinical diagnosis or medical use. Always consult a qualified radiologist.
