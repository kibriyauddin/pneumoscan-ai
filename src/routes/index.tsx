import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { UploadAnalysis } from "@/components/UploadAnalysis";
import { ModelInfo } from "@/components/ModelInfo";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <UploadAnalysis />
        <ModelInfo />
      </main>
      <Footer />
    </div>
  );
}
