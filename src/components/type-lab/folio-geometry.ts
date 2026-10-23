import { seeded } from "./config";

/** Sheet proportions in world units plus the vertex grid the shader unfolds along u. */
export const SHEET = { width: 8.6, height: 3.5, columns: 512, rows: 4, slots: 8, creaseRadius: 0.014 } as const;

export type Crease = { position: number; amplitude: number; lag: number };

/** Seeded crease layout: three to six vertical creases, accordion-alternating with at most one rolled repeat. */
export function creaseLayout(seed: number): Crease[] {
  const rnd = seeded(seed);
  const count = 3 + Math.floor(rnd() * 4);
  const leftToRight = rnd() < 0.5;
  let sign = rnd() < 0.5 ? 1 : -1, repeated = false;
  const creases: Crease[] = [];
  for (let i = 0; i < count; i++) {
    const position = (i + 1) / (count + 1) + (rnd() - 0.5) * 0.5 / (count + 1);
    if (i > 0) {
      if (!repeated && rnd() < 0.22) repeated = true; else { sign = -sign; repeated = false; }
    }
    const order = leftToRight ? i : count - 1 - i;
    creases.push({ position, amplitude: sign * (0.72 + rnd() * 0.28), lag: order * 0.24 + (rnd() - 0.5) * 0.1 });
  }
  while (creases.length < SHEET.slots) creases.push({ position: 0.5, amplitude: 0, lag: 0 });
  return creases;
}

/** Blends two layouts; slots that vanish keep their place so they fade instead of sliding across the sheet. */
export function blendCreases(from: Crease[], to: Crease[], progress: number): Crease[] {
  const p = Math.min(1, Math.max(0, progress));
  const ease = p * p * (3 - 2 * p);
  return from.map((a, i) => {
    const b = to[i];
    const moves = b.amplitude !== 0 && a.amplitude !== 0;
    const anchor = a.amplitude === 0 ? b : a;
    return {
      position: moves ? a.position + (b.position - a.position) * ease : anchor.position,
      amplitude: a.amplitude + (b.amplitude - a.amplitude) * ease,
      lag: moves ? a.lag + (b.lag - a.lag) * ease : anchor.lag,
    };
  });
}

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * Signed fold angle of one crease in radians. The cycle dwells open, closes in a wave that
 * travels through the lags and returns; the intro arrives fully folded and lets go.
 */
export function creaseAngle(crease: Crease, time: number, bend: number, depth: number, arrival: number) {
  const wave = 0.5 - 0.5 * Math.cos(time * 0.7 - crease.lag);
  const closed = Math.min(1, smooth(0.3, 1, wave) + arrival * 1.15);
  const rest = 0.05 + 0.07 * depth;
  return crease.amplitude * (rest + (1 - rest) * closed) * bend * 1.54;
}
