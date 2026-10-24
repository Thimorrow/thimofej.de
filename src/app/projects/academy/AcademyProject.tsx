import Link from "next/link";
import AcademyPreview from "@/components/academy/AcademyPreview";
import "./academy-project.css";

const englishContributions = [
  { title: "Finding your bearings.", label: "Mission catalog", text: "A catalog organized by date, with a marker for today. And a sidebar that shows who is signed in. I worked on these with the team." },
  { title: "Room for the conversation.", label: "Chat with Tomo", text: "The full conversation stays accessible. The input grows with your draft, and long prompts wrap cleanly." },
  { title: "A result to take with you.", label: "Documents", text: "Clearly separated chapters and documents you can copy in one click. So the work can continue after the mission." },
];

const contributions = [
  { title: "Orientierung, bevor es losgeht.", label: "Missionskatalog", text: "Ein zeitlich geordneter Katalog mit Heute-Markierung. Und eine Seitenleiste, die zeigt, wer angemeldet ist. Daran habe ich im Team gearbeitet." },
  { title: "Platz für das Gespräch.", label: "Chat mit Tomo", text: "Der vollständige Chatverlauf bleibt zugänglich. Das Eingabefeld wächst mit dem Entwurf, lange Prompts brechen sauber um." },
  { title: "Ein Ergebnis zum Mitnehmen.", label: "Dokumente", text: "Kapitel klar voneinander trennen und Dokumente mit einem Klick kopieren. Damit die Arbeit nach der Mission weitergehen kann." },
];

export default function AcademyProject({ locale = "de" }: { locale?: "de" | "en" }) {
  const en = locale === "en";
  const t = (de: string, english: string) => en ? english : de;
  const home = en ? "/" : "/de";
  const items = en ? englishContributions : contributions;
  return (
    <main id="main" className="academy-page" lang={locale}>
      <a className="academy-skip" href="#preview">{t('Zur Produktdemo', 'Skip to the product demo')}</a>
      <header className="academy-header academy-frame">
        <Link className="academy-wordmark" href={home}>thimofej.</Link>
        <a className="academy-back" href={`${home}#academy`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 5-7 7 7 7M5 12h15" /></svg> {t('Zur Startseite', 'Back home')}</a>
        <nav className="academy-language" aria-label={t('Sprache', 'Language')}>
          <a href="/de/projects/academy" lang="de" hrefLang="de" aria-label="Deutsch" aria-current={!en ? 'page' : undefined}>DE</a>
          <a href="/projects/academy" lang="en" hrefLang="en" aria-label="English" aria-current={en ? 'page' : undefined}>EN</a>
        </nav>
      </header>
      <article>
        <section className="academy-intro academy-frame" aria-labelledby="academy-title">
          <div className="academy-intro-top">
            <h1 id="academy-title" className="academy-title"><span>yesterday</span><span>Academy.</span></h1>
            <div className="academy-intro-copy">
              <p className="academy-lede">{t('KI lernen.', 'Learn AI.')}<br/>{t('An der eigenen Arbeit.', 'Through your own work.')}</p>
              <p>{t('Teams bearbeiten eigene Aufgaben, begleitet von KI-Tutor Tomo. Ich arbeite mit dem Team an der Oberfläche dafür.', 'Teams work on their own tasks, guided by AI tutor Tomo. I work with the team on the interface that makes this possible.')}</p>
              <a className="academy-contribution-link" href="#beitrag">{t('Mein Beitrag', 'My contribution')} <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v16m-7-7 7 7 7-7" /></svg></a>
            </div>
          </div>
          <dl className="academy-meta">
            <div><dt>{t('Meine Rolle', 'My role')}</dt><dd>{t('Frontend im Team', 'Frontend, as part of the team')}</dd></div>
            <div><dt>{t('Produkt', 'Product')}</dt><dd>{t('Lernplattform mit KI-Tutor', 'Learning platform with an AI tutor')}</dd></div>
            <div><dt>{t('In der App', 'In the app')}</dt><dd>SvelteKit · TypeScript</dd></div>
          </dl>
        </section>
        <section id="preview" className="academy-preview academy-frame" aria-label={t('Automatische Produktdemo der Academy', 'Automatic Academy product demo in German')}>
          {en && <p className="academy-demo-language">German product demo · no live AI</p>}
          <div className="academy-demo-preview" lang="de"><AcademyPreview /></div>
        </section>
        <section id="beitrag" className="academy-story" aria-labelledby="contribution-title">
          <div className="academy-frame">
            <div className="academy-story-heading"><p className="academy-kicker">{t('Mein Beitrag', 'My contribution')}</p><h2 id="contribution-title" className="academy-section-title">{t('Vom Katalog', 'From catalog')}<br/>{t('zum Dokument.', 'to document.')}</h2><p>{t('Vom Finden der richtigen Mission bis zum fertigen Dokument: An diesen Stellen habe ich die Oberfläche mitentwickelt.', 'From finding the right mission to the finished document, these are the parts of the interface I helped build.')}</p></div>
            <ol className="academy-contributions">{items.map((item, index) => <li key={item.title}><div className="academy-contribution-label"><span>0{index + 1}</span><span>{item.label}</span></div><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol>
            <div className="academy-details"><span>{t('Und dazwischen?', 'And in between?')}</span><p>{t('Einheitliche Buttons und Tooltips, verständlichere Fehler bei Direktlinks und Dialoge, die beim Laden nicht springen.', 'Consistent buttons and tooltips, clearer errors for direct links, and dialogs that stay in place while loading.')}</p></div>
          </div>
        </section>
      </article>
      <footer className="academy-footer academy-frame">
        <div><p className="academy-kicker">yesterday Academy</p><p className="academy-footer-title">{t('Selbst einen Blick reinwerfen.', 'Take a look for yourself.')}</p></div>
        <a className="academy-text-link" href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">{t('Zur Academy', 'Visit Academy')} <span aria-hidden="true">↗</span><span className="academy-sr">{t(' (öffnet einen neuen Tab)', ' (opens in a new tab)')}</span></a>
        <a className="academy-back academy-footer-back" href={`${home}#academy`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 5-7 7 7 7M5 12h15" /></svg> {t('Zur Startseite', 'Back home')}</a>
      </footer>
    </main>
  );
}
