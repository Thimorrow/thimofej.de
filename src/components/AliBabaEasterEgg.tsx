"use client";

import { useEffect, useRef, useState } from "react";

const SEQ = "alibaba";

// Hidden easter egg: type the magic word, get the döner. (Its private meaning
// stays exactly that — private. Nothing on screen ever explains it.)
export function AliBabaEasterEgg() {
  const [show, setShow] = useState(false);
  const bufRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      bufRef.current = (bufRef.current + e.key.toLowerCase()).slice(-SEQ.length);
      if (bufRef.current === SEQ) {
        setShow(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShow(false), 4200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-warm/30 bg-void/80 px-5 py-2.5 font-mono text-xs tracking-wide text-warm-text backdrop-blur-md"
    >
      🥙 Ali Baba: best döner in town.
    </div>
  );
}
