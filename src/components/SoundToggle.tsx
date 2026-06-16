"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

// Ambient sound is on by default; synthesis lives in the shared audio engine so
// the canvas can play in-sync cues through the same AudioContext. This button
// mirrors and flips the state; arm() makes the drone start on the first gesture.
export function SoundToggle() {
  const [on, setOn] = useState(audio.enabled);

  useEffect(() => {
    audio.arm();
  }, []);

  return (
    <button
      type="button"
      data-intro-hide
      onClick={() => setOn(audio.toggle())}
      aria-pressed={on}
      aria-label={on ? "Hintergrundton ausschalten" : "Hintergrundton einschalten"}
      className="fixed bottom-4 right-4 z-40 rounded-full border border-white/10 bg-void/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-meta backdrop-blur-md transition-colors hover:text-accent"
    >
      {on ? "sound ◉" : "sound ○"}
    </button>
  );
}
