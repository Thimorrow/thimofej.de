"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  markIntroDone,
  markWorldReady,
  setSkipFlight,
  introSeen,
  markIntroSeen,
} from "@/lib/intro";
import { audio } from "@/lib/audio";

// Click-to-enter gate — shown only on a visitor's FIRST ever visit. The click is
// the user gesture that unlocks audio, so the cinematic plays with sound from
// frame one, and it gives the visit a deliberate "step inside" beat.
//
// Returning visitors (intro already seen) and reduced-motion users skip the
// flight: the cover fades and they land straight on the hero. The gate content
// starts invisible, so a returning visitor never sees it flash before the skip.
export function EnterGate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    audio.prefetch();

    if (reduce || introSeen()) {
      setSkipFlight(true);
      markIntroDone();
      if (reduce) markWorldReady();
      gsap.to(rootRef.current, {
        autoAlpha: 0,
        duration: reduce ? 0 : 0.5,
        ease: "power2.out",
      });
      return;
    }

    gsap.to(contentRef.current, {
      autoAlpha: 1,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [reduce]);

  const enter = () => {
    void audio.start();
    markIntroSeen();
    markIntroDone();
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.7,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void px-6 text-center"
    >
      <div
        ref={contentRef}
        className="flex flex-col items-center gap-10 opacity-0"
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
    </div>
  );
}
