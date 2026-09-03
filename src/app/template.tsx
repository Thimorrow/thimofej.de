"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

// App Router template re-mounts on navigation -> gives every route a clean
// enter transition (home <-> /writing). Layout (canvas, nav) persists.
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, [reduce]);

  return <div ref={ref}>{children}</div>;
}
