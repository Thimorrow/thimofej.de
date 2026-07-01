import Link from "next/link";
import { MagneticLink } from "@/components/MagneticLink";

const links = [
  { href: "#work", label: "Work" },
  { href: "#life", label: "Life" },
  { href: "#likes", label: "Likes" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header>
      {/* Wordmark — always top left, floats above the fade. */}
      <Link
        href="/"
        className="fixed left-6 top-5 z-50 font-mono text-sm uppercase tracking-[0.3em] text-text"
      >
        Thimofej
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
                className="group flex items-center gap-3"
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

      {/* Mobile/tablet: horizontal bar top right (a full mobile menu is
          phase 2). */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-40 flex justify-end px-6 py-5 lg:hidden"
      >
        <ul className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <MagneticLink
                href={l.href}
                className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-text-meta transition-colors hover:text-accent"
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
