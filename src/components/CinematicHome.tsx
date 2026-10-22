"use client";

import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasMount } from "./canvas/CanvasMount";
import { EnterGate } from "./EnterGate";
import { FlightCinema } from "./FlightCinema";
import { InteractionSound } from "./InteractionSound";
import { SiteNav } from "./SiteNav";
import { SkipLink } from "./SkipLink";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { audio } from "@/lib/audio";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function CinematicHome({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => () => audio.mute(), []);

  useGSAP(() => {
    if (reduce) return;
    const sections = gsap.utils.toArray<HTMLElement>(".home-section, .contact-section");
    const cleanups = sections.map((section) => {
      const pieces = section.querySelectorAll(".section-inner > *");
      const reveal = gsap.fromTo(pieces, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 88%", once: true },
      });
      // Keyboard navigation should never have to wait for an entrance.
      const showOnFocus = () => { reveal.progress(1); };
      section.addEventListener("focusin", showOnFocus);
      return () => section.removeEventListener("focusin", showOnFocus);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, { dependencies: [reduce], revertOnUpdate: true });

  return (
    <>
      <EnterGate />
      <CanvasMount />
      <SmoothScrollProvider>
        <SkipLink />
        <SiteNav />
        {children}
      </SmoothScrollProvider>
      <div aria-hidden data-intro-hide className="cinematic-edge cinematic-edge-top" />
      <div aria-hidden data-intro-hide className="cinematic-edge cinematic-edge-bottom" />
      <FlightCinema />
      <InteractionSound />
    </>
  );
}
