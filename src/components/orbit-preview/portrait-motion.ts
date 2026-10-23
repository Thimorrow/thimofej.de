// Start once the element reaches 77% of the viewport; settle near the upper third.
// A direct anchor, reload in the section, or reverse scroll needs no remembered state.
export function portraitReveal(top: number, viewport: number) {
  const height=Math.max(1,viewport);
  const progress=Math.max(0,Math.min(1,(height*0.77-top)/(height*0.49)));
  return progress*progress*(3-2*progress);
}
