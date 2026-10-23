import AcademyDemo from '../academy/AcademyDemo';
import './academy-work.css';

export function AcademyWork() {
  return <section className="academy-work oh-panel" id="academy" aria-labelledby="academy-work-title">
    <div className="academy-work-inner">
      <p className="academy-work-role">Frontend bei yesterday <span>Ein Teamprojekt</span></p>
      <div className="academy-work-intro">
        <div className="academy-work-heading">
          <span className="academy-work-by">yesterday</span>
          <h2 id="academy-work-title" className="academy-work-title" aria-label="Academy" data-title="Academy"><span className="academy-work-ink">Academy</span></h2>
        </div>
        <div className="academy-work-note">
          <p>KI lernen.<br/>An der eigenen Arbeit.</p>
          <a className="academy-work-link" href="/projects/academy">Meine Arbeit ansehen <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="academy-work-visual">
        <div className="academy-work-sheet"><AcademyDemo loop /></div>
      </div>
      <div className="academy-work-bottom">
        <p>Ich arbeite mit dem Team an der Oberfläche.<br/>Vom Finden einer Mission bis zum fertigen Dokument.</p>
        <span>Automatische Produktdemo · ohne Live-KI</span>
      </div>
    </div>
  </section>;
}
