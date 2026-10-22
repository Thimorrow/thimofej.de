import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CinematicHome } from "@/components/CinematicHome";
import { HeroIntro } from "@/components/HeroIntro";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Thimofej Zapko",
    locale: "en_US",
    url: "/",
  },
};

const profile = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://thimofej.de/#website",
      url: "https://thimofej.de/",
      name: "Thimofej Zapko",
      alternateName: ["Thimofej", "Thimorrow", "thimofej.de"],
      publisher: { "@id": "https://thimofej.de/#person" },
    },
    {
      "@type": "ProfilePage",
      "@id": "https://thimofej.de/#profile",
      url: "https://thimofej.de/",
      name: "Thimofej Zapko | AI engineer & frontend developer",
      isPartOf: { "@id": "https://thimofej.de/#website" },
      mainEntity: { "@id": "https://thimofej.de/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://thimofej.de/#person",
      name: "Thimofej Zapko",
      givenName: "Thimofej",
      familyName: "Zapko",
      alternateName: ["Thimofej", "Thimorrow"],
      url: "https://thimofej.de/",
      jobTitle: "AI engineer & frontend developer",
      description: "Thimofej Zapko builds frontend experiences with AI and works as a frontend developer at yesterday.",
      sameAs: ["https://github.com/thimorrow", "https://x.com/thimorrowr"],
    },
  ],
};

export default function Home() {
  return (
    <CinematicHome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profile).replace(/</g, "\\u003c"),
        }}
      />
      <main id="main" tabIndex={-1}>
        <section id="top" data-morph="0" aria-labelledby="hero-heading" className="hero-section">
          <Image data-hero-poster src="/poster/hero-monogram.svg" alt="" width={620} height={620} priority unoptimized className="hero-poster" />
          <div aria-hidden data-intro-hide className="hero-scrim" />
          <HeroIntro />
        </section>

        <section id="projects" data-morph="1" aria-labelledby="projects-title" className="section-veil home-section">
          <div className="section-inner">
            <div className="chapter-heading"><h2 id="projects-title">things I&apos;ve built</h2><span>selected work</span></div>
            <div className="work-intro">
              <p>I&apos;m currently working as a frontend developer at yesterday, where I&apos;m building our Academy app with SvelteKit.</p>
              <p className="project-status">The Academy app is currently in progress. A link will follow soon.</p>
            </div>
            <Link href="/projects/academy" className="project-link">
              <span className="project-year">26</span>
              <div><h3>Academy app</h3><p>A learning platform I am building with the team at yesterday.</p></div>
              <span className="project-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section id="more" data-morph="2" aria-labelledby="more-title" className="section-veil home-section more-section">
          <div className="section-inner">
            <div className="chapter-heading"><h2 id="more-title">more</h2><span>elsewhere</span></div>
            <p className="elsewhere-copy">I also go by Thimorrow online. You can find me on <a className="inline-link" href="https://x.com/thimorrowr">X</a> and <a className="inline-link" href="https://github.com/thimorrow">GitHub</a>, or see more of my work in <a className="inline-link" href="#projects">my projects</a>.</p>
          </div>
        </section>

        <section id="contact" data-morph="3" aria-labelledby="contact-title" className="section-veil contact-section">
          <div className="section-inner">
            <h2 id="contact-title">Want to say hello?</h2>
            <a className="contact-email" href="mailto:thimofej@yesterday-ai.de">thimofej@yesterday-ai.de<span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>
      <footer className="home-footer"><span>© 2026 Thimofej Zapko · Thimorrow</span></footer>
    </CinematicHome>
  );
}
