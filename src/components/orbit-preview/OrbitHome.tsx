'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TypeScene } from '../type-lab/TypeScene';
import { defaults, seedPhase, type Config } from '../type-lab/config';
import { createWave } from '../type-lab/background-wave';
import { backgroundDefaults } from '../type-lab/background-tuning';
import { Spielraum } from './Spielraum';
import { printDefaults } from './print-config';
import { queuePrintWave, unfoldProgress, type UnfoldInput } from '../type-lab/unfold-motion';
import { portraitReveal } from './portrait-motion';
import './orbit-home.css';
import './prototypes.css';

export function OrbitHome() {
  const root = useRef<HTMLElement>(null);
  const print = useRef({...printDefaults});
  const unfold = useRef<UnfoldInput>({x:0,y:0,tuning:print,waves:[]});
  const [sceneReady,setSceneReady]=useState(false);
  const pausedByUser = useRef(false);
  const config = useRef<Config>({...defaults(1), tuning: {...backgroundDefaults}});
  const playing = useRef(true);
  const presentation = useRef(0);
  const [paused, setPaused] = useState(false);
  const movePrint = useCallback((x:number,y:number)=>{unfold.current.x=x;unfold.current.y=y;},[]);
  const printWaveIndex = useRef(0);
  const pulsePrint = useCallback((x:number,y:number) => {
    if (!playing.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const input=unfold.current;
    input.waves=queuePrintWave(input.waves,createWave(x,y,printWaveIndex.current++,config.current.time));
  }, []);
  const regenerate = useCallback(() => {
    const c=config.current;
    c.seedPhaseFrom=seedPhase(c); c.seedAt=c.time;
    c.seed=crypto.getRandomValues(new Uint32Array(1))[0];
  }, []);

  useEffect(() => {
    const el=root.current!;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const panels=Array.from(el.querySelectorAll<HTMLElement>('.oh-panel')).map(section=>({
      section,
      reveals: (section.id==='academy'
        ? [['.academy-work-heading','--work-title-reveal'],['.academy-work-visual','--work-image-reveal']]
        : section.id==='ueber-mich'
          ? [['.personal-photo-mount','--portrait-reveal'],['.personal-title','--name-reveal'],['.personal-age','--age-reveal']]
          : []).map(([selector,property])=>({node:section.querySelector<HTMLElement>(selector),property})),
    }));
    let frame=0;
    let anchoredSection=location.hash.slice(1);
    let anchorEntered=false;
    const update=()=>{
      // Measure the page before changing any styles, avoiding repeated layout work.
      const still=reduced.matches || pausedByUser.current;
      const measurements=panels.map(({section,reveals})=>{
        const bounds=section.getBoundingClientRect();
        const anchor=section.id===anchoredSection;
        if(anchor) {
          const visible=bounds.bottom>0 && bounds.top<innerHeight;
          if(visible) anchorEntered=true;
          else if(anchorEntered) anchoredSection='';
        }
        return {section,bounds,reveals:reveals.map(({node,property})=>({
          property,value:still || (anchor && anchorEntered) || !node ? 1 : portraitReveal(node.getBoundingClientRect().top,innerHeight,section.id==='ueber-mich' ? .55 : .28),
        }))};
      });
      const distance=Math.max(1,innerHeight*0.95);
      const value=Math.min(1,Math.max(0,scrollY/distance));
      const eased=value*value*(3-2*value);
      presentation.current=still ? (scrollY>innerHeight*.8?1:0) : unfoldProgress(scrollY,innerHeight);
      el.style.setProperty('--journey',String(eased));
      el.style.setProperty('--hero-opacity',String(1-Math.min(1,value*2)));
      el.style.setProperty('--scene-opacity','1');
      playing.current=!pausedByUser.current && !reduced.matches && scrollY<innerHeight*2.7;
      for (const {section,bounds,reveals} of measurements) {
        const progress=Math.max(-1,Math.min(1,(innerHeight/2-bounds.top)/(innerHeight/2+bounds.height/2)));
        section.style.setProperty('--section-progress',String(still ? 0 : progress));
        for (const {property,value} of reveals) section.style.setProperty(property,String(value));
      }
    };
    const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    const anchor=()=>{anchoredSection=location.hash.slice(1);anchorEntered=false;scroll();};
    const preference=()=>{pausedByUser.current=reduced.matches;playing.current=!reduced.matches;setPaused(reduced.matches);el.dataset.paused=String(reduced.matches);update();};
    preference();
    addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);addEventListener('hashchange',anchor);reduced.addEventListener('change',preference);
    return ()=>{cancelAnimationFrame(frame);removeEventListener('scroll',scroll);removeEventListener('resize',scroll);removeEventListener('hashchange',anchor);reduced.removeEventListener('change',preference);};
  }, []);

  useEffect(()=>{dispatchEvent(new Event('scroll'));},[sceneReady]);

  return <main ref={root} className="orbit-home" lang="de" id="anfang" data-scene-ready={sceneReady}>
    <a className="oh-skip" href="#ueber-mich">Zur Vorstellung</a>
    <div className="oh-scene"><TypeScene config={config} playing={playing} regenerate={regenerate} presentation={presentation} unfold={unfold} onReady={setSceneReady}/></div>
    <header className="oh-header">
      <a className="oh-wordmark" href="#anfang" aria-label="Thimofej, nach oben">thimofej<span aria-hidden="true">.</span></a>
      <nav aria-label="Seitennavigation"><a href="#ueber-mich">Über mich</a><a href="#kontakt">Kontakt <span aria-hidden="true">↓</span></a></nav>
    </header>
    <section className="oh-hero" aria-labelledby="oh-name">
      <div className="oh-identity"><h1 id="oh-name">Thimofej<br/><span>Zapko.</span></h1></div>
      <a href="#person" className="oh-scroll" aria-label="Mehr über Thimofej"><span>Weiter</span><span aria-hidden="true">↓</span></a>
    </section>
    <Spielraum seed={printDefaults.seed} onPrintPulse={pulsePrint} onPrintPointer={movePrint} interactive={sceneReady && !paused}/>
    <button className="oh-pause" onClick={()=>{pausedByUser.current=!pausedByUser.current;playing.current=!pausedByUser.current;setPaused(pausedByUser.current);root.current!.dataset.paused=String(pausedByUser.current);dispatchEvent(new Event('scroll'));}} aria-label={paused?'Animation abspielen':'Animation pausieren'} title={paused?'Animation abspielen':'Animation pausieren'}>{paused?'▷':'Ⅱ'}</button>
  </main>;
}
