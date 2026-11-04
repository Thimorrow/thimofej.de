export const nativeNotch = {
  openWidth: 500, openHeight: 192,
  compactWidth: 317, compactHeight: 32,
  openRadius: 28, compactRadius: 10, ear: 14,
  duration: .52,
};

const springStops = [
  {t: 0, v: 0}, {t: .035, v: .062}, {t: .085, v: .24},
  {t: .145, v: .5}, {t: .215, v: .76}, {t: .29, v: .93},
  {t: .38, v: 1.024}, {t: .46, v: 1.042}, {t: .56, v: 1.03},
  {t: .7, v: 1.008}, {t: 1, v: 1},
];

export function nativeNotchSpring(progress: number): number {
  const time = Math.max(0, Math.min(1, progress));
  for (let index = 1; index < springStops.length; index++) {
    const a = springStops[index - 1], b = springStops[index];
    if (time <= b.t) return a.v + (b.v - a.v) * (time - a.t) / (b.t - a.t);
  }
  return 1;
}

export function notchFrame(progress: number, containerWidth: number, touchLayout = false) {
  const openWidth = Math.min(nativeNotch.openWidth, containerWidth - 28);
  const compactWidth = Math.min(nativeNotch.compactWidth, openWidth);
  const width = compactWidth + (openWidth - compactWidth) * progress;
  const openHeight = touchLayout ? 252 : nativeNotch.openHeight;
  const height = nativeNotch.compactHeight + (openHeight - nativeNotch.compactHeight) * progress;
  const radius = Math.min(nativeNotch.compactRadius + (nativeNotch.openRadius - nativeNotch.compactRadius) * progress, height / 2, width / 2);
  return {x: (containerWidth - width) / 2, width, height, radius};
}

export function notchPath(frame: ReturnType<typeof notchFrame>, ears: boolean): string {
  const {x, width, height: h, radius: r} = frame;
  const right = x + width;
  const ear = ears ? nativeNotch.ear : 0;
  return [
    `M ${x - ear} 0 L ${right + ear} 0`,
    ears ? `A ${ear} ${ear} 0 0 0 ${right} ${ear}` : '',
    `L ${right} ${h - r} A ${r} ${r} 0 0 1 ${right - r} ${h}`,
    `L ${x + r} ${h} A ${r} ${r} 0 0 1 ${x} ${h - r}`,
    ears ? `L ${x} ${ear} A ${ear} ${ear} 0 0 0 ${x - ear} 0` : `L ${x} 0`,
    'Z',
  ].join(' ');
}
