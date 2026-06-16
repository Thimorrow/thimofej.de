"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { onWorldReady } from "@/lib/intro";

gsap.registerPlugin(useGSAP, SplitText);

// The hero identity block. Server-rendered markup (LCP + SEO stay intact); the
// reveal is layered on top once the preloader hands off. The name rises char by
// char behind a clip mask, then kicker / tagline / hint stagger in.
export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const root = rootRef.current;
      if (!root) return;

      const kicker = root.querySelector<HTMLElement>("[data-hero-kicker]");
      const h1 = root.querySelector<HTMLElement>("h1");
      const tagline = root.querySelector<HTMLElement>("[data-hero-tagline]");
      const hint = root.querySelector<HTMLElement>("[data-hero-hint]");
      if (!h1) return;

      // Hide via JS only — no-JS and pre-hydration keep the hero fully readable.
      gsap.set([kicker, tagline, hint], { autoAlpha: 0, y: 18 });
      gsap.set(h1, { autoAlpha: 0 });

      let split: SplitText | null = null;
      const build = () => {
        if (!rootRef.current) return;
        split = SplitText.create(h1, {
          type: "words,chars",
          mask: "chars",
          aria: "auto",
        });
        gsap.set(h1, { autoAlpha: 1 });
        gsap
          .timeline()
          .to(kicker, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" })
          .from(
            split.chars,
            { yPercent: 115, duration: 0.8, ease: "power4.out", stagger: 0.04 },
            "-=0.15",
          )
          .to(
            [tagline, hint],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.14,
            },
            "-=0.35",
          );
      };

      // Wait for the drone-flight to arrive AND the display font, so the char
      // split measures real glyphs (no reflow pop).
      const unsub = onWorldReady(() => {
        void document.fonts.ready.then(build);
      });

      return () => {
        unsub();
        split?.revert();
      };
    },
    { dependencies: [reduce], scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]"
    >
      <p
        data-hero-kicker
        className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-meta"
      >
        Bochum · 15 · baut
      </p>
      <h1
        id="hero-heading"
        className="mt-4 font-display text-6xl font-light leading-[0.95] tracking-tight [font-kerning:none] sm:text-8xl"
      >
        Thimofej Zapko
      </h1>
      <p
        data-hero-tagline
        className="mx-auto mt-6 max-w-md text-balance text-lg text-text-muted sm:text-xl"
      >
        Ich bau Sachen. Das hier ist der Mensch dahinter.
      </p>
      <span
        data-hero-hint
        className="mt-12 block font-mono text-[10px] uppercase tracking-[0.3em] text-text-meta"
      >
        ↓ scrollen
      </span>
    </div>
  );
}
