import { Github, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer id="disclaimer" className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold">PneumoScan AI</span>
        </div>
        <p className="text-sm text-foreground">PneumoScan AI — BTech Final Year Project</p>
        <p className="mt-1 text-sm text-muted-foreground">Built with Swin Transformer, PyTorch, and FastAPI</p>

        <div className="mt-6 flex justify-center">
          <a
            href="#"
            aria-label="GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg glass text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-xs text-muted-foreground">
          Disclaimer: PneumoScan AI is an academic research project intended for educational and
          demonstration purposes only. It is not a medical device and must not be used for clinical
          diagnosis, treatment decisions, or as a substitute for professional medical advice.
        </p>
      </div>
    </footer>
  );
}
