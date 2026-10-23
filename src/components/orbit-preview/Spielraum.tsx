'use client';

import { useRef, type CSSProperties } from 'react';
import { AcademyWork } from './AcademyWork';
import { printRows } from './print-config';
import { PersonalIntro } from './PersonalIntro';
import { ContactFinale } from './ContactFinale';

export function Spielraum({seed, regenerate, onPrintPointer}: {seed: number; regenerate: () => void; onPrintPointer:(x:number,y:number)=>void}) {
  const field = useRef<HTMLButtonElement>(null);
  return <div className="oh-content oh-spielraum">
    <section className="play-print oh-panel" id="person" aria-labelledby="play-title">
      <div className="play-print-stage">
      <h2 id="play-title" className="personal-accessible">Schriftspiel</h2>
      <button ref={field} className="play-field" aria-label="Schriftbild neu mischen" onClick={regenerate} onPointerMove={event=>{
        if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const box=event.currentTarget.getBoundingClientRect();
        onPrintPointer((event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2);
        field.current?.style.setProperty('--pointer', String((event.clientX-box.left)/box.width-0.5));
      }} onPointerLeave={()=>{onPrintPointer(0,0);field.current?.style.setProperty('--pointer','0');}}>
        <span className="play-print-rows" aria-hidden="true">{printRows(seed).map((row, i)=><span className="play-print-row" key={i} style={{'--offset':row.offset,'--stretch':row.stretch,'--direction':row.direction} as CSSProperties}>THIMORROW</span>)}</span>
      </button>
      <div className="play-caption"><button className="play-remix-button" onClick={regenerate}>Neu mischen <span aria-hidden="true">↗</span></button></div>
      </div>
    </section>
    <PersonalIntro/>
    <AcademyWork/>
    <ContactFinale/>
  </div>;
}
