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

  const fadeOut = () => {
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.7,
      ease: "power2.inOut",
    });
  };

  const enter = () => {
    void audio.start();
    markIntroSeen();
    markIntroDone();
    fadeOut();
  };

  // Same flight, just silent — sound stays a real choice, not a toll.
  const enterMuted = () => {
    audio.mute();
    markIntroSeen();
    markIntroDone();
    fadeOut();
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
            Bochum · 15 · builds
          </p>
          <h1 className="mt-4 font-display text-5xl font-light tracking-tight sm:text-7xl">
            Thimofej Zapko
          </h1>
        </div>
        <div className="flex flex-col items-center gap-5">
          <button
            type="button"
            onClick={enter}
            className="group flex flex-col items-center gap-3"
            aria-label="Enter, with sound"
          >
            <span className="rounded-full border border-line/15 px-8 py-3 font-mono text-xs uppercase tracking-[0.3em] text-text transition-[color,border-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:text-accent">
              Enter
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-meta">
              ◉ with sound
            </span>
          </button>
          <button
            type="button"
            onClick={enterMuted}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-meta underline decoration-line/20 underline-offset-4 transition-colors hover:text-text"
          >
            rather without sound
          </button>
        </div>
      </div>
    </div>
  );
}
