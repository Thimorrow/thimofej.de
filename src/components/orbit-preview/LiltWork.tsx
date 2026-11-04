import Image from 'next/image';
import { LiltDemo } from './LiltDemo';
import './lilt-work.css';

export function LiltWork({locale = 'de'}: {locale?: 'de' | 'en'}) {
  const copy = locale === 'en' ? {
    role: 'An independent Mac app', platform: 'Open source',
    description: 'Music, a focus timer and a shelf for your files. Tucked into your Mac’s notch.',
    download: 'Download beta', source: 'Source code',
    preview: 'Interactive demo', macbook: 'MacBook Pro showing Lilt at the top of the screen.',
    credit: 'Design adapted from the Lilt study by Vayun Godara, with permission.',
  } : {
    role: 'Eine eigene Mac-App', platform: 'Open Source',
    description: 'Musik, Fokustimer und eine Ablage für deine Dateien. In der Notch deines Macs.',
    download: 'Beta laden', source: 'Quellcode',
    preview: 'Interaktive Demo', macbook: 'MacBook Pro mit Lilt am oberen Bildschirmrand.',
    credit: 'Design nach der Lilt-Studie von Vayun Godara, mit Erlaubnis.',
  };

  return <section className="lilt-work oh-panel" id="lilt" aria-labelledby="lilt-work-title">
    <div className="lilt-work-inner">
      <p className="lilt-work-role">{copy.role}<span>{copy.platform}</span></p>
      <div className="lilt-work-stage">
      <div className="lilt-work-macbook">
      <div className="lilt-work-screen">
        <LiltDemo locale={locale}/>
        <h2 className="lilt-work-title" id="lilt-work-title" aria-label="Lilt"><svg viewBox="0 0 152 100" aria-hidden="true"><path d="M11 12V86M45 54V86M79 12V86M113 24V68Q113 86 131 86M101 48H137" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round"/><path d="M30 2H60V18A8 8 0 0 1 52 26H38A8 8 0 0 1 30 18Z" fill="currentColor"/></svg></h2>
        <span className="lilt-work-preview-label">{copy.preview}</span>
      </div>
      <Image className="lilt-work-device" src="/projects/lilt/macbook-pro.png" alt={copy.macbook} width={3860} height={2540} sizes="(max-width:1174px) 92vw,1080px" loading="eager" fetchPriority="low"/>
      </div>
      </div>
      <div className="lilt-work-details">
      <div className="lilt-work-intro">
        <div className="lilt-work-note">
          <p>{copy.description}</p>
        </div>
        <div className="lilt-work-links">
          <a className="lilt-work-download" href="https://github.com/Thimorrow/Lilt/releases">{copy.download}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg></a>
          <a className="lilt-work-source" href="https://github.com/Thimorrow/Lilt">{copy.source}<span aria-hidden="true">↗</span></a>
        </div>
        <span className="lilt-work-requirements">macOS 15+ · Beta</span>
      </div>
      </div>
      <div className="lilt-work-bottom">
        <a className="lilt-work-credit" href="https://vayun.net/studies/lilt/">{copy.credit}</a>
      </div>
    </div>
  </section>;
}
