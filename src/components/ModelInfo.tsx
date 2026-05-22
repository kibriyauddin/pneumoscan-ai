import { Brain, Target, Database, Layers } from "lucide-react";

const metrics = [
  { icon: Brain, label: "Model", value: "Swin Transformer", sub: "Base" },
  { icon: Target, label: "Accuracy", value: "94%", sub: "Validation" },
  { icon: Database, label: "Dataset", value: "5,856", sub: "Images" },
  { icon: Layers, label: "Classes", value: "Normal / Pneumonia", sub: "Binary" },
];

const rows = [
  { cls: "Normal", precision: "0.94", recall: "0.94", f1: "0.94" },
  { cls: "Pneumonia", precision: "0.94", recall: "0.94", f1: "0.94" },
];

export function ModelInfo() {
  return (
    <section id="about" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            About the <span className="gradient-text">Model</span>
          </h2>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="glass card-hover rounded-xl p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{m.label}</div>
              <div className="mt-1 text-lg font-bold text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-7">
            <h3 className="mb-4 text-xl font-semibold">Swin Transformer + Transfer Learning</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              PneumoScan is powered by the <span className="text-foreground font-medium">Swin Transformer (Shifted Window Transformer)</span>, a state-of-the-art
              hierarchical vision transformer that processes images through shifted local attention windows.
              The model was pre-trained on <span className="text-foreground font-medium">ImageNet</span> and fine-tuned
              on the Chest X-Ray Pneumonia dataset using transfer learning, enabling it to capture subtle
              radiographic patterns associated with pulmonary infections.
            </p>
          </div>

          <div className="glass rounded-2xl p-7">
            <h3 className="mb-4 text-xl font-semibold">Performance Metrics</h3>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Precision</th>
                    <th className="px-4 py-3">Recall</th>
                    <th className="px-4 py-3">F1-Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.cls} className={i ? "border-t border-border" : ""}>
                      <td className="px-4 py-3 font-medium text-foreground">{r.cls}</td>
                      <td className="px-4 py-3 font-mono text-primary">{r.precision}</td>
                      <td className="px-4 py-3 font-mono text-primary">{r.recall}</td>
                      <td className="px-4 py-3 font-mono text-primary">{r.f1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
