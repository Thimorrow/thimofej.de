"use client";

import { useEffect } from "react";
import { CanvasMount } from "./canvas/CanvasMount";
import { EnterGate } from "./EnterGate";
import { FlightCinema } from "./FlightCinema";
import { InteractionSound } from "./InteractionSound";
import { SiteNav } from "./SiteNav";
import { SkipLink } from "./SkipLink";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { audio } from "@/lib/audio";

export function CinematicHome({ children }: { children: React.ReactNode }) {
  useEffect(() => () => audio.mute(), []);

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
