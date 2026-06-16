"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { markIntroDone, markWorldReady } from "@/lib/intro";
import { audio } from "@/lib/audio";

// Click-to-enter gate. The click is the user gesture that unlocks audio, so the
// cinematic plays with sound from its very first frame. It also gives the visit
// a deliberate "step inside" beat. Under reduced motion it simply reveals the
// page on click (no flight).
export function EnterGate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Warm the audio cache while the gate is up so cues fire instantly on enter.
    audio.prefetch();
  }, []);

  const enter = () => {
    void audio.start();
    markIntroDone();
    if (reduce) markWorldReady();
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => setGone(true),
    });
  };

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-10 bg-void px-6 text-center"
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-text-meta">
          Bochum · 15 · baut
        </p>
        <h1 className="mt-4 font-display text-5xl font-light tracking-tight sm:text-7xl">
          Thimofej Zapko
        </h1>
      </div>
      <button
        type="button"
        onClick={enter}
        className="group flex flex-col items-center gap-3"
        aria-label="Eintreten, mit Ton"
      >
        <span className="rounded-full border border-white/15 px-8 py-3 font-mono text-xs uppercase tracking-[0.3em] text-text transition-colors group-hover:border-accent group-hover:text-accent">
          Eintreten
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-meta">
          ◉ mit Ton
        </span>
      </button>
    </div>
  );
}
