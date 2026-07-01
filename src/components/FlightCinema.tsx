"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  onFlightStart,
  onArrive,
  requestFlightSkip,
  FLIGHT_SEGS,
} from "@/lib/intro";

gsap.registerPlugin(useGSAP);

// The cinematic layer over the particle flight: letterbox bars, a three-beat
// story in captions (the universe -> Bochum -> my room), and a visible skip.
// Keys off flightStart/arrive, so the skip paths (returning visitor, reduced
// motion) never see any of it. Caption timings derive from FLIGHT_SEGS, the
// same constants that drive the camera, so the words land on the scenes.
const CAPTIONS = [
  "The universe. Pretty big.",
  "Bochum. Pretty small.",
  "My room. Where things get built.",
];

export function FlightCinema() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const bars = root.querySelectorAll<HTMLElement>("[data-cine-bar]");
      const captions = root.querySelectorAll<HTMLElement>("[data-cine-caption]");
      const skip = root.querySelector<HTMLElement>("[data-cine-skip]");
      let tl: gsap.core.Timeline | null = null;

      // Scene beats on the flight clock: t1 = over Saturn, t2 = city, t3 = window.
      const t1 = FLIGHT_SEGS[0];
      const t2 = t1 + FLIGHT_SEGS[1];
      const t3 = t2 + FLIGHT_SEGS[2];
      const beats: Array<[number, number]> = [
        [0.5, t1 + 0.7], // space caption, while the system + Saturn fill the frame
        [t2 - 0.6, t2 + 1.8], // city caption, as the skyline arrives
        [t3 - 0.2, t3 + 1.8], // room caption, through the window
      ];

      const start = () => {
        setFlying(true);
        tl?.kill();
        gsap.set(captions, { autoAlpha: 0 });
        tl = gsap.timeline();
        tl.set(root, { autoAlpha: 1 }, 0);
        tl.fromTo(
          bars,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.9, ease: "power3.out" },
          0,
        );
        tl.fromTo(
          skip,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6 },
          1.2,
        );
        captions.forEach((el, i) => {
          const [inAt, outAt] = beats[i];
          tl!
            .fromTo(
              el,
              { autoAlpha: 0, y: 14 },
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
              inAt,
            )
            .to(el, { autoAlpha: 0, y: -10, duration: 0.6, ease: "power2.in" }, outAt);
        });
      };

      const end = () => {
        setFlying(false);
        tl?.kill();
        tl = gsap.timeline();
        tl.to([...captions, skip], { autoAlpha: 0, duration: 0.3 }, 0)
          .to(bars, { scaleY: 0, duration: 0.8, ease: "power3.inOut" }, 0)
          .set(root, { autoAlpha: 0 });
      };

      const unsubStart = onFlightStart(start);
      const unsubArrive = onArrive(end);
      return () => {
        unsubStart();
        unsubArrive();
        tl?.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden={!flying}
      className="pointer-events-none invisible fixed inset-0 z-40 opacity-0"
    >
      {/* Letterbox: true black over the void, so the flight reads as film. */}
      <div
        data-cine-bar
        className="absolute inset-x-0 top-0 h-[9vh] origin-top bg-black"
      />
      <div
        data-cine-bar
        className="absolute inset-x-0 bottom-0 h-[9vh] origin-bottom bg-black"
      />

      {/* The three story beats, centred just above the lower bar. */}
      <div className="absolute inset-x-0 bottom-[12vh] px-6 text-center">
        {CAPTIONS.map((text) => (
          <p
            key={text}
            data-cine-caption
            className="absolute inset-x-0 font-display text-xl font-light italic tracking-wide text-text opacity-0 [text-shadow:var(--caption-glow)] sm:text-3xl"
          >
            {text}
          </p>
        ))}
      </div>

      <button
        type="button"
        data-cine-skip
        onClick={() => requestFlightSkip()}
        tabIndex={flying ? 0 : -1}
        className="pointer-events-auto absolute bottom-[3vh] right-6 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-text-meta opacity-0 transition-colors hover:text-accent"
      >
        Skip →
      </button>
    </div>
  );
}
