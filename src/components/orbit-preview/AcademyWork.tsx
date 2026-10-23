import Image from 'next/image';
import './academy-work.css';

export function AcademyWork() {
  return <section className="academy-work oh-panel" id="academy" aria-labelledby="academy-work-title">
    <div className="oh-section-line"><span>03 / Eine Arbeit</span><span>Frontend bei yesterday</span></div>
    <a className="academy-work-link" href="/projects/academy" aria-label="yesterday Academy: meine Arbeit und die Produktdemo ansehen">
      <div className="academy-work-heading">
        <span className="academy-work-by">yesterday</span>
        <h2 id="academy-work-title" className="academy-work-title" aria-label="Academy" data-title="Academy"><span className="academy-work-ink">Academy</span></h2>
        <span className="academy-work-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="academy-work-note">
        <p>Die Lernplattform, an der ich mit dem Team arbeite.</p>
        <span className="academy-work-visit">Die Arbeit ansehen <span aria-hidden="true">↗</span></span>
      </div>
      <div className="academy-work-visual">
        <div className="academy-work-sheet">
          <Image className="academy-work-desktop" src="/lab-home/academy-catalog.png" alt="Produktdemo der Academy mit Missionskatalog und Lernaufgaben" width={1414} height={688} sizes="72vw"/>
          <Image className="academy-work-mobile" src="/lab-home/academy-mobile.png" alt="Mobile Academy-Produktdemo: Lernaufgabe Dein Personal Handbook" width={612} height={968} sizes="290px"/>
        </div>
      </div>
    </a>
  </section>;
}
