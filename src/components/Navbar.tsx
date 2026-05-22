import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how" },
  { label: "About", href: "#about" },
  { label: "Disclaimer", href: "#disclaimer" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            PneumoScan <span className="gradient-text">AI</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#upload"
          className="inline-flex items-center gap-2 rounded-lg gradient-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-105 glow-blue"
        >
          Try Now
        </a>
      </nav>
    </header>
  );
}
