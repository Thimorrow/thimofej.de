"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MagneticLink } from "@/components/MagneticLink";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#more", label: "Elsewhere" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    let sectionId = "top";
    let footerVisible = false;
    const update = () => setActiveSection(footerVisible ? "contact" : sectionId);
    const sections = [...document.querySelectorAll<HTMLElement>("#main > section")];
    let observer: IntersectionObserver;
    const observeSections = () => {
      observer?.disconnect();
      const visibleSections = new Set<Element>();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target);
          else visibleSections.delete(entry.target);
        });
        const visible = sections.filter((section) => visibleSections.has(section)).pop();
        if (visible) {
          sectionId = visible.id;
          update();
        }
      }, { rootMargin: `-${Math.round(innerHeight * .35)}px 0px -${Math.round(innerHeight * .55)}px 0px` });
      sections.forEach((section) => observer.observe(section));
    };
    observeSections();
    window.addEventListener("resize", observeSections);
    const footer = document.querySelector(".home-footer");
    const endObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting && entry.intersectionRatio === 1;
      update();
    }, { threshold: 1 });
    if (footer) endObserver.observe(footer);
    return () => {
      observer.disconnect();
      endObserver.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  return (
    <header className="site-navigation">
      {/* Wordmark — always top left, floats above the fade. */}
      <Link
        href="/"
        className="site-wordmark fixed left-6 top-5 z-50 font-mono text-sm uppercase tracking-[0.2em] text-text"
      >
        Thimorrow.
      </Link>

      {/* Desktop: vertical rail on the left edge, centred. Leaves the whole
          top area free for the opener. */}
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden h-dvh flex-col justify-center pl-6 lg:flex"
      >
        <ul className="pointer-events-auto flex flex-col gap-5">
          {links.map((l) => (
            <li key={l.href}>
              <MagneticLink
                href={l.href}
                ariaCurrent={activeSection === l.href.slice(1) ? "location" : undefined}
                strength={0.2}
                className="group flex min-h-11 items-center gap-3"
              >
                <span
                  aria-hidden
                  className="nav-marker h-px w-8 origin-left bg-text-meta"
                />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-meta transition-colors group-hover:text-accent">
                  {l.label}
                </span>
              </MagneticLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Project and contact anchors stay available on small screens. */}
      <nav
        aria-label="Primary"
        className="mobile-nav fixed right-4 top-5 z-40 lg:hidden"
      >
        <ul className="flex items-center gap-4">
          {links.filter((link) => link.href !== "#more").map((l) => (
            <li key={l.href}>
              <MagneticLink
                href={l.href}
                ariaCurrent={activeSection === l.href.slice(1) ? "location" : undefined}
                className="flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-text-meta transition-colors hover:text-accent"
              >
                {l.label}
              </MagneticLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
