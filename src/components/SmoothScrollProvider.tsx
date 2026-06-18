"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setScrollProgress, setMorphTarget } from "@/lib/scrollProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.isContentEditable ||
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT")
  );
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      // Reduced motion: no smooth scroll, no scrub, no key hijack. The native
      // scroll the browser already gives is the meaningful experience.
      if (reduce) return;

      // Drive Lenis from GSAP's single ticker (no double rAF).
      const raf = (time: number) => {
        lenisRef.current?.lenis?.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      const lenis = lenisRef.current?.lenis;
      lenis?.on("scroll", ScrollTrigger.update);
      // Exposed so the intro replay can jump to the top before re-flying.
      (window as unknown as { __lenis?: typeof lenis }).__lenis = lenis;

      // One anchor per section: the scroll position where that section's heading
      // sits in the centre of the viewport. The cloud morphs toward form i as
      // section i's heading approaches the middle, so each form locks onto (and,
      // since the canvas is centred, visually encloses) its own heading.
      const formSections = gsap.utils.toArray<HTMLElement>(
        "#main section[aria-labelledby]",
      );
      const headingTriggers = formSections.map((el) => {
        const heading =
          (el.querySelector("h1, h2") as HTMLElement | null) ?? el;
        return ScrollTrigger.create({ trigger: heading, start: "center center" });
      });
      const morphTargetFor = (scroll: number) => {
        const a = headingTriggers.map((t) => t.start);
        const last = a.length - 1;
        if (scroll <= a[0]) return 0;
        if (scroll >= a[last]) return last;
        for (let i = 0; i < last; i++) {
          if (scroll >= a[i] && scroll < a[i + 1]) {
            const span = a[i + 1] - a[i] || 1;
            return i + (scroll - a[i]) / span;
          }
        }
        return last;
      };

      // Scroll progress -> module ref (read by the canvas later) + the top bar.
      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress, self.getVelocity());
          setMorphTarget(morphTargetFor(self.scroll()));
          if (barRef.current) {
            gsap.set(barRef.current, { scaleX: self.progress });
          }
        },
      });

      // --- A11y: screen-reader chapter announcer (settle-debounced) ---
      const sections = gsap.utils.toArray<HTMLElement>(
        "#main section[aria-labelledby]",
      );
      const total = sections.length;
      let activeIndex = -1;
      let announcedIndex = -1;
      const chapterTriggers = sections.map((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) activeIndex = i;
          },
        }),
      );
      let announceTimer: ReturnType<typeof setTimeout> | undefined;
      const announce = () => {
        if (activeIndex < 0 || activeIndex === announcedIndex) return;
        announcedIndex = activeIndex;
        const label =
          sections[activeIndex]?.querySelector("h1, h2")?.textContent?.trim() ??
          "";
        if (announcerRef.current) {
          announcerRef.current.textContent = `Section ${activeIndex + 1} of ${total}: ${label}`;
        }
      };
      const onScrollSettle = () => {
        if (announceTimer) clearTimeout(announceTimer);
        announceTimer = setTimeout(announce, 180);
      };
      lenis?.on("scroll", onScrollSettle);

      // --- A11y: keyboard scrolling (re-implemented because Lenis hijacks scroll) ---
      const onKey = (e: KeyboardEvent) => {
        const l = lenisRef.current?.lenis;
        if (!l || isTypingTarget(e.target)) return;
        const tag = (e.target as HTMLElement | null)?.tagName;
        const page = window.innerHeight * 0.9;
        let target: number | null = null;
        switch (e.key) {
          case "ArrowDown":
            target = l.scroll + 120;
            break;
          case "ArrowUp":
            target = l.scroll - 120;
            break;
          case "PageDown":
            target = l.scroll + page;
            break;
          case "PageUp":
            target = l.scroll - page;
            break;
          case " ":
            // don't steal Space from focused controls
            if (tag === "BUTTON" || tag === "A") return;
            target = l.scroll + page;
            break;
          case "Home":
            target = 0;
            break;
          case "End":
            target = l.limit;
            break;
          default:
            return;
        }
        e.preventDefault();
        l.scrollTo(target, { duration: 0.6 });
      };
      window.addEventListener("keydown", onKey);

      return () => {
        gsap.ticker.remove(raf);
        lenis?.off("scroll", ScrollTrigger.update);
        lenis?.off("scroll", onScrollSettle);
        window.removeEventListener("keydown", onKey);
        if (announceTimer) clearTimeout(announceTimer);
        chapterTriggers.forEach((t) => t.kill());
        headingTriggers.forEach((t) => t.kill());
        st.kill();
        delete (window as unknown as { __lenis?: unknown }).__lenis;
      };
    },
    { dependencies: [reduce], revertOnUpdate: true },
  );

  const announcer = (
    <div ref={announcerRef} aria-live="polite" className="sr-only" />
  );

  if (reduce)
    return (
      <>
        {announcer}
        {children}
      </>
    );

  return (
    <>
      {announcer}
      <div
        aria-hidden
        ref={barRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-accent"
      />
      <ReactLenis root options={{ autoRaf: false, anchors: true }} ref={lenisRef}>
        {children}
      </ReactLenis>
    </>
  );
}
