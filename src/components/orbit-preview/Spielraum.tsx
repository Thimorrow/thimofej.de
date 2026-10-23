'use client';

import { useRef, type CSSProperties } from 'react';
import { AcademyWork } from './AcademyWork';
import { printRows } from './print-config';
import { PersonalIntro } from './PersonalIntro';
import { ContactFinale } from './ContactFinale';

export function Spielraum({seed, onPrintPulse, onPrintPointer, interactive}: {seed: number; onPrintPulse: (x:number,y:number) => void; interactive: boolean; onPrintPointer:(x:number,y:number)=>void}) {
  const field = useRef<HTMLButtonElement>(null);
  return <div className="oh-content oh-spielraum">
    <section className="play-print oh-panel" id="person" aria-labelledby="play-title">
      <div className="play-print-stage">
      <h2 id="play-title" className="personal-accessible">Schriftspiel</h2>
      <button ref={field} className="play-field" aria-label={interactive ? "THIMORROW: Textwelle auslösen" : "THIMORROW"} disabled={!interactive} onClick={event=>{
        // The artwork covers the viewport, independently of the button's inset.
        const box=event.currentTarget.getBoundingClientRect();
        const x=event.detail===0 ? box.left+box.width/2 : event.clientX;
        const y=event.detail===0 ? box.top+box.height/2 : event.clientY;
        onPrintPulse(x/innerWidth*2-1,1-y/innerHeight*2);
      }} onPointerMove={event=>{
        if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const box=event.currentTarget.getBoundingClientRect();
        onPrintPointer((event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2);
        field.current?.style.setProperty('--pointer', String((event.clientX-box.left)/box.width-0.5));
      }} onPointerLeave={()=>{onPrintPointer(0,0);field.current?.style.setProperty('--pointer','0');}}>
        <span className="play-print-rows" aria-hidden="true">{printRows(seed).map((row, i)=><span className="play-print-row" key={i} style={{'--offset':row.offset,'--stretch':row.stretch,'--direction':row.direction} as CSSProperties}>THIMORROW</span>)}</span>
      </button>
      </div>
    </section>
    <PersonalIntro/>
    <AcademyWork/>
    <ContactFinale/>
  </div>;
}
