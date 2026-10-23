'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { createDialKit, createDialRoot } from 'dialkit/vanilla';
import 'dialkit/vanilla/styles.css';
import { printDefaults, type PrintConfig } from './print-config';

export function PageDials({root,config,variant,onSeed}: {root: RefObject<HTMLElement|null>;config: RefObject<PrintConfig>;variant: number;onSeed: (seed:number)=>void}) {
  const host=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState('');
  const [saved,setSaved]=useState<PrintConfig[]>([]);
  const restore=useRef<(value: PrintConfig)=>void>(()=>{});
  useEffect(()=>{
    const c=config.current;
    const kit=createDialKit('Seitenentwurf',{
      Schriftgröße:[c.typeScale,0.8,1.1,0.01],Freiraum:[c.space,0.8,1.3,0.05],
      Schriftspiel:{Versatz:[c.spread,0,1,0.05],Bewegung:[c.motion,0,1.5,0.1]},
      Zurücksetzen:{type:'action'},Speichern:{type:'action',label:'Entwurf speichern'},
    },{id:'page-prototype',persist:false,onAction:async action=>{
      if(action==='Zurücksetzen') {restore.current({...printDefaults});setStatus('Ausgangswerte wiederhergestellt.');}
      if(action==='Speichern') {
        const snapshot={...config.current};
        const json=JSON.stringify({variant,...snapshot},null,2);
        try {
          const response=await fetch('/lab/home/save',{method:'POST',headers:{'Content-Type':'application/json'},body:json});
          const result=await response.json();
          if(!response.ok) throw new Error(result.error);
          setStatus(result.path);
          setSaved(previous=>[snapshot,...previous].slice(0,4));
          try {await navigator.clipboard.writeText(json);} catch {/* The file is the durable copy. */}
        } catch(error) {
          const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
          const link=document.createElement('a');link.href=url;link.download=`seitenentwurf-${snapshot.seed}.json`;link.click();
          setTimeout(()=>URL.revokeObjectURL(url),1000);
          setStatus(`JSON heruntergeladen. ${error instanceof Error?error.message:'Lokale Speicherung nicht verfügbar.'}`);
        }
      }
    }});
    restore.current=value=>{
      config.current={...value};onSeed(value.seed);
      kit.setValues({Schriftgröße:value.typeScale,Freiraum:value.space,Schriftspiel:{Versatz:value.spread,Bewegung:value.motion}});
    };
    const unsubscribe=kit.subscribe(values=>{
      const play=values.Schriftspiel as Record<string,number>;
      config.current={...config.current,typeScale:Number(values.Schriftgröße),space:Number(values.Freiraum),spread:play.Versatz,motion:play.Bewegung};
      const c=config.current;
      root.current?.style.setProperty('--type-scale',String(c.typeScale));
      root.current?.style.setProperty('--space',String(c.space));
      root.current?.style.setProperty('--spread',String(c.spread));
      root.current?.style.setProperty('--motion',String(c.motion));
    });
    const dialRoot=createDialRoot({target:host.current!,mode:'inline',theme:'dark',productionEnabled:true});
    return ()=>{unsubscribe();dialRoot.destroy();kit.destroy();};
  },[config,onSeed,root,variant]);
  return <><div ref={host}/>{status&&<p className="oh-save-status" role="status">{status}</p>}{saved.length>0&&<div className="oh-saved">{saved.map((value,i)=><button key={i} onClick={()=>restore.current(value)}>Stand {i+1}</button>)}</div>}</>;
}
