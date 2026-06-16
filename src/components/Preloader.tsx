"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { markIntroDone } from "@/lib/intro";

gsap.registerPlugin(ScrambleTextPlugin);

// The opening beat. The name glitches into focus while a big count races to 100
// over a full-width accent line; at 100 a hard flash hits and the void wipes up
// to reveal the particle cloud bursting together. Firing the intro signal on the
// wipe is what makes the build-up land in view. Skipped under reduced motion
// (signal fires at once so the hero still shows).
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      markIntroDone();
      return;
    }
    const counter = { v: 0 };
    const tl = gsap.timeline();

    // Name glitches into focus.
    tl.to(nameRef.current, {
      duration: 1.5,
      scrambleText: {
        text: "THIMOFEJ ZAPKO",
        chars: "�01▚▞█▌▐░▒ZTX#",
        speed: 0.6,
      },
      ease: "none",
    });
    // Count + accent line race alongside it.
    tl.to(
      counter,
      {
        v: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(counter.v);
          if (numRef.current) numRef.current.textContent = String(v);
          if (barRef.current) gsap.set(barRef.current, { scaleX: counter.v / 100 });
        },
      },
      0,
    );

    // 100 hit: hard flash.
    tl.to(flashRef.current, { autoAlpha: 0.85, duration: 0.08, ease: "power2.in" });
    tl.add(markIntroDone);
    tl.to(flashRef.current, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
    // Content blurs out as the void wipes up to the assembling cloud.
    tl.to(
      innerRef.current,
      { autoAlpha: 0, scale: 1.1, filter: "blur(12px)", duration: 0.6, ease: "power2.in" },
      "<",
    );
    tl.to(
      rootRef.current,
      { yPercent: -100, duration: 0.85, ease: "power4.inOut" },
      "<0.05",
    );
    tl.add(() => setDone(true));
    return () => {
      tl.kill();
    };
  }, [reduce]);

  if (reduce || done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-void"
    >
      <div ref={innerRef} className="flex flex-col items-center gap-7 px-6">
        <span
          ref={nameRef}
          className="font-mono text-sm uppercase tracking-[0.4em] text-accent sm:text-base"
        >
          THIMOFEJ ZAPKO
        </span>
        <span className="font-display text-8xl font-light leading-none text-text tabular-nums sm:text-[13rem]">
          <span ref={numRef}>0</span>
          <span className="align-top font-mono text-2xl text-text-meta sm:text-4xl">
            %
          </span>
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-accent opacity-0"
      />
    </div>
  );
}
