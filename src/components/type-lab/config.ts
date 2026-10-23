import { validBackgroundTuning, type BackgroundTuning } from "./background-tuning.ts";
import orbitPreset from "./orbit-preset.json" with { type: "json" };
export const directions = [
  { name: "Folio", subtitle: "Schrift, die sich entfaltet.", description: "Eine zusammenhängende Fläche. Sie knickt, öffnet sich und findet wieder zu deinem Namen.", cost: "Grafisch und präzise; weniger körperlich als Orbit.", mode: 0, palette: 0, depth: 0.8, bend: 0.65, scale: 1, speed: 0.65 },
  { name: "Orbit", subtitle: "Ein Name wird ein Körper.", description: "Drei Schriftbänder aus satiniertem Material. Ziehen, loslassen und das Licht über die Kanten wandern lassen.", cost: "Der stärkste Raum; der Name ist nicht ständig ganz lesbar.", mode: 1, palette: 1, depth: 1.1, bend: 0.75, scale: 1, speed: 0.38 },
] as const;
export type Config = { version: 1; tuning?: Partial<BackgroundTuning>; mode: number; palette: number; seed: number; depth: number; bend: number; scale: number; speed: number; time: number; yaw: number; pitch: number; text: string; seedPhaseFrom?: number; seedAt?: number; backgroundStrength?: number; backgroundSpeed?: number; background?: number; phase?: number; roughness?: number; light?: number; thickness?: number };
export function defaults(mode = 0): Config {
  if(mode===1) return {...orbitPreset,version:1};
  const d = directions[mode] ?? directions[0];
  return { version: 1, mode: d.mode, palette: d.palette, seed: 241026, depth: d.depth, bend: d.bend, scale: d.scale, speed: d.speed, time: 0, yaw: 0, pitch: 0, text: "THIMOFEJ", roughness: 0.38, light: 0, thickness: 0.045 };
}
export const palettes = [
  { name: "Papier / Karmin", background: [0.93, 0.915, 0.88], ink: [0.73, 0.12, 0.18], css: "paper" },
  { name: "Mandarine / Tinte", background: [0.95, 0.29, 0.12], ink: [0.105, 0.085, 0.07], css: "orange" },
  { name: "Graphit / Kreide", background: [0.055, 0.06, 0.065], ink: [0.91, 0.9, 0.85], css: "dark" },
] as const;
export function validConfig(v: unknown): v is Config {
  if (!v || typeof v !== "object") return false;
  const c = v as Config;
  return (c.tuning===undefined || validBackgroundTuning(c.tuning)) && (["backgroundStrength","backgroundSpeed"] as const).every(k=>c[k]===undefined || typeof c[k]==="number" && Number.isFinite(c[k]) && c[k]>=0.2 && c[k]<=(k==="backgroundStrength" ? 3 : 2)) && (c.seedPhaseFrom === undefined || typeof c.seedPhaseFrom === "number" && Number.isFinite(c.seedPhaseFrom) && c.seedPhaseFrom>=0 && c.seedPhaseFrom<=Math.PI*2) && (c.seedAt === undefined || typeof c.seedAt === "number" && Number.isFinite(c.seedAt) && c.seedAt>=0 && c.seedAt<=1e8) && (c.background === undefined || Number.isInteger(c.background) && c.background>=0 && c.background<=2) && (c.phase === undefined || typeof c.phase === "number" && Number.isFinite(c.phase) && c.phase>=0 && c.phase<=1e8) && (["roughness", "light", "thickness"] as const).every(key => c[key] === undefined || (typeof c[key] === "number" && Number.isFinite(c[key]))) && (c.roughness === undefined || c.roughness >= 0.18 && c.roughness <= 0.8) && (c.light === undefined || c.light >= -3.14 && c.light <= 3.14) && (c.thickness === undefined || c.thickness >= 0.015 && c.thickness <= 0.1) && c.version === 1 && Number.isInteger(c.mode) && c.mode >= 0 && c.mode <= 1 && Number.isInteger(c.palette) && c.palette >= 0 && c.palette <= 2 && Number.isInteger(c.seed) && c.seed >= 0 && c.seed <= 4294967295 && typeof c.text === "string" && /^[A-ZÄÖÜ0-9 .-]{1,20}$/.test(c.text) &&
    Object.entries({ depth: [0.2, 1.6], bend: [0, 1.2], scale: [0.65, 1.3], speed: [0.1, 1.5], time: [0, 1e8], yaw: [-10, 10], pitch: [-1, 1] }).every(([key, range]) => { const n = c[key as keyof Config]; return typeof n === "number" && Number.isFinite(n) && n >= range[0] && n <= range[1]; });
}
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/** A seed transition is part of the saved config, not hidden renderer state. */
export function seedPhase(c: Config): number {
  const tau=Math.PI*2,target=seeded(c.seed)()*tau;
  if(c.seedPhaseFrom===undefined || c.seedAt===undefined) return target;
  const progress=Math.min(1,Math.max(0,(c.time-c.seedAt)/0.7));
  const ease=progress*progress*(3-2*progress);
  const delta=((target-c.seedPhaseFrom+Math.PI+tau)%tau)-Math.PI;
  return (c.seedPhaseFrom+delta*ease+tau)%tau;
}
