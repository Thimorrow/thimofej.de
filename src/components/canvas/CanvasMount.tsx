"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The particle-morph hero, code-split and client-only.
const LiquidParticles = dynamic(() => import("./LiquidParticles"), {
  ssr: false,
});

export function CanvasMount() {
  const reduce = useReducedMotion();

  // Reduced motion: no live WebGL — the static hero poster stays.
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <LiquidParticles />
    </div>
  );
}
