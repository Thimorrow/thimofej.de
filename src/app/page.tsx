import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CinematicHome } from "@/components/CinematicHome";
import { HeroIntro } from "@/components/HeroIntro";
import { MagneticLink } from "@/components/MagneticLink";
import { SiteIcon } from "@/components/SiteIcon";

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
      sameAs: [
        "https://github.com/thimorrow",
        "https://x.com/thimorrowr",
        "https://www.instagram.com/thimofej_zapko/",
      ],
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
            <div className="chapter-heading"><h2 id="projects-title">things I&apos;ve built</h2><span>01 / selected work</span></div>
            <div className="work-intro">
              <p>I&apos;m currently working as a frontend developer at yesterday, where I&apos;m building our Academy app with SvelteKit.</p>
            </div>
            <Link href="/projects/academy" className="project-link">
              <div className="project-art" aria-hidden="true">
                <span className="project-art-label">yesterday / learning platform</span>
                <span className="project-orbit project-orbit-outer" />
                <span className="project-orbit project-orbit-inner" />
                <span className="project-art-word">Academy<span>.</span></span>
                <span className="project-art-note">A place to learn. A space to build.</span>
              </div>
              <span className="project-year">26</span>
              <div className="project-copy"><h3>Academy app</h3><p>A learning platform I am building with the team at yesterday.</p><div className="project-meta"><span>SvelteKit</span><span>In progress</span></div></div>
              <SiteIcon name="arrow-up-right" className="project-arrow" />
            </Link>
          </div>
        </section>

        <section id="more" data-morph="2" aria-labelledby="more-title" className="section-veil home-section more-section">
          <div className="section-inner">
            <div className="chapter-heading"><h2 id="more-title">a little more</h2><span>02 / elsewhere</span></div>
            <p className="elsewhere-copy">I also go by Thimorrow online. Here&apos;s where you can find what I&apos;m building and thinking about.</p>
            <div className="elsewhere-links">
              <a href="https://github.com/thimorrow" className="elsewhere-link">
                <span className="elsewhere-link-label">Code & projects</span>
                <span className="elsewhere-link-name">GitHub<SiteIcon name="arrow-up-right" /></span>
                <span className="elsewhere-link-handle">@thimorrow</span>
              </a>
              <a href="https://x.com/thimorrowr" className="elsewhere-link">
                <span className="elsewhere-link-label">Thoughts & updates</span>
                <span className="elsewhere-link-name">X<SiteIcon name="arrow-up-right" /></span>
                <span className="elsewhere-link-handle">@thimorrowr</span>
              </a>
            </div>
          </div>
        </section>

        <section id="contact" data-morph="3" aria-labelledby="contact-title" className="section-veil contact-section">
          <div className="section-inner">
            <p className="contact-eyebrow">03 / get in touch</p>
            <h2 id="contact-title">Good things start<br />with a hello<span>.</span></h2>
            <p className="contact-copy">Have an idea, a question, or just want to talk? I&apos;d love to hear from you.</p>
            <MagneticLink className="contact-email" href="mailto:thimofej@yesterday-ai.de" strength={0.18}><span className="contact-address">thimofej@yesterday-ai.de</span><SiteIcon name="arrow-up-right" className="contact-arrow" /></MagneticLink>
          </div>
        </section>
      </main>
      <footer className="home-footer"><span>© 2026 Thimofej Zapko · Thimorrow</span></footer>
    </CinematicHome>
  );
}
