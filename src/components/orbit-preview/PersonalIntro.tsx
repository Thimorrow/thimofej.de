'use client';

import { useRef, type CSSProperties } from 'react';
import Image from 'next/image';

export function PersonalIntro() {
  const portrait=useRef<HTMLElement>(null);
  const reset=()=>{
    portrait.current?.style.setProperty('--photo-x','0');
    portrait.current?.style.setProperty('--photo-y','0');
  };

  return <section className="play-personal oh-panel" id="ueber-mich" aria-labelledby="personal-title">
    <div className="oh-section-line"><span>02 / Persönlich</span><span>Thimofej Zapko</span></div>
    <div className="personal-layout">
      <h2 className="personal-title" id="personal-title" aria-label="Ich bin Thimofej.">
        <span className="personal-kicker" aria-hidden="true">Ich bin</span>
        <span className="personal-name" aria-hidden="true">{'Thimofej.'.split('').map((letter,index)=><span className="personal-letter" key={index} style={{'--letter':index} as CSSProperties}>{letter}</span>)}</span>
      </h2>
      <div className="personal-photo-mount">
        <figure ref={portrait} className="personal-portrait" role="img" aria-label="Thimofej lächelt in die Kamera, mit schwarzer Kappe und weißem Hoodie."
          onPointerMove={event=>{
            if(event.pointerType!=='mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || event.currentTarget.closest('[data-paused="true"]')) return;
            const box=event.currentTarget.getBoundingClientRect();
            portrait.current?.style.setProperty('--photo-x',String(Math.max(-1,Math.min(1,(event.clientX-box.left)/box.width*2-1))));
            portrait.current?.style.setProperty('--photo-y',String(Math.max(-1,Math.min(1,(event.clientY-box.top)/box.height*2-1))));
          }} onPointerLeave={reset}>
          {[0,1,2].map(index=><span key={index} className="personal-photo-strip" style={{'--strip':index} as CSSProperties} aria-hidden="true">
            <Image src="/lab-home/thimofej-portrait.jpg" alt="" width={1080} height={1080} sizes="(max-width:700px) 44vw, (max-width:1050px) 220px, 280px"/>
          </span>)}
        </figure>
      </div>
      <p className="personal-age">
        <span className="personal-accessible">15 Jahre alt.</span>
        <span className="personal-age-number" aria-hidden="true"><span className="personal-digit">1</span><span className="personal-digit">5</span></span>
        <span className="personal-age-label" aria-hidden="true">Jahre alt.</span>
      </p>
      <div className="personal-bio"><p>Im Netz auch Thimorrow.<br/>Ich entwickle Frontends und probiere aus, was im Browser möglich ist.</p><a className="oh-text-link" href="https://github.com/thimorrow">Was ich baue <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>;
}
