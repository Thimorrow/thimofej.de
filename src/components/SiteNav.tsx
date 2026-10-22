import Link from "next/link";
import { MagneticLink } from "@/components/MagneticLink";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#more", label: "Elsewhere" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header>
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
        className="fixed left-0 top-0 z-40 hidden h-dvh flex-col justify-center pl-6 lg:flex"
      >
        <ul className="flex flex-col gap-5">
          {links.map((l) => (
            <li key={l.href}>
              <MagneticLink
                href={l.href}
                strength={0.2}
                className="group flex min-h-11 items-center gap-3"
              >
                <span
                  aria-hidden
                  className="h-px w-4 bg-text-meta transition-all duration-300 ease-out group-hover:w-8 group-hover:bg-accent"
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
