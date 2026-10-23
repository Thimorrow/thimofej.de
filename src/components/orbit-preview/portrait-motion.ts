// Keep the entry point fixed; personal content settles before the reading position.
// A direct anchor, reload in the section, or reverse scroll needs no remembered state.
export function portraitReveal(top: number, viewport: number, settledAt = 0.28) {
  const height=Math.max(1,viewport);
  const progress=Math.max(0,Math.min(1,(height*0.77-top)/(height*(0.77-settledAt))));
  return progress*progress*(3-2*progress);
}
