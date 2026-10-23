"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { defaults, seedPhase, type Config } from "./config";
import { BackgroundDials } from "./BackgroundDials";
import { validBackgroundTuning } from "./background-tuning";
import { TypeScene } from "./TypeScene";
import "./type-lab.css";



export function TypeLab() {
  const config = useRef<Config>(defaults(1));
  const playing = useRef(true);
  const [revision,setRevision] = useState(0);
  const [paused,setPaused] = useState(false);
  const [panel,setPanel] = useState(true);
  const [ready,setReady] = useState(false);
  const replay = useCallback(()=>{ config.current.time=0; delete config.current.seedPhaseFrom; delete config.current.seedAt; playing.current=!matchMedia("(prefers-reduced-motion: reduce)").matches; setPaused(!playing.current); setRevision(v=>v+1); },[]);
  const regenerate = useCallback(()=>{
    const next = crypto.getRandomValues(new Uint32Array(1))[0];
    const c=config.current;
    if(c.mode===1 && playing.current && !matchMedia("(prefers-reduced-motion: reduce)").matches){c.seedPhaseFrom=seedPhase(c);c.seedAt=c.time;}
    else {delete c.seedPhaseFrom;delete c.seedAt;}
    c.seed=next;
  },[]);
  useEffect(()=>{
    const timer=requestAnimationFrame(()=>{
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { playing.current=false; setPaused(true); }
    try { const stored=JSON.parse(localStorage.getItem("tz-background-tuning") ?? "null"); if(validBackgroundTuning(stored)) config.current.tuning=stored; } catch { /* Keep defaults when storage is unavailable. */ }
    setReady(true);
    });
    return ()=>cancelAnimationFrame(timer);
  },[]);
  useEffect(()=>{
    const onKey=(e: KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "r") replay();
    };
    window.addEventListener("keydown",onKey); return ()=>window.removeEventListener("keydown",onKey);
  },[replay]);
  return <main className="type-lab" lang="de">
    <header className="type-header">
      <Link href="/" className="type-signature">thimofej<span>↗</span></Link>
      <button className="type-pause" aria-expanded={panel} aria-controls="background-controls" onClick={()=>setPanel(v=>!v)}>Regler {panel ? "ausblenden" : "einblenden"}</button>
      <button className="type-pause" onClick={()=>{ playing.current=!playing.current; setPaused(!playing.current); }}>{paused ? "Abspielen" : "Pause"}</button>
    </header>
    <section className="type-stage" aria-label="Interaktive Schriftanimation">
      {ready && <TypeScene key={revision} config={config} playing={playing} regenerate={regenerate} />}
    </section>
    {ready && panel && <aside id="background-controls" className="background-controls"><BackgroundDials config={config}/></aside>}
    <button className="orbit-replay" title="Intro wiederholen (R)" aria-label="Intro wiederholen (R)" onClick={replay}>↻</button>
  </main>;
}
