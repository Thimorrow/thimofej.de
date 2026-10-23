import type { Metadata } from "next";
import Link from "next/link";
import AcademyDemo from "@/components/academy/AcademyDemo";
import "./academy-project.css";

export const metadata: Metadata = {
  title: "yesterday Academy | Thimofej Zapko",
  description: "Mein Frontend-Beitrag zur yesterday Academy: vom Missionskatalog über den Chat bis zum Ergebnis. Ein Teamprojekt mit interaktiver Produktdemo.",
  alternates: { canonical: "/projects/academy" },
  openGraph: { locale: "de_DE" },
};

const contributions = [
  { title: "Die nächste Mission finden.", text: "Ich habe am zeitlich geordneten Missionskatalog mit Heute-Markierung gearbeitet und daran, dass die Seitenleiste zeigt, wer angemeldet ist." },
  { title: "Im Gespräch bleiben.", text: "Den vollständigen Chatverlauf zugänglich machen, das Eingabefeld mit dem Entwurf wachsen lassen und lange Prompts sauber umbrechen: kleine Änderungen an einem zentralen Ort." },
  { title: "Das Ergebnis mitnehmen.", text: "Dokumente mit einem Klick kopieren und Kapitel im Ergebnis klar voneinander trennen. Damit die Arbeit nach der Mission weitergehen kann." },
  { title: "Auch dazwischen aufpassen.", text: "Einheitliche Buttons und Tooltips, verständlichere Fehler bei Direktlinks und Dialoge, deren Höhe beim Laden stabil bleibt. Diese Details gehören für mich zur Oberfläche dazu." },
];

export default function AcademyProject() {
  return (
    <main id="main" className="academy-page" lang="de">
      <header className="academy-header academy-frame">
        <Link className="academy-wordmark" href="/">Thimorrow.</Link>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation preserves the cross-document page transition. */}
        <a className="academy-back" href="/#academy"><span aria-hidden="true">↖</span> Zurück</a>
      </header>
      <article>
        <section className="academy-intro academy-frame" aria-labelledby="academy-title">
          <h1 id="academy-title" className="academy-title"><span>yesterday</span><span>Academy.</span></h1>
          <div className="academy-intro-bottom">
            <dl className="academy-meta">
              <div><dt>Mein Beitrag</dt><dd>Frontend im Team</dd></div>
              <div><dt>In der App</dt><dd>SvelteKit · TypeScript</dd></div>
            </dl>
            <div className="academy-intro-copy">
              <p className="academy-lede">KI lernen an der eigenen Arbeit.</p>
              <p>Zwischen den Trainingstagen bearbeiten Teams eigene Aufgaben, begleitet von KI-Tutor Tomo. Ich entwickle mit dem Team die Oberfläche dafür: vom Missionskatalog bis zum Dokument.</p>
              <a className="academy-text-link" href="#preview">Selbst ausprobieren <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>
        <section id="preview" className="academy-preview" aria-labelledby="preview-title">
          <div className="academy-frame">
            <div className="academy-preview-heading">
              <div><p className="academy-kicker">Ein Blick ins Produkt</p><h2 id="preview-title" className="academy-section-title">Vom Gespräch zum Ergebnis.</h2></div>
              <Link className="academy-text-link" href="/projects/academy/demo">Demo im Vollformat <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="academy-demo-preview"><AcademyDemo /></div>
            <p className="academy-caption">Interaktive Nachbildung mit festem Demo-Ablauf, ohne Live-KI. Deine Eingaben bleiben in diesem Browser und gehen beim Neuladen verloren.</p>
          </div>
        </section>
        <section className="academy-story academy-frame" aria-labelledby="contribution-title">
          <div className="academy-story-heading">
            <p className="academy-kicker">Mein Beitrag</p>
            <h2 id="contribution-title" className="academy-section-title">Vom Katalog bis zum Kopieren.</h2>
          </div>
          <ol className="academy-contributions">{contributions.map((item, index) => <li key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
        </section>
      </article>
      <footer className="academy-footer academy-frame">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation preserves the cross-document page transition. */}
        <a className="academy-back" href="/#academy"><span aria-hidden="true">↖</span> Zurück zum Spielraum</a>
        <a className="academy-text-link" href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">Zur Academy <span aria-hidden="true">↗</span><span className="academy-sr"> (öffnet einen neuen Tab)</span></a>
      </footer>
    </main>
  );
}
