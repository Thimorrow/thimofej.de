import AcademyPreview from '../academy/AcademyPreview';
import './academy-work.css';

export function AcademyWork({locale = 'de'}: {locale?: 'de' | 'en'}) {
  const copy = locale === 'en' ? {
    role: 'Frontend at yesterday', team: 'A team project', learn: 'Learn AI.', practice: 'Through your own work.',
    work: 'View my work', collaboration: 'I work on the interface with the team.',
    journey: 'From finding a mission to the finished document.', demo: 'German product demo · no live AI',
  } : {
    role: 'Frontend bei yesterday', team: 'Ein Teamprojekt', learn: 'KI lernen.', practice: 'An der eigenen Arbeit.',
    work: 'Meine Arbeit ansehen', collaboration: 'Ich arbeite mit dem Team an der Oberfläche.',
    journey: 'Vom Finden einer Mission bis zum fertigen Dokument.', demo: 'Automatische Produktdemo · ohne Live-KI',
  };
  return <section className="academy-work oh-panel" id="academy" aria-labelledby="academy-work-title">
    <div className="academy-work-inner">
      <p className="academy-work-role">{copy.role} <span>{copy.team}</span></p>
      <div className="academy-work-intro">
        <div className="academy-work-heading">
          <span className="academy-work-by">yesterday</span>
          <h2 id="academy-work-title" className="academy-work-title" aria-label="Academy" data-title="Academy"><span className="academy-work-ink">Academy</span></h2>
        </div>
        <div className="academy-work-note">
          <p>{copy.learn}<br/>{copy.practice}</p>
          <a className="academy-work-link" href={locale === 'en' ? '/projects/academy' : '/de/projects/academy'}>{copy.work} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="academy-work-visual">
        <div className="academy-work-sheet" lang="de"><AcademyPreview /></div>
      </div>
      <div className="academy-work-bottom">
        <p>{copy.collaboration}<br/>{copy.journey}</p>
        <span>{copy.demo}</span>
      </div>
    </div>
  </section>;
}
