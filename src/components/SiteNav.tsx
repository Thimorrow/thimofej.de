import Link from "next/link";
import { MagneticLink } from "@/components/MagneticLink";

const links = [
  { href: "#work", label: "Arbeit" },
  { href: "#life", label: "Leben" },
  { href: "#likes", label: "Mag ich" },
  { href: "#writing", label: "Schreiben" },
  { href: "#contact", label: "Kontakt" },
];

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
      >
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-[0.3em] text-text"
        >
          Thimofej
        </Link>
        {/* Anchor nav on >=sm; on mobile the page is read by scrolling
            (a full mobile menu is a Phase 2 item). */}
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
