import Image from "next/image";
import Link from "next/link";
import { ScrollReveals } from "@/components/ScrollReveals";
import { MagneticLink } from "@/components/MagneticLink";
import { HeroIntro } from "@/components/HeroIntro";

export default function Home() {
  return (
    <main id="main">
      <ScrollReveals />
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
          alt="Ein spiegelglattes Chrom Objekt, das in einer dunklen Leere schwebt."
          width={620}
          height={620}
          priority
          unoptimized
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] max-w-[82vw] -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        />
        {/* Readability scrim so the identity text stays legible over the cloud. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void/85 via-void/35 to-transparent"
        />
        <HeroIntro />
      </section>

      {/* WORK */}
      <section
        id="work"
        aria-labelledby="work-heading"
        className="relative border-t border-white/5 bg-[radial-gradient(130%_72%_at_50%_50%,rgba(7,10,18,0.9)_0%,rgba(7,10,18,0.55)_55%,rgba(7,10,18,0)_100%)]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            01 / Arbeit
          </p>
          <h2
            id="work-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Woran ich bau
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>
              Ich geh noch zur Schule. Nebenbei bau ich bei yesterday-ai, einem
              Studio mit einem klaren Prinzip:{" "}
              <em className="text-text">think human, build AI.</em> Wir machen aus
              echtem Wissen KI Agenten für Firmen, die keinen Bock mehr auf
              generische Chatbots haben.
            </p>
            <p>
              Und in der Zeit, die übrig bleibt, bau ich mein eigenes Zeug. Ich
              krieg fast alles gebaut, was ich mir ausdenke. Das Fertigmachen ist
              der harte Teil. Frag mich, worauf ich diese Woche grad abfahr.
            </p>
          </div>
          <div className="mt-12 space-y-8 border-t border-white/10 pt-10">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-meta">
              Ausgewählte Projekte
            </p>
            <div>
              <p className="font-display text-2xl text-text">E-Mail-Checker</p>
              <p className="mt-2 text-base text-text-muted">
                Mit 14 den AI Coding Hackathon im STARTPLATZ Köln gewonnen. Ein
                n8n Workflow, der dein Postfach in Sprachnachrichten verwandelt
                und dich per Stimme antworten lässt. Erster Kunde noch in
                derselben Woche.
              </p>
            </div>
            <div>
              <p className="font-display text-2xl text-text">yesterday-ai</p>
              <p className="mt-2 text-base text-text-muted">
                Wo ich Tag für Tag bau: KI Agenten, die echtes Wissen in Tools
                verwandeln, die Firmen wirklich nutzen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIFE */}
      <section
        id="life"
        aria-labelledby="life-heading"
        className="relative border-t border-white/5 bg-[radial-gradient(130%_72%_at_50%_50%,rgba(7,10,18,0.9)_0%,rgba(7,10,18,0.55)_55%,rgba(7,10,18,0)_100%)]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-warm">
            02 / Leben
          </p>
          <h2
            id="life-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Wer ich bin
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>Ich bin Thimofej, 15, und ich hab mir das Bauen selbst beigebracht.</p>
            <p>
              Angefangen hat es mit einem Hackathon. Ehrlich, totales Anfänger
              Zeug. Aber genau da hat Tech mich gepackt und nicht mehr
              losgelassen. Seitdem geht mir eine Frage nicht mehr aus dem Kopf:{" "}
              <em className="text-warm-text">was kann KI wirklich werden?</em> Und
              während ich dem nachgeh, arbeite ich auch an einer besseren Version
              von mir.
            </p>
            <p>
              Ich fang viel zu viel an und bring das meiste nie zu Ende. Aber das,
              was ich fertig mach, das mach ich <em className="text-warm-text">richtig</em>{" "}
              gut.
            </p>
          </div>
        </div>
      </section>

      {/* LIKES */}
      <section
        id="likes"
        aria-labelledby="likes-heading"
        className="relative border-t border-white/5 bg-[radial-gradient(130%_72%_at_50%_50%,rgba(7,10,18,0.9)_0%,rgba(7,10,18,0.55)_55%,rgba(7,10,18,0)_100%)]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-warm">
            03 / Mag ich
          </p>
          <h2
            id="likes-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Was ich mag
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
            <p>
              Das Wichtigste zuerst: ich liebe Jesus Christus, und Er liebt mich.
              Alles andere, was ich bau, steht darauf.
            </p>
            <p>
              Der Rest von mir, ehrlich: Kirche, Sport und viel zu viel
              Doomscrolling (arbeite dran). Musik hör ich kaum. Worauf ich
              wirklich hinarbeite, ist kein Hobby, sondern ein besserer Mensch zu
              werden.
            </p>
            <p>
              Zwei unbeliebte Meinungen, weil du schon mal hier bist:{" "}
              <em className="text-warm-text">Mbappé ist überbewertet</em>, und Glauben
              sollten die Leute viel ernster nehmen.
            </p>
            <p>Und der beste Döner der Stadt? Ali Baba. Ende der Diskussion.</p>
          </div>
        </div>
      </section>

      {/* WRITING */}
      <section
        id="writing"
        aria-labelledby="writing-heading"
        className="relative border-t border-white/5 bg-[radial-gradient(130%_72%_at_50%_50%,rgba(7,10,18,0.9)_0%,rgba(7,10,18,0.55)_55%,rgba(7,10,18,0)_100%)]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            04 / Schreiben
          </p>
          <h2
            id="writing-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Schreiben
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-text-muted">
            Notizen, halbe Gedanken, Sachen, die ich öffentlich für mich sortier.
          </p>
          <Link
            href="/writing"
            className="mt-6 inline-block font-mono text-sm uppercase tracking-widest text-accent underline-offset-4 hover:underline"
          >
            Notizen lesen →
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="relative border-t border-white/5 bg-[radial-gradient(130%_72%_at_50%_50%,rgba(7,10,18,0.9)_0%,rgba(7,10,18,0.55)_55%,rgba(7,10,18,0)_100%)]"
      >
        <div data-reveal className="mx-auto max-w-3xl px-6 py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            05 / Kontakt
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-display text-4xl font-light sm:text-5xl"
          >
            Lass uns reden
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-text-muted">
            Du baust was, suchst jemanden oder willst einfach Hallo sagen? Mein
            Postfach ist offen.
          </p>
          <MagneticLink
            href="mailto:thimofej@yesterday-ai.de"
            className="mt-6 inline-block font-display text-2xl text-text underline decoration-accent decoration-1 underline-offset-8 transition-colors hover:text-accent sm:text-3xl"
          >
            thimofej@yesterday-ai.de
          </MagneticLink>
        </div>
      </section>
    </main>
  );
}
