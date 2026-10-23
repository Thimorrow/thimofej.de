export const printDefaults = { seed: 241023, typeScale: 1, space: 1, spread: 0.65, motion: 1 };
export type PrintConfig = typeof printDefaults;

export function validPrintConfig(value: unknown): value is PrintConfig {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  const ranges = { seed: [0, 4294967295], typeScale: [0.8, 1.1], space: [0.8, 1.3], spread: [0, 1], motion: [0, 1.5] };
  return Object.keys(c).length === 5 && Object.entries(ranges).every(([key, [min, max]]) => typeof c[key] === 'number' && Number.isFinite(c[key]) && c[key] >= min && c[key] <= max) && Number.isInteger(c.seed);
}

// Only the saved seed determines the print. Pointer and scroll are transient input.
export function printRows(seed: number) {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  return Array.from({length: 9}, (_, i) => ({offset: (random() - 0.5) * 22, stretch: 0.8 + random() * 0.45, direction: i % 2 ? -1 : 1}));
}
