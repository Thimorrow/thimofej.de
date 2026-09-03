"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Batch scroll-reveal for any [data-reveal] block (fade + rise on enter).
// Skipped under reduced motion (content stays visible).
export function ScrollReveals() {
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!blocks.length) return;
      const triggers = blocks.map((block) => {
        const kids = Array.from(block.children) as HTMLElement[];
        gsap.set(kids, { autoAlpha: 0, y: 28 });
        return ScrollTrigger.create({
          trigger: block,
          start: "top 80%",
          once: true,
          onEnter: () =>
            gsap.to(kids, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.12,
              overwrite: true,
            }),
        });
      });
      ScrollTrigger.refresh();
      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    { dependencies: [reduce] },
  );

  return null;
}
