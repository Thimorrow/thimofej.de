"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { markIntroDone, markWorldReady, onWorldReady, setSkipFlight, introSeen, markIntroSeen } from "@/lib/intro";
import { audio } from "@/lib/audio";

export function EnterGate() {
  const rootRef = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const dialog = rootRef.current;
    if (!dialog) return;
    if (reduce || introSeen()) {
      setSkipFlight(true);
      markIntroDone();
      if (reduce) markWorldReady();
      return;
    }
    dialog.showModal();
    const unsubscribe = onWorldReady(() => dialog.close());
    return () => {
      unsubscribe();
      dialog.close();
    };
  }, [reduce]);

  const enter = (withSound = false, skip = false) => {
    if (withSound) void audio.start().catch(() => audio.mute());
    else audio.mute();
    setSkipFlight(skip);
    markIntroSeen();
    markIntroDone();
    if (skip) markWorldReady();
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => rootRef.current?.close(),
    });
  };

  return (
    <dialog ref={rootRef} aria-labelledby="entry-name" className="entry-gate" onCancel={(event) => { event.preventDefault(); enter(false, true); }}>
      <div className="entry-content">
        <p className="entry-role">AI engineer / frontend developer</p>
        <p id="entry-name" className="entry-name">Thimorrow.</p>
        <div className="entry-actions">
          <button type="button" className="entry-primary" onClick={() => enter()}>Enter →</button>
          <button type="button" className="entry-sound" onClick={() => enter(true)}>Enter with sound</button>
        </div>
        <button type="button" className="entry-skip" onClick={() => enter(false, true)}>Skip intro</button>
      </div>
    </dialog>
  );
}
