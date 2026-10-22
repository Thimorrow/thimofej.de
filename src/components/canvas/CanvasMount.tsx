"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { markIntroDone, markWorldReady, setSkipFlight } from "@/lib/intro";

// The particle-morph hero, code-split and client-only.
const LiquidParticles = dynamic(() => import("./LiquidParticles"), {
  ssr: false,
});

function StaticFallback() {
  useEffect(() => {
    setSkipFlight(true);
    markIntroDone();
    markWorldReady();
    document.documentElement.classList.remove("canvas-ready", "intro-flying");
  }, []);
  return null;
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <StaticFallback /> : this.props.children; }
}

export function CanvasMount() {
  const reduce = useReducedMotion();

  // Reduced motion: no live WebGL — the static hero poster stays.
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <CanvasBoundary><LiquidParticles /></CanvasBoundary>
    </div>
  );
}
