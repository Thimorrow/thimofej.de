"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { onFlightStart, onArrive, requestFlightSkip } from "@/lib/intro";

gsap.registerPlugin(useGSAP);

export function FlightCinema() {
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [flying, setFlying] = useState(false);

  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;
    const bars = root.querySelectorAll<HTMLElement>("[data-cine-bar]");
    let timeline: gsap.core.Timeline | null = null;
    let locked: Array<{ element: HTMLElement; inert: boolean }> = [];
    const unlock = () => {
      locked.forEach(({ element, inert }) => { element.inert = inert; });
      locked = [];
    };
    const start = () => {
      unlock();
      locked = [...document.querySelectorAll<HTMLElement>("header, #main, [data-intro-hide], .home-footer")].map(element => ({ element, inert: element.inert }));
      locked.forEach(({ element }) => { element.inert = true; });
      setFlying(true);
      timeline?.kill();
      timeline = gsap.timeline().set(root, { autoAlpha: 1 }).fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power3.out" }).call(() => skipRef.current?.focus(), [], 0.5);
    };
    const end = () => {
      unlock();
      if (document.activeElement === skipRef.current) document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
      setFlying(false);
      timeline?.kill();
      timeline = gsap.timeline().to(bars, { scaleY: 0, duration: 0.8, ease: "power3.inOut" }).set(root, { autoAlpha: 0 });
    };
    const unsubscribeStart = onFlightStart(start);
    const unsubscribeArrive = onArrive(end);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.documentElement.classList.contains("intro-flying")) requestFlightSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => { unsubscribeStart(); unsubscribeArrive(); timeline?.kill(); unlock(); window.removeEventListener("keydown", onKey); };
  }, { scope: rootRef });

  return (
    <div ref={rootRef} aria-hidden={!flying} className="pointer-events-none invisible fixed inset-0 z-40 opacity-0">
      <div aria-hidden data-cine-bar className="absolute inset-x-0 top-0 h-[9vh] origin-top bg-black" />
      <div aria-hidden data-cine-bar className="absolute inset-x-0 bottom-0 h-[9vh] origin-bottom bg-black" />
      <button ref={skipRef} type="button" onClick={() => requestFlightSkip()} tabIndex={flying ? 0 : -1} className="pointer-events-auto absolute bottom-[2vh] right-6 z-10 min-h-11 px-3 font-mono text-xs uppercase tracking-[0.15em] text-text transition-colors hover:text-accent">Skip intro →</button>
    </div>
  );
}
