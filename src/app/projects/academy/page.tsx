import type { Metadata } from "next";
import Link from "next/link";
import AcademyDemo from "@/components/academy/AcademyDemo";
import "./academy-project.css";

export const metadata: Metadata = {
  title: "yesterday Academy | Thimofej Zapko",
  description: "Mein Frontend-Beitrag zur yesterday Academy: vom Missionskatalog über den Chat bis zum Ergebnis. Ein Teamprojekt mit einer automatisch laufenden Produktdemo.",
  alternates: { canonical: "/projects/academy" },
  openGraph: { locale: "de_DE" },
};

const contributions = [
  { title: "Orientierung, bevor es losgeht.", label: "Missionskatalog", text: "Ein zeitlich geordneter Katalog mit Heute-Markierung. Und eine Seitenleiste, die zeigt, wer angemeldet ist. Daran habe ich im Team gearbeitet." },
  { title: "Platz für das Gespräch.", label: "Chat mit Tomo", text: "Der vollständige Chatverlauf bleibt zugänglich. Das Eingabefeld wächst mit dem Entwurf, lange Prompts brechen sauber um." },
  { title: "Ein Ergebnis zum Mitnehmen.", label: "Dokumente", text: "Kapitel klar voneinander trennen und Dokumente mit einem Klick kopieren. Damit die Arbeit nach der Mission weitergehen kann." },
];

export default function AcademyProject() {
  return (
    <main id="main" className="academy-page" lang="de">
      <a className="academy-skip" href="#preview">Zur Produktdemo</a>
      <header className="academy-header academy-frame">
        <Link className="academy-wordmark" href="/">thimofej.</Link>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation preserves the cross-document page transition. */}
        <a className="academy-back" href="/#academy"><span aria-hidden="true">↖</span> Zurück zum Spielraum</a>
      </header>
      <article>
        <section className="academy-intro academy-frame" aria-labelledby="academy-title">
          <div className="academy-intro-top">
            <h1 id="academy-title" className="academy-title"><span>yesterday</span><span>Academy.</span></h1>
            <div className="academy-intro-copy">
              <p className="academy-lede">KI lernen.<br/>An der eigenen Arbeit.</p>
              <p>Teams bearbeiten eigene Aufgaben, begleitet von KI-Tutor Tomo. Ich arbeite mit dem Team an der Oberfläche dafür.</p>
              <a className="academy-text-link" href="#beitrag">Mein Beitrag <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <dl className="academy-meta">
            <div><dt>Meine Rolle</dt><dd>Frontend im Team</dd></div>
            <div><dt>Produkt</dt><dd>Lernplattform mit KI-Tutor</dd></div>
            <div><dt>In der App</dt><dd>SvelteKit · TypeScript</dd></div>
          </dl>
        </section>
        <section id="preview" className="academy-preview academy-frame" aria-label="Automatische Produktdemo der Academy">
          <div className="academy-demo-preview"><AcademyDemo loop /></div>
          <div className="academy-preview-bottom">
            <p className="academy-caption">Ein Beispiel vom Katalog bis zum Dokument.<br/>Automatischer Demo-Ablauf mit Beispieldaten, ohne Live-KI.</p>
            <Link className="academy-text-link" href="/projects/academy/demo">Selbst ausprobieren <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
        <section id="beitrag" className="academy-story" aria-labelledby="contribution-title">
          <div className="academy-frame">
            <div className="academy-story-heading"><p className="academy-kicker">Mein Beitrag</p><h2 id="contribution-title" className="academy-section-title">Vom Katalog<br/>zum Dokument.</h2><p>Vom Finden der richtigen Mission bis zum fertigen Dokument: An diesen Stellen habe ich die Oberfläche mitentwickelt.</p></div>
            <ol className="academy-contributions">{contributions.map((item, index) => <li key={item.title}><div className="academy-contribution-label"><span>0{index + 1}</span><span>{item.label}</span></div><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol>
            <div className="academy-details"><span>Und dazwischen?</span><p>Einheitliche Buttons und Tooltips, verständlichere Fehler bei Direktlinks und Dialoge, die beim Laden nicht springen.</p></div>
          </div>
        </section>
      </article>
      <footer className="academy-footer academy-frame">
        <div><p className="academy-kicker">yesterday Academy</p><p className="academy-footer-title">Selbst einen Blick reinwerfen.</p></div>
        <a className="academy-text-link" href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">Zur Academy <span aria-hidden="true">↗</span><span className="academy-sr"> (öffnet einen neuen Tab)</span></a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation preserves the cross-document page transition. */}
        <a className="academy-back academy-footer-back" href="/#academy"><span aria-hidden="true">↖</span> Zurück zum Spielraum</a>
      </footer>
    </main>
  );
}
