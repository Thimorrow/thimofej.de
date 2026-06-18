"use client";

import { requestReplay } from "@/lib/intro";
import { scrollProgress } from "@/lib/scrollProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Lets the visitor watch the cinematic intro again. The flight auto-plays only
// once ever (localStorage), so this is the only way back in. Hidden under
// reduced motion, where there is no flight to replay.
export function ReplayIntro() {
  const reduce = useReducedMotion();

  const replay = () => {
    const lenis = (
      window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }
    ).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    // Pin progress to the top so the flight's scroll-cutoff doesn't fire on the
    // first frame before ScrollTrigger catches up.
    scrollProgress.progress = 0;
    requestAnimationFrame(() => requestReplay());
  };

  if (reduce) return null;

  return (
    <button
      type="button"
      data-intro-hide
      onClick={replay}
      aria-label="Intro erneut abspielen"
      className="fixed bottom-4 left-4 z-40 rounded-full border border-white/10 bg-void/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-meta backdrop-blur-md transition-colors hover:text-accent"
    >
      ↻ intro
    </button>
  );
}
