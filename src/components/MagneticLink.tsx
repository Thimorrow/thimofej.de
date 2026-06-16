"use client";

import { useRef } from "react";
import gsap from "gsap";

type QuickTo = ReturnType<typeof gsap.quickTo>;

// A link that magnetically drifts toward the cursor on hover (Awwwards staple).
export function MagneticLink({
  href,
  children,
  className,
  strength = 0.4,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const xTo = useRef<QuickTo | null>(null);
  const yTo = useRef<QuickTo | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
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
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  );
}
