"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Star-Wars-Feel ueber den ganzen Durchlauf: jeder Content-Block ([data-reveal])
// kommt von unten getiltet + gefadet rein, steht in der Mitte flach und voll
// lesbar (Hold), und kippt am oberen Rand wieder weg. Eine scrub-getriebene
// Timeline pro Block (eine Quelle fuer rotationX, kein Tween-Konflikt),
// reversibel. Unter reduced motion komplett aus -> Inhalt bleibt einfach sichtbar.
export function ScrollCrawl() {
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!blocks.length) return;
      const timelines = blocks.map((block) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: "top bottom", // Block taucht unten auf
            end: "bottom top", // Block ist oben ganz raus
            scrub: true,
          },
        });
        tl.fromTo(
          block,
          { transformPerspective: 900, rotationX: 24, yPercent: 8, autoAlpha: 0 },
          { rotationX: 0, yPercent: 0, autoAlpha: 1, ease: "none", duration: 1 },
        )
          .to(block, { duration: 2 }) // Hold: flach + lesbar in der Mitte
          .to(block, {
            rotationX: 24,
            yPercent: -6,
            autoAlpha: 0,
            ease: "none",
            duration: 1,
          });
        return tl;
      });
      ScrollTrigger.refresh();
      return () => {
        timelines.forEach((tl) => {
          tl.scrollTrigger?.kill();
          tl.kill();
        });
      };
    },
    { dependencies: [reduce] },
  );

  return null;
}
