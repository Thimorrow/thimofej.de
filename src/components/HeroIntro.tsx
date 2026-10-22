"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { onWorldReady, onArrive, onReplay } from "@/lib/intro";
import { SoundToggle } from "./SoundToggle";
import { ReplayIntro } from "./ReplayIntro";
import { SiteIcon } from "./SiteIcon";

gsap.registerPlugin(useGSAP, SplitText);

// The hero identity block. Server-rendered markup (LCP + SEO stay intact); the
// reveal is layered on top once the preloader hands off. The name rises char by
// char behind a clip mask, then kicker / tagline / hint stagger in.
export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    (context) => {
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
      let timeline: gsap.core.Timeline | null = null;
      let active = true;
      const ensureSplit = () => {
        if (split || !rootRef.current) return;
        split = SplitText.create(h1, {
          type: "words,chars",
          mask: "chars",
          aria: "auto",
        });
      };

      // Re-runnable reveal (the replay button can trigger it again). Wait for the
      // display font so the char split measures real glyphs (no reflow pop).
      const reveal = () => {
        void document.fonts.ready.then(() => {
          if (!active) return;
          context.add(() => {
            ensureSplit();
            if (!split) return;
            timeline?.kill();
            gsap.set(h1, { autoAlpha: 1 });
            gsap.set([kicker, tagline, hint], { autoAlpha: 0, y: 18 });
            timeline = gsap
              .timeline()
              .to(kicker, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" })
              .fromTo(
                split.chars,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.65, ease: "power3.out", stagger: 0.008 },
                "-=0.2",
              )
              .to(
                [tagline, hint],
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.5,
                  ease: "power2.out",
                  stagger: 0.08,
                },
                "-=0.35",
              );
          });
        });
      };

      // Hide instantly while a replay flight is running, so it re-reveals at the
      // flight's arrival.
      const hide = () => {
        timeline?.kill();
        gsap.set([h1, kicker, tagline, hint], { autoAlpha: 0 });
      };

      // worldReady = skip / reduced-motion (no flight). arrive = a flight ended
      // (first run or replay). replay = a flight just started.
      const unsubReady = onWorldReady(reveal);
      const unsubArrive = onArrive(reveal);
      const unsubReplay = onReplay(hide);

      return () => {
        active = false;
        timeline?.kill();
        unsubReady();
        unsubArrive();
        unsubReplay();
        split?.revert();
      };
    },
    { dependencies: [reduce], scope: rootRef, revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      className="hero-identity relative [text-shadow:var(--text-glow)]"
    >
      <p
        data-hero-kicker
        className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-meta"
      >
        AI engineer / frontend developer
      </p>
      <h1
        id="hero-heading"
        className="hero-title font-display [font-kerning:none]"
      >
        <span className="hero-name">Thimofej Zapko</span>{" "}
        <span className="hero-statement">makes frontend experiences <span className="hero-accent">with AI.</span></span>
      </h1>
      <p
        data-hero-tagline
        className="hero-description text-text-muted"
      >
        I&apos;m 15 and specialize in building frontend with AI. I care about clear interfaces, useful products, and turning ideas into working software.
      </p>
      <a
        data-hero-hint
        href="#projects"
        className="hero-work-link mt-12 inline-flex min-h-11 items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-meta"
      >
        <span aria-hidden className="hero-work-arrow"><SiteIcon name="arrow-down" /></span>
        <span>things I&apos;ve built</span>
      </a>
      <div className="experience-controls">
        <ReplayIntro />
        <SoundToggle />
      </div>
    </div>
  );
}
