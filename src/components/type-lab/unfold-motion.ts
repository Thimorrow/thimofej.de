import type { MutableRefObject } from 'react';

export type UnfoldInput = {
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
  const t=Math.max(0,Math.min(1,(progress-.12)/.76));
  return t*t*(3-2*t);
}
