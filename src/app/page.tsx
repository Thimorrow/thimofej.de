import Image from "next/image";
import Link from "next/link";
import { ScrollCrawl } from "@/components/ScrollCrawl";
import { MagneticLink } from "@/components/MagneticLink";
import { HeroIntro } from "@/components/HeroIntro";

export default function Home() {
  return (
    <main id="main">
      <ScrollCrawl />
      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden px-6 pb-20 text-center"
      >
        {/* Fallback poster: the LCP element and the no-JS / reduced-motion
            visual. Crossfades out once the live canvas paints. */}
        <Image
          data-hero-poster
          src="/poster/hero-placeholder.svg"
          alt="A mirror-smooth chrome object floating in a dark void."
          width={620}
          height={620}
          priority
          unoptimized
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] max-w-[82vw] -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        />
        {/* Readability scrim so the identity text stays legible over the cloud.
            Hidden during the intro flight — otherwise it reads as a big dark
            bar over the bottom half of the cinematic. */}
        <div
          aria-hidden
          data-intro-hide
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void/85 via-void/35 to-transparent"
        />
        <HeroIntro />
      </section>

      {/* WORK */}
      <section
        id="work"
        aria-labelledby="work-heading"
        className="section-veil relative border-t border-line/5 backdrop-blur-[2px]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            01 / Work
          </p>
          <h2
            id="work-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            What I build
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>
              I&apos;m still in school. On the side I build at yesterday-ai, a
              studio with one clear principle:{" "}
              <em className="text-text">think human, build AI.</em> We turn real
              knowledge into AI agents for companies that are done with generic
              chatbots.
            </p>
            <p>
              And in whatever time is left, I build my own stuff. I can build
              almost anything I come up with. Finishing is the hard part. Ask me
              what I&apos;m obsessed with this week.
            </p>
          </div>
          <div className="mt-12 border-t border-line/10 pt-10">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-meta">
              Selected projects
            </p>
            <div className="group/list mt-2">
              <div className="border-b border-line/10 py-8 transition-opacity duration-300 group-hover/list:opacity-50 hover:!opacity-100">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  Hackathon winner · STARTPLATZ Cologne · at 14
                </p>
                <p className="mt-3 font-display text-2xl text-text">
                  Email checker
                </p>
                <p className="mt-2 text-base text-text-muted">
                  An n8n workflow that turns your inbox into voice messages and
                  lets you reply with your voice. First customer that same week.
                </p>
              </div>
              <a
                href="https://yesterday-ai.de"
                target="_blank"
                rel="noopener noreferrer"
                className="group/item block border-b border-line/10 py-8 transition-opacity duration-300 group-hover/list:opacity-50 hover:!opacity-100"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  Studio · think human, build AI
                </p>
                <p className="mt-3 font-display text-2xl text-text">
                  yesterday-ai
                  <span
                    aria-hidden
                    className="ml-3 inline-block text-accent opacity-0 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:opacity-100"
                  >
                    →
                  </span>
                </p>
                <p className="mt-2 text-base text-text-muted">
                  Where I build day after day: AI agents that turn real
                  knowledge into tools companies actually use.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LIFE */}
      <section
        id="life"
        aria-labelledby="life-heading"
        className="section-veil relative border-t border-line/5 backdrop-blur-[2px]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-warm">
            02 / Life
          </p>
          <h2
            id="life-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Who I am
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>I&apos;m Thimofej, 15, and I taught myself how to build.</p>
            <p>
              It started with a hackathon. Honestly, total beginner stuff. But
              that&apos;s exactly where tech grabbed me and never let go. Since
              then one question won&apos;t leave my head:{" "}
              <em className="text-warm-text">what can AI really become?</em> And
              while I chase that, I&apos;m also working on a better version of
              myself.
            </p>
            <p>
              I start way too many things and never finish most of them. But
              what I do finish, I make{" "}
              <em className="text-warm-text">really</em> good.
            </p>
          </div>
        </div>
      </section>

      {/* LIKES */}
      <section
        id="likes"
        aria-labelledby="likes-heading"
        className="section-veil relative border-t border-line/5 backdrop-blur-[2px]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-warm">
            03 / Likes
          </p>
          <h2
            id="likes-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            What I like
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>
              First things first: I love Jesus Christ, and He loves me.
              Everything else I build stands on that.
            </p>
            <p>
              The rest of me, honestly: church, sports and way too much
              doomscrolling (working on it). I barely listen to music. And what
              I&apos;m really working toward isn&apos;t a hobby, it&apos;s
              becoming a better person.
            </p>
            <p>
              Two unpopular opinions, since you&apos;re already here:{" "}
              <em className="text-warm-text">Mbappé is overrated</em>, and people
              should take faith a lot more seriously.
            </p>
            <p>And the best döner in town? Ali Baba. End of discussion.</p>
          </div>
        </div>
      </section>

      {/* WRITING */}
      <section
        id="writing"
        aria-labelledby="writing-heading"
        className="section-veil relative border-t border-line/5 backdrop-blur-[2px]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            04 / Writing
          </p>
          <h2
            id="writing-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Writing
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-text-muted">
            Notes, half-formed thoughts, things I sort out for myself in public.
          </p>
          <Link
            href="/writing"
            className="mt-6 inline-block font-mono text-sm uppercase tracking-widest text-accent underline-offset-4 hover:underline"
          >
            Read the notes →
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="section-veil relative border-t border-line/5 backdrop-blur-[2px]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            05 / Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Let&apos;s talk
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-text-muted">
            You&apos;re building something, looking for someone, or just want to
            say hi? My inbox is open.
          </p>
          <MagneticLink
            href="mailto:thimofej@yesterday-ai.de"
            className="mt-8 inline-block break-all font-display text-2xl text-text underline decoration-accent decoration-1 underline-offset-8 transition-colors hover:text-accent sm:text-4xl lg:text-5xl"
          >
            thimofej@yesterday-ai.de
          </MagneticLink>
        </div>
      </section>
    </main>
  );
}
