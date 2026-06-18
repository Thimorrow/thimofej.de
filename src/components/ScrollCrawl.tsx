"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Star-Wars-Feel: jeder Content-Block ([data-reveal]) bleibt voll lesbar, solange
// er im Blick ist, und kippt erst beim Verlassen am oberen Rand leicht in die
// Perspektive und fadet weg, statt hart rauszuscrollen. Scrub-getrieben (folgt
// dem Scroll), reversibel, unter reduced motion komplett aus.
export function ScrollCrawl() {
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!blocks.length) return;
      const tweens = blocks.map((block) =>
        gsap.fromTo(
          block,
          { transformPerspective: 900, rotationX: 0, yPercent: 0, autoAlpha: 1 },
          {
            rotationX: 24,
            yPercent: -6,
            autoAlpha: 0,
            ease: "none",
            transformOrigin: "center center",
            scrollTrigger: {
              trigger: block,
              // erst wenn der Block oben anstößt -> bis er ganz raus ist
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        ),
      );
      ScrollTrigger.refresh();
      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    },
    { dependencies: [reduce] },
  );

  return null;
}
