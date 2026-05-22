import { Upload, Cpu, BarChart3 } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload", desc: "Drag and drop your chest X-ray image into the secure analysis zone." },
  { icon: Cpu, title: "Analyze", desc: "Our Swin Transformer model processes the image in seconds." },
  { icon: BarChart3, title: "Results", desc: "Get prediction, confidence score, and AI attention heatmap." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            How <span className="gradient-text">PneumoScan</span> Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Three simple steps from chest X-ray to AI-powered diagnosis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative glass card-hover rounded-2xl p-8"
            >
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full gradient-bg text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
