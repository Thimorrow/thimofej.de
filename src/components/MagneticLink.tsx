"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type QuickTo = ReturnType<typeof gsap.quickTo>;

// A link that magnetically drifts toward the cursor on hover (Awwwards staple).
export function MagneticLink({
  href,
  children,
  className,
  ariaCurrent,
  strength = 0.4,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaCurrent?: "location";
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const xTo = useRef<QuickTo | null>(null);
  const yTo = useRef<QuickTo | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce && ref.current) gsap.set(ref.current, { x: 0, y: 0 });
    return () => {
      xTo.current?.tween.kill();
      yTo.current?.tween.kill();
      xTo.current = null;
      yTo.current = null;
    };
  }, [reduce]);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (reduce || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (!xTo.current)
      xTo.current = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    if (!yTo.current)
      yTo.current = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const r = el.getBoundingClientRect();
    xTo.current((e.clientX - (r.left + r.width / 2)) * strength);
    yTo.current((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    xTo.current?.(0);
    yTo.current?.(0);
  };

  return (
    <a
      ref={ref}
      href={href}
      className={className}
      aria-current={ariaCurrent}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  );
}
