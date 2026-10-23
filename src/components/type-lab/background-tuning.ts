export const backgroundControls = {
  rasterOpacity: { group: 'Zeichenraster', label: 'Deckkraft', range: [0.085, 0, 0.3, 0.005] },
  gridSize: { group: 'Zeichenraster', label: 'Zeichengröße', range: [1, 0.7, 2, 0.05] },
  ambientOpacity: { group: 'Ruhige Welle', label: 'Deckkraft', range: [0.22, 0, 1, 0.01] },
  ambientSpeed: { group: 'Ruhige Welle', label: 'Tempo', range: [0.55, 0, 2, 0.05] },
  ambientScale: { group: 'Ruhige Welle', label: 'Größe', range: [1, 0.5, 1.8, 0.05] },
  ambientThickness: { group: 'Ruhige Welle', label: 'Breite', range: [0.58, 0.2, 1, 0.02] },
  ambientMerge: { group: 'Ruhige Welle', label: 'Verschmelzung', range: [0.65, 0.05, 1.5, 0.05] },
  ambientSoftness: { group: 'Ruhige Welle', label: 'Weiche Kanten', range: [2, 0.3, 2, 0.05] },
  centerQuiet: { group: 'Ruhige Welle', label: 'Mitte zurücknehmen', range: [0.65, 0, 1, 0.05] },
  clickOpacity: { group: 'Klickwelle', label: 'Deckkraft', range: [1.15, 0, 2, 0.05] },
  clickSpeed: { group: 'Klickwelle', label: 'Ausbreitung', range: [1, 0.3, 2, 0.05] },
  clickWidth: { group: 'Klickwelle', label: 'Ringbreite', range: [0.045, 0.015, 0.2, 0.005] },
  clickWiden: { group: 'Klickwelle', label: 'Breiter werden', range: [0.025, 0, 0.1, 0.005] },
  clickLifetime: { group: 'Klickwelle', label: 'Dauer', range: [4.5, 1, 8, 0.1] },
  clickDecay: { group: 'Klickwelle', label: 'Abklingen', range: [0.8, 0.1, 2, 0.01] },
  clickWarp: { group: 'Klickwelle', label: 'Verformung', range: [2.6, 0, 3, 0.1] },
  clickArcs: { group: 'Klickwelle', label: 'Unregelmäßigkeit', range: [0.75, 0, 1, 0.05] },
  clickEcho: { group: 'Klickwelle', label: 'Nachschwingen', range: [2.4, 0.5, 5, 0.1] },
  clickKick: { group: 'Klickwelle', label: 'Startimpuls', range: [0.3, 0, 0.7, 0.02] },
  reboundDelay: { group: 'Gerichteter Nachimpuls', label: 'Verzögerung', range: [0.18, 0.05, 0.6, 0.01] },
  reboundDistance: { group: 'Gerichteter Nachimpuls', label: 'Strecke', range: [0.35, 0.05, 0.8, 0.01] },
  reboundStrength: { group: 'Gerichteter Nachimpuls', label: 'Stärke', range: [0.85, 0, 1.5, 0.05] },
  reboundDuration: { group: 'Gerichteter Nachimpuls', label: 'Dauer', range: [0.85, 0.3, 1.5, 0.05] },
  refraction: { group: 'Zusammenspiel', label: 'Verdrängung', range: [0.21, 0, 0.4, 0.01] },
  blur: { group: 'Zusammenspiel', label: 'Verschwimmen', range: [0.055, 0, 0.15, 0.005] },
  suppression: { group: 'Zusammenspiel', label: 'Ruhige Welle zurücknehmen', range: [0.85, 0, 1, 0.05] },
  recovery: { group: 'Zusammenspiel', label: 'Rückkehrtempo', range: [3.6, 0.3, 5, 0.1] },
} as const;
export type BackgroundTuning = { [K in keyof typeof backgroundControls]: number };
export const backgroundDefaults = Object.fromEntries(Object.entries(backgroundControls).map(([key, c]) => [key, c.range[0]])) as BackgroundTuning;
export function validBackgroundTuning(value: unknown): value is Partial<BackgroundTuning> {
  return !!value && typeof value === 'object' && Object.entries(value).every(([key, v]) => {
    const c = backgroundControls[key as keyof BackgroundTuning];
    return c && typeof v === 'number' && Number.isFinite(v) && v >= c.range[1] && v <= c.range[2];
  });
}

export function randomBackgroundTuning(random: () => number = Math.random): BackgroundTuning {
  return Object.fromEntries(Object.entries(backgroundControls).map(([key, control]) => {
    const [, min, max, step] = control.range;
    const steps = Math.floor((max - min) / step + 1e-9);
    const sample = Math.min(1 - Number.EPSILON, Math.max(0, random()));
    const value = min + Math.floor(sample * (steps + 1)) * step;
    return [key, Number(Math.min(max, value).toFixed(5))];
  })) as BackgroundTuning;
}

export function randomizeBackgroundGroup(current: BackgroundTuning, group: 'ambient' | 'click', random: () => number = Math.random): BackgroundTuning {
  const generated = randomBackgroundTuning(random);
  const next = { ...current };
  for (const [key, control] of Object.entries(backgroundControls)) {
    const matches = group === 'ambient' ? control.group === 'Ruhige Welle' : control.group === 'Klickwelle' || control.group === 'Gerichteter Nachimpuls';
    if (matches) next[key as keyof BackgroundTuning] = generated[key as keyof BackgroundTuning];
  }
  return next;
}
