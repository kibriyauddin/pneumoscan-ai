import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload as UploadIcon, ImageIcon, Loader2, ScanLine, AlertCircle, CheckCircle2, X, RefreshCw } from "lucide-react";

type Prediction = {
  prediction: "NORMAL" | "PNEUMONIA";
  confidence: number;
  normal_prob: number;
  pneumonia_prob: number;
};

const API_BASE = "http://localhost:8000";

export function UploadAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState({ normal: 0, pneumonia: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!/image\/(png|jpe?g)/.test(f.type)) {
      toast.error("Please upload a PNG or JPG image.");
      return;
    }
    setFile(f);
    setResult(null);
    setHeatmapUrl(null);
    setProgress({ normal: 0, pneumonia: 0 });
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setHeatmapUrl(null);
    setProgress({ normal: 0, pneumonia: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!file) {
      toast.error("Please upload an X-ray image first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setHeatmapUrl(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const [predRes, heatRes] = await Promise.all([
        fetch(`${API_BASE}/predict`, { method: "POST", body: fd }),
        fetch(`${API_BASE}/heatmap`, { method: "POST", body: (() => { const f = new FormData(); f.append("file", file); return f; })() }),
      ]);

      if (!predRes.ok) throw new Error("Prediction failed");
      const data: Prediction = await predRes.json();
      setResult(data);

      if (heatRes.ok) {
        const heatData: { heatmap: string; original?: string } = await heatRes.json();
        setHeatmapUrl(`data:image/png;base64,${heatData.heatmap}`);
      }

      // Animate progress bars
      setTimeout(() => setProgress({ normal: data.normal_prob, pneumonia: data.pneumonia_prob }), 100);
      toast.success("Analysis complete");
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Make sure the API is running at " + API_BASE);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

  const isNormal = result?.prediction === "NORMAL";

  return (
    <section id="upload" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Upload & <span className="gradient-text">Analyze</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Upload a chest X-ray to receive an instant prediction with attention heatmap.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Panel */}
          <div className="glass rounded-2xl p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/10 glow-blue"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {previewUrl ? (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block mx-auto">
                    <img src={previewUrl} alt="X-ray preview" className="mx-auto max-h-72 rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetAll(); }}
                      aria-label="Remove image"
                      className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-danger text-white shadow-lg hover:scale-110 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span className="font-medium text-foreground">{file?.name}</span>
                    <span>•</span>
                    <span>{file && formatSize(file.size)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Upload another
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetAll(); }}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <UploadIcon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Drag & drop your chest X-ray here</h3>
                  <p className="mb-5 text-sm text-muted-foreground">or</p>
                  <button
                    type="button"
                    className="rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
                  >
                    Browse Files
                  </button>
                  <div className="mt-6 flex gap-2">
                    {["PNG", "JPG", "JPEG"].map((t) => (
                      <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={analyze}
              disabled={!file || loading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-bg px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                loading ? "animate-pulse-glow" : "glow-blue"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <ScanLine className="h-5 w-5" />
                  Analyze Image
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="glass rounded-2xl p-6 min-h-[500px]">
            {!result && !loading && (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center text-muted-foreground">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/40 opacity-60">
                  <ImageIcon className="h-10 w-10" />
                </div>
                <p className="text-sm">Results will appear here after analysis</p>
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-6 text-sm text-muted-foreground">Running Swin Transformer inference…</p>
              </div>
            )}

            {result && (
              <div className="animate-fade-up space-y-6">
                <div
                  className={`flex items-center gap-4 rounded-xl border p-5 ${
                    isNormal
                      ? "border-success/40 bg-success/10 animate-pulse-glow-green"
                      : "border-danger/40 bg-danger/10 animate-pulse-glow-red"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isNormal ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                    {isNormal ? <CheckCircle2 className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prediction</div>
                    <div className={`text-2xl font-bold ${isNormal ? "text-success" : "text-danger"}`}>
                      {result.prediction}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confidence</div>
                    <div className="text-3xl font-extrabold text-foreground">{result.confidence.toFixed(2)}%</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <ProgressRow label="Normal" pct={progress.normal} color="success" />
                  <ProgressRow label="Pneumonia" pct={progress.pneumonia} color="danger" />
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Original X-Ray</div>
                    {previewUrl && <img src={previewUrl} alt="Original" className="aspect-square w-full rounded-lg object-cover ring-1 ring-border" />}
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan">AI Attention Heatmap</div>
                    {heatmapUrl ? (
                      <img src={heatmapUrl} alt="Heatmap" className="aspect-square w-full rounded-lg object-cover ring-1 ring-border" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground ring-1 ring-border">
                        Heatmap unavailable
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "linear-gradient(90deg, #ef4444, #f59e0b)" }} />
                    High attention
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }} />
                    Low attention
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  For educational purposes only. Not for clinical use.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressRow({ label, pct, color }: { label: string; pct: number; color: "success" | "danger" }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{pct.toFixed(2)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            color === "success" ? "bg-success" : "bg-danger"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
