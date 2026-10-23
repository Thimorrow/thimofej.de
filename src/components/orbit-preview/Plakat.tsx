import Image from 'next/image';

export function Plakat() {
  return <div className="oh-content oh-plakat">
    <section className="poster-intro oh-panel" id="person" aria-labelledby="poster-title">
      <div className="oh-section-line"><span>01 / Thimofej Zapko</span><span>Frontend & Experimente</span></div>
      <h2 id="poster-title">Ich baue<br/><span>fürs Web.</span></h2>
      <div className="poster-about"><span className="poster-asterisk" aria-hidden="true">✳</span><p>Ich bin Thimofej. Im Netz auch Thimorrow.<br/>Bei yesterday arbeite ich am Frontend der Academy. Hier ist Platz für meine eigenen Experimente.</p></div>
    </section>
    <section className="poster-work oh-panel" aria-labelledby="poster-work-title">
      <div className="oh-section-line"><span>02 / Woran ich arbeite</span><span>Mit dem Team bei yesterday</span></div>
      <div className="poster-work-heading"><h2 id="poster-work-title">yesterday<br/><span>Academy.</span></h2><a className="oh-round-link" href="/projects/academy" aria-label="Mehr über meine Arbeit an der Academy">↗</a></div>
      <div className="poster-work-detail"><p>KI lernen, indem man sie benutzt.<br/>Mein Beitrag: das Frontend.</p><a className="oh-text-link" href="/projects/academy">Die Arbeit ansehen <span aria-hidden="true">↗</span></a></div>
      <a href="/projects/academy/demo" className="poster-preview" aria-label="Interaktive Academy-Demo öffnen"><Image src="/lab-home/academy-catalog.png" alt="Die vorhandene Academy-Produktdemo mit ihrem Missionskatalog" width={1414} height={688} sizes="(max-width: 700px) 152vw, 84vw"/><span>Demo öffnen <span aria-hidden="true">↗</span></span></a>
    </section>
    <section className="poster-contact oh-panel" id="kontakt" aria-labelledby="poster-contact-title">
      <div className="oh-section-line"><span>03 / Kontakt</span><span>Thimorrow im Netz</span></div>
      <h2 id="poster-contact-title"><a href="mailto:thimofej@yesterday-ai.de">Hallo<span aria-hidden="true">↗</span></a></h2>
      <div className="poster-contact-bottom"><a className="oh-email" href="mailto:thimofej@yesterday-ai.de">thimofej@yesterday-ai.de</a><div className="oh-social"><a href="https://github.com/thimorrow">GitHub ↗</a><a href="https://x.com/thimorrowr">X ↗</a></div></div>
      <footer className="oh-end"><span>© 2026 Thimofej Zapko</span><a href="#anfang">Zurück nach oben ↑</a></footer>
    </section>
  </div>;
}
