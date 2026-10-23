'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TypeScene } from '../type-lab/TypeScene';
import { defaults, seedPhase, type Config } from '../type-lab/config';
import { backgroundDefaults } from '../type-lab/background-tuning';
import { Spielraum } from './Spielraum';
import { printDefaults } from './print-config';
import { unfoldProgress, type UnfoldInput } from '../type-lab/unfold-motion';
import { portraitReveal } from './portrait-motion';
import './orbit-home.css';
import './prototypes.css';

export function OrbitHome() {
  const root = useRef<HTMLElement>(null);
  const [seed, setSeed] = useState(printDefaults.seed);
  const print = useRef({...printDefaults});
  const unfold = useRef<UnfoldInput>({x:0,y:0,tuning:print});
  const [sceneReady,setSceneReady]=useState(false);
  const pausedByUser = useRef(false);
  const config = useRef<Config>({...defaults(1), tuning: {...backgroundDefaults}});
  const playing = useRef(true);
  const presentation = useRef(0);
  const [paused, setPaused] = useState(false);
  const movePrint = useCallback((x:number,y:number)=>{unfold.current.x=x;unfold.current.y=y;},[]);
  const remix = useCallback(() => {
    print.current.seed=crypto.getRandomValues(new Uint32Array(1))[0];
    setSeed(print.current.seed);
  }, []);
  const regenerate = useCallback(() => {
    const c=config.current;
    c.seedPhaseFrom=seedPhase(c); c.seedAt=c.time;
    c.seed=crypto.getRandomValues(new Uint32Array(1))[0];
  }, []);

  useEffect(() => {
    const el=root.current!;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    const update=()=>{
      const distance=Math.max(1,innerHeight*0.95);
      const value=Math.min(1,Math.max(0,scrollY/distance));
      const eased=value*value*(3-2*value);
      presentation.current=reduced.matches ? (scrollY>innerHeight*.8?1:0) : unfoldProgress(scrollY,innerHeight);
      el.style.setProperty('--journey',String(eased));
      el.style.setProperty('--hero-opacity',String(1-Math.min(1,value*2)));
      el.style.setProperty('--scene-opacity','1');
      playing.current=!pausedByUser.current && !reduced.matches && scrollY<innerHeight*2.7;
      for (const section of el.querySelectorAll<HTMLElement>('.oh-panel')) {
        const bounds=section.getBoundingClientRect();
        const progress=Math.max(-1,Math.min(1,(innerHeight/2-bounds.top)/(innerHeight/2+bounds.height/2)));
        section.style.setProperty('--section-progress',String(reduced.matches || pausedByUser.current ? 0 : progress));
        if(section.id==='academy') {
          const still=reduced.matches || pausedByUser.current;
          for(const [selector,property] of [['.academy-work-heading','--work-title-reveal'],['.academy-work-visual','--work-image-reveal']]) {
            const item=section.querySelector(selector);
            if(item) section.style.setProperty(property,String(still ? 1 : portraitReveal(item.getBoundingClientRect().top,innerHeight)));
          }
        }
        if(section.id==='ueber-mich') {
          const still=reduced.matches || pausedByUser.current;
          for(const [selector,property] of [['.personal-photo-mount','--portrait-reveal'],['.personal-title','--name-reveal'],['.personal-age','--age-reveal']]) {
            const item=section.querySelector(selector);
            if(item) {
              const top=item.getBoundingClientRect().top;
              section.style.setProperty(property,String(still ? 1 : portraitReveal(top,innerHeight)));
            }
          }
        }
      }
    };
    const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    const preference=()=>{pausedByUser.current=reduced.matches;playing.current=!reduced.matches;setPaused(reduced.matches);el.dataset.paused=String(reduced.matches);update();};
    preference();
    addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);reduced.addEventListener('change',preference);
    return ()=>{cancelAnimationFrame(frame);removeEventListener('scroll',scroll);removeEventListener('resize',scroll);reduced.removeEventListener('change',preference);};
  }, []);

  useEffect(()=>{dispatchEvent(new Event('scroll'));},[sceneReady]);

  return <main ref={root} className="orbit-home" lang="de" id="anfang" data-scene-ready={sceneReady}>
    <a className="oh-skip" href="#ueber-mich">Zur Vorstellung</a>
    <div className="oh-scene"><TypeScene config={config} playing={playing} regenerate={regenerate} presentation={presentation} unfold={unfold} onReady={setSceneReady}/></div>
    <header className="oh-header">
      <a className="oh-wordmark" href="#anfang" aria-label="Thimofej, nach oben">thimofej<span aria-hidden="true">.</span></a>
      <nav aria-label="Seitennavigation"><a href="#ueber-mich">Über mich</a><a href="mailto:thimofej@yesterday-ai.de">Kontakt <span aria-hidden="true">↗</span></a></nav>
    </header>
    <section className="oh-hero" aria-labelledby="oh-name">
      <div className="oh-identity"><h1 id="oh-name">Thimofej<br/><span>Zapko.</span></h1></div>
      <a href="#person" className="oh-scroll" aria-label="Mehr über Thimofej"><span>Weiter</span><span aria-hidden="true">↓</span></a>
    </section>
    <Spielraum seed={seed} regenerate={remix} onPrintPointer={movePrint}/>
    <button className="oh-pause" onClick={()=>{pausedByUser.current=!pausedByUser.current;playing.current=!pausedByUser.current;setPaused(pausedByUser.current);root.current!.dataset.paused=String(pausedByUser.current);dispatchEvent(new Event('scroll'));}} aria-label={paused?'Animation abspielen':'Animation pausieren'} title={paused?'Animation abspielen':'Animation pausieren'}>{paused?'▷':'Ⅱ'}</button>
  </main>;
}
