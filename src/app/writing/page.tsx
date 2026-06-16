import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Schreiben · Thimofej Zapko",
  description: "Notizen und halbe Gedanken von Thimofej Zapko.",
};

export default function WritingIndex() {
  return (
    <main
      id="main"
      className="relative mx-auto min-h-dvh max-w-3xl bg-void/70 backdrop-blur-[2px] px-6 pb-32 pt-40"
    >
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-text-meta transition-colors hover:text-accent"
      >
        ← Start
      </Link>
      <h1 className="mt-8 font-display text-5xl font-light">Schreiben</h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">
        Die ersten Notizen kommen bald. Ich schreib über Bauen, KI, Glauben und
        darüber, das Leben Stück für Stück zu kapieren.
      </p>
    </main>
  );
}
