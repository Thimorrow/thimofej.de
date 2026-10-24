"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { createTypeRenderer } from "./renderer";
import { coast, createBandLag, follow, rotateYaw, touchDragIntent } from "./orbit-motion";
import { advanceWaves, createWave, insideSculpture, type Wave } from "./background-wave";
import type { Config } from "./config";
import { advancePrintWaves, nearestUnfoldPhase, type UnfoldInput } from './unfold-motion';

export function TypeScene({ config, playing, regenerate, presentation, unfold, onReady, locale = "de" }: { locale?: "de" | "en"; unfold?: MutableRefObject<UnfoldInput>; onReady?: (ready:boolean)=>void; presentation?: MutableRefObject<number>; config: MutableRefObject<Config>; playing: MutableRefObject<boolean>; regenerate: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const en = locale === "en";
  const [status,setStatus] = useState(en ? "Preparing the lettering …" : "Schrift wird vorbereitet …");
  const [error,setError] = useState(false);
  useEffect(() => {
    const el = canvas.current!;
    const controller=new AbortController();
    let disposed = false, raf = 0, last = 0, age = config.current.time > 0 ? 3 : 0, moved = false;
    let drawn = "";
    let waves: Wave[] = [], waveIndex = 0, backgroundGesture = false;
    let renderer: Awaited<ReturnType<typeof createTypeRenderer>> | undefined;
    let lastX = 0, lastY = 0, down = false, travel=0, lastMove=0;
    let touchIntent: ReturnType<typeof touchDragIntent> = "pending";
    let targetYaw=config.current.yaw,targetPitch=config.current.pitch;
    let bandLag=0;
    const bandSpring=createBandLag();
    let orbitTime=config.current.time;
    let pointerX=0,pointerY=0,printPhase=(unfold?.current.tuning.current.seed??0)%1000/100;
    let vx=0,vy=0,observedYaw=config.current.yaw,observedPitch=config.current.pitch;
    const orbit=config.current.mode===1;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    const onReduced = () => { reduced = media.matches; vx=0;vy=0; waves=[]; drawn=""; };
    media.addEventListener("change",onReduced);
    const fail = (message: string) => { if (!disposed) { cancelAnimationFrame(raf); setError(true); setStatus(en ? message.replace("Die GPU-Verbindung wurde unterbrochen. Bitte neu laden.", "The GPU connection was interrupted. Please reload.").replace("Die Schrift konnte nicht vorbereitet werden.", "The lettering could not be prepared.").replace("Die Schriftkontur ist zu komplex.", "The lettering outline is too complex.") : message); onReady?.(false); } };
    const tick = (now: number) => {
      if (disposed) return;
      const dt = last ? Math.min((now-last)/1000,0.05) : 0;
      last = now;
      if (!document.hidden && renderer) {
        if (playing.current && !reduced && (!down || backgroundGesture)) age += dt;
        if (config.current.yaw!==observedYaw || config.current.pitch!==observedPitch) {
          targetYaw=config.current.yaw;targetPitch=config.current.pitch;vx=0;vy=0;
        }
        let rotationVelocity=0;
        if (orbit && !reduced) {
          if (!down && playing.current) {
            const x=coast(vx,dt),y=coast(vy,dt); vx=x.velocity;vy=y.velocity;
            const yaw=rotateYaw(config.current.yaw,targetYaw,x.distance);
            config.current.yaw=yaw.current;targetYaw=yaw.target;
            targetPitch=Math.max(-1,Math.min(1,targetPitch+y.distance));
          } else if (!down) {vx=0;vy=0;targetYaw=config.current.yaw;targetPitch=config.current.pitch;}
          const previousYaw=config.current.yaw;
          config.current.yaw=follow(config.current.yaw,targetYaw,dt,down && !backgroundGesture);
          config.current.pitch=follow(config.current.pitch,targetPitch,dt,down && !backgroundGesture);
          rotationVelocity=dt>0 ? (config.current.yaw-previousYaw)/dt : 0;
        }
        bandLag=bandSpring.step(rotationVelocity,dt,orbit && !reduced && playing.current,down && !backgroundGesture);
        observedYaw=config.current.yaw;observedPitch=config.current.pitch;
        if (playing.current && !reduced && (!down || backgroundGesture)) {
          if (!unfold || (presentation?.current ?? 0)<1) config.current.time += dt*config.current.speed;
          // The scroll gesture owns the sculpture after opening begins. Keep the
          // background clock independent so stopping mid-unfold holds its shape.
          if (!unfold || (presentation?.current ?? 0)<=0.04) orbitTime += dt*config.current.speed;
        }
        if (playing.current && !reduced) waves=advanceWaves(waves,dt,config.current.tuning?.clickLifetime ?? 4.5);
        const intro = reduced || !playing.current || config.current.time > 10 ? 1 : orbit ? Math.min(age/2.8,1) : 1-Math.pow(1-Math.min(age/2.1,1),4);
        const input=unfold?.current;
        if(input) input.waves=advancePrintWaves(input.waves,dt,playing.current && !reduced,presentation?.current ?? 0,config.current.tuning?.clickLifetime ?? 4.5);
        const tuning=input?.tuning.current;
        if(input && tuning) {
          const smooth=(from:number,to:number)=>reduced || !playing.current ? to : follow(from,to,dt);
          pointerX=smooth(pointerX,playing.current?input.x:0);pointerY=smooth(pointerY,playing.current?input.y:0);
          printPhase=smooth(printPhase,nearestUnfoldPhase(printPhase,tuning.seed%1000/100));
        }
        const story=tuning?{waves:input!.waves,time:orbitTime,x:pointerX,y:pointerY,phase:printPhase,spread:tuning.spread,motion:reduced || !playing.current?0:tuning.motion,typeScale:tuning.typeScale}:undefined;
        try { const signature=JSON.stringify(config.current)+intro+JSON.stringify(waves)+(presentation?.current ?? 0)+JSON.stringify(story)+bandLag; if (signature !== drawn) { renderer.render(config.current,intro,waves,presentation?.current ?? 0,story,bandLag); drawn=signature; } } catch(e) { fail(e instanceof Error ? e.message : "Renderfehler"); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    const resize = () => { const r = el.getBoundingClientRect(); renderer?.resize(r.width,r.height); drawn=""; };
    const observer = new ResizeObserver(resize); observer.observe(el);
    const start = (e: PointerEvent) => {
      if(down || !e.isPrimary || e.button!==0) return;
      const bounds=el.getBoundingClientRect();
      const x=(e.clientX-bounds.left)/bounds.width*2-1,y=1-(e.clientY-bounds.top)/bounds.height*2;
      backgroundGesture=(presentation?.current ?? 0)>0.1 || !insideSculpture(x,y,bounds.width/bounds.height,config.current);
      if(backgroundGesture && !reduced && playing.current) {
        // React on press, not release. Keep rapid clicks responsive without growing GPU state.
        waves=[...waves.slice(-3),createWave(x,y,waveIndex++,config.current.time)];
      }
      down=true;moved=false;travel=0;vx=0;vy=0;
      touchIntent="pending";
      targetYaw=config.current.yaw;targetPitch=config.current.pitch;
      lastX=e.clientX;lastY=e.clientY;lastMove=e.timeStamp;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!down || !e.isPrimary) return;
      const dx=e.clientX-lastX,dy=e.clientY-lastY;
      // The homepage shares vertical touch with the document. The full-screen
      // laboratory still owns both axes and keeps its tilt control.
      const scrollGesture=e.pointerType==="touch" && presentation!==undefined;
      if(scrollGesture && !backgroundGesture && touchIntent==="pending") {
        touchIntent=touchDragIntent(dx,dy);
        if(touchIntent==="pending") return;
        if(touchIntent==="scroll") backgroundGesture=true;
      }
      travel+=Math.hypot(dx,dy);moved=travel>5;
      if(backgroundGesture){lastX=e.clientX;lastY=e.clientY;return;}
      const seconds=Math.max(0.008,(e.timeStamp-lastMove)/1000);
      vx=Math.max(-1.6,Math.min(1.6,dx*0.005/seconds));
      vy=scrollGesture ? 0 : Math.max(-0.8,Math.min(0.8,dy*0.003/seconds));
      const yaw=rotateYaw(config.current.yaw,targetYaw,dx*0.005);
      config.current.yaw=yaw.current;targetYaw=yaw.target;observedYaw=yaw.current;
      if(!scrollGesture) targetPitch=Math.max(-1,Math.min(1,targetPitch+dy*0.003));
      if (!orbit || reduced) {config.current.yaw=targetYaw;config.current.pitch=targetPitch;observedYaw=targetYaw;observedPitch=targetPitch;}
      lastX=e.clientX;lastY=e.clientY;lastMove=e.timeStamp;
    };
    const end = (e: PointerEvent) => {
      if(!down || !e.isPrimary) return;
      down=false;
      if(e.type==="pointercancel" || e.timeStamp-lastMove>80 || reduced) {vx=0;vy=0;}
      if(e.type==="pointercancel") {targetYaw=config.current.yaw;targetPitch=config.current.pitch;}
      if(el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if(!moved && e.type!=="pointercancel") {
        if(!backgroundGesture) regenerate();
      }
    };
    const hide=()=>{if(document.hidden){vx=0;vy=0;down=false;last=0;}};
    document.addEventListener("visibilitychange",hide);
    el.addEventListener("pointerdown",start); el.addEventListener("pointermove",move); el.addEventListener("pointerup",end); el.addEventListener("pointercancel",end);
    void createTypeRenderer(el,config.current,fail,controller.signal).then(value=>{
      if (disposed) { value.dispose(); return; }
      renderer=value; resize(); setStatus(""); onReady?.(true); raf=requestAnimationFrame(tick);
    }).catch(e=>fail(`${en ? "WebGPU is unavailable here" : "WebGPU ist hier nicht verfügbar"}: ${e instanceof Error ? e.message : en ? "Please use a browser with WebGPU." : "Bitte einen Browser mit WebGPU verwenden."}`));
    return () => { disposed=true; controller.abort(); cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener("visibilitychange",hide); media.removeEventListener("change",onReduced); el.removeEventListener("pointerdown",start); el.removeEventListener("pointermove",move); el.removeEventListener("pointerup",end); el.removeEventListener("pointercancel",end); renderer?.dispose(); };
  },[config,playing,regenerate,presentation,unfold,onReady,en]);
  return <><canvas ref={canvas} aria-label={en ? "Spatial lettering. Drag to rotate or click for a new variation. Click the background for a wave." : "Räumliche Schrift. Schrift ziehen zum Drehen oder anklicken für eine neue Variation. Auf den Hintergrund klicken für eine Welle."} />{status && <div className="type-status" role={error ? "alert" : "status"}><strong>{error ? (en ? "The scene could not start." : "Die Szene konnte nicht starten.") : (en ? "One moment." : "Einen Moment.")}</strong><p>{status}</p>{error && <button onClick={()=>location.reload()}>{en ? "Try again" : "Erneut versuchen"}</button>}</div>}</>;
}
