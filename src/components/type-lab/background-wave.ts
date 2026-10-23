import type { Config } from './config';

export type Wave = { x: number; y: number; age: number; variation: number };
export const WAVE_LIFETIME = 4.5;
/** A low-discrepancy sequence varies each impulse without abrupt random jumps. */
export function createWave(x: number, y: number, index: number, sceneTime = 0): Wave {
  return { x, y, age: 0, variation: ((0.23 + index * 0.61803398875 + sceneTime * 0.071 + x * 0.17 + y * 0.13) % 1 + 1) % 1 };
}
export function advanceWaves(waves: Wave[], dt: number, lifetime = WAVE_LIFETIME): Wave[] {
  return waves.map(w => ({ ...w, age: w.age + Math.max(0, dt) })).filter(w => w.age < lifetime);
}
/** Conservative projected sculpture envelope; gaps between letters still belong to the sculpture. */
export function insideSculpture(x: number, y: number, aspect: number, c: Config): boolean {
  const camera = Math.max(9, 8.5 / aspect);
  const radius = (2.42 + c.depth * 0.24 + (c.thickness ?? 0.03)) * c.scale;
  const extent = 2.9 * c.scale;
  const perspective = 2.1 / (camera - radius * 0.65);
  const halfX = radius * perspective / aspect;
  const halfY = (extent * Math.cos(c.pitch) + radius * Math.abs(Math.sin(c.pitch))) * perspective;
  return (x / halfX) ** 2 + (y / halfY) ** 2 <= 1;
}
