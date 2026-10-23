import type { MutableRefObject } from 'react';
import { advanceWaves, type Wave } from './background-wave.ts';

export type UnfoldInput = {
  waves: Wave[];
  x: number;
  y: number;
  tuning: MutableRefObject<{seed:number;spread:number;motion:number;typeScale:number}>;
};

export function unfoldProgress(scroll: number, viewport: number) {
  const y=Math.max(0,scroll)/Math.max(1,viewport);
  if(y<=1.1) return y/1.1;
  return 1+Math.max(0,Math.min(1,(y-1.6)/1));
}

export function unfoldTone(progress: number) {
  const t=Math.max(0,Math.min(1,(progress-.12)/.60));
  return t*t*(3-2*t);
}

/** Reach the same pattern without cycling through unnecessary intermediate waves. */
export function nearestUnfoldPhase(current: number, target: number) {
  return current + Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

/** Cancel rather than freeze a pulse when leaving the print or stopping motion. */
export function advancePrintWaves(waves: Wave[], dt: number, playing: boolean, presentation: number, lifetime=4.5) {
  return playing && presentation>=0.84 && presentation<1.72 ? advanceWaves(waves,dt,lifetime) : [];
}

export function queuePrintWave(waves: Wave[], wave: Wave) {
  return [...waves.slice(-3),wave];
}
