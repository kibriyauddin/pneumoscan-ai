import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-40 pb-28">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-drift" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-cyan/15 blur-3xl animate-drift" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Powered by Swin Transformer Deep Learning
        </div>

        <h1 className="animate-fade-up text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-7xl" style={{ animationDelay: "0.1s" }}>
          AI-Powered Pneumonia Detection
          <br />
          from <span className="gradient-text">Chest X-Rays</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-muted-foreground md:text-xl" style={{ animationDelay: "0.2s" }}>
          Upload a chest X-ray and get instant AI analysis powered by Swin Transformer deep learning — with visual explanations of every prediction.
        </p>

        <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-6" style={{ animationDelay: "0.3s" }}>
          <div className="glass rounded-2xl px-8 py-5 text-left">
            <div className="text-3xl font-bold gradient-text">94%</div>
            <div className="mt-1 text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="glass rounded-2xl px-8 py-5 text-left">
            <div className="text-3xl font-bold gradient-text">5,856</div>
            <div className="mt-1 text-sm text-muted-foreground">Training Images</div>
          </div>
        </div>

        <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="#upload"
            className="group inline-flex items-center gap-2 rounded-xl gradient-bg px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:scale-105 glow-blue"
          >
            Analyze Your X-Ray
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
