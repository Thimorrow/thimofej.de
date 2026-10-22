"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

// Sound stays off until the visitor chooses it. The shared engine keeps the
// toggle and the entry screen in sync.
export function SoundToggle() {
  const [on, setOn] = useState(audio.enabled);

  useEffect(() => {
    audio.arm();
    // Follow external flips too (the gate's "ohne Ton" path mutes directly).
    return audio.onChange(setOn);
  }, []);

  return (
    <button
      type="button"
      data-intro-hide
      onClick={() => setOn(audio.toggle())}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      className="sound-toggle fixed bottom-4 right-4 z-40 min-h-11 border border-line/20 bg-void/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-meta transition-colors hover:text-accent"
    >
      {on ? "sound ◉" : "sound ○"}
    </button>
  );
}
