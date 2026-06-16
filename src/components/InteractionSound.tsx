"use client";

import { useEffect } from "react";
import { audio } from "@/lib/audio";

// Plays the airy hover tap when the pointer enters a link or button. One
// delegated listener instead of wiring every control. Silent unless sound is on
// (so it only ever follows a deliberate opt-in). No-op for touch / keyboard.
export function InteractionSound() {
  useEffect(() => {
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !audio.enabled) return;
      const el = (e.target as HTMLElement | null)?.closest("a, button");
      if (!el || el === last) return;
      last = el;
      audio.hoverButton();
    };
    const onOut = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a, button");
      if (el && el === last) last = null;
    };
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
    };
  }, []);

  return null;
}
