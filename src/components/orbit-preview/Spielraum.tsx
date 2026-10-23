'use client';

import { useRef, type CSSProperties } from 'react';
import { AcademyWork } from './AcademyWork';
import { printRows } from './print-config';
import { PersonalIntro } from './PersonalIntro';

export function Spielraum({seed, regenerate, onPrintPointer}: {seed: number; regenerate: () => void; onPrintPointer:(x:number,y:number)=>void}) {
  const field = useRef<HTMLButtonElement>(null);
  const greeting = useRef<HTMLAnchorElement>(null);
  const resetGreeting=()=>{greeting.current?.querySelectorAll<HTMLElement>('[data-letter]').forEach(letter=>{letter.style.transform='';});};
  return <div className="oh-content oh-spielraum">
    <section className="play-print oh-panel" id="person" aria-labelledby="play-title">
      <div className="play-print-stage">
      <div className="oh-section-line"><h2 id="play-title">Ein Name. Viele Formen.</h2><span>01 / Schriftspiel</span></div>
      <button ref={field} className="play-field" aria-label="Schriftbild neu mischen" onClick={regenerate} onPointerMove={event=>{
        if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const box=event.currentTarget.getBoundingClientRect();
        onPrintPointer((event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2);
        field.current?.style.setProperty('--pointer', String((event.clientX-box.left)/box.width-0.5));
      }} onPointerLeave={()=>{onPrintPointer(0,0);field.current?.style.setProperty('--pointer','0');}}>
        <span className="play-print-rows" aria-hidden="true">{printRows(seed).map((row, i)=><span className="play-print-row" key={i} style={{'--offset':row.offset,'--stretch':row.stretch,'--direction':row.direction} as CSSProperties}>THIMORROW</span>)}</span>
      </button>
      <div className="play-caption"><span className="play-seed">No. {seed.toString().padStart(6,'0')}</span><button className="play-remix-button" onClick={regenerate}>Neu mischen <span aria-hidden="true">↗</span></button></div>
      </div>
    </section>
    <PersonalIntro/>
    <AcademyWork/>
    <section className="play-contact oh-panel" id="kontakt" aria-labelledby="play-contact-title">
      <div className="oh-section-line"><span>04 / Jetzt du</span><span>Kontakt</span></div>
      <div className="play-contact-pair" aria-hidden="true"><span>Du.</span><span className="play-plus">+</span><span>Ich.</span></div>
      <h2 id="play-contact-title"><a ref={greeting} className="play-greeting" href="mailto:thimofej@yesterday-ai.de" aria-label="Hallo sagen: E-Mail an Thimofej" onPointerMove={event=>{
        if(event.pointerType!=='mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || event.currentTarget.closest('[data-paused="true"]')) return;
        const box=event.currentTarget.getBoundingClientRect();
        greeting.current?.querySelectorAll<HTMLElement>('[data-letter]').forEach(letter=>{
          const center=letter.offsetLeft+letter.offsetWidth/2;
          const distance=(event.clientX-box.left-center)/box.width;
          const lift=Math.exp(-distance*distance*28);
          letter.style.transform=`translateY(${-lift*24}px) rotate(${distance*lift*18}deg)`;
        });
      }} onPointerLeave={resetGreeting} onBlur={resetGreeting}>{[...'Hallo'].map((letter,index)=><span data-letter key={index} aria-hidden="true">{letter}</span>)}<span className="play-greeting-arrow" aria-hidden="true">↗</span></a></h2>
      <div className="poster-contact-bottom"><a className="oh-email" href="mailto:thimofej@yesterday-ai.de">thimofej@yesterday-ai.de</a><div className="oh-social"><a href="https://github.com/thimorrow">GitHub ↗</a><a href="https://x.com/thimorrowr">X ↗</a></div></div>
      <footer className="oh-end"><span>© 2026 Thimofej Zapko</span><a href="#anfang">Nochmal von vorn ↑</a></footer>
    </section>
  </div>;
}
