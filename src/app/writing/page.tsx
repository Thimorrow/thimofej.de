import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Writing · Thimofej Zapko",
  description: "Notes and half-formed thoughts by Thimofej Zapko.",
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
        ← Home
      </Link>
      <h1 className="mt-8 font-display text-5xl font-light">Writing</h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">
        First notes coming soon. I write about building, AI, faith, and figuring
        life out piece by piece.
      </p>
    </main>
  );
}
