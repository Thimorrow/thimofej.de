/** Ink mask of the whole sheet: the name set bold, flush left, low on the page, with the field above left empty. */
export const ATLAS = { width: 2560, height: 1040 } as const;
const MARGIN = 0.08, MEASURE = 0.84, CAP_LIMIT = 0.46, BASELINE = 0.79;

export function typesetSheet(ctx: CanvasRenderingContext2D, text: string, family: string) {
  const { width, height } = ATLAS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "black"; ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const probe = 100;
  // Tight display tracking; engines without canvas letterSpacing simply keep the default fit.
  const spacing = (size: number) => { (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${(-0.028 * size).toFixed(2)}px`; };
  ctx.font = `850 ${probe}px ${family}`; spacing(probe);
  const measured = ctx.measureText(text);
  const inkWidth = Math.max(1, measured.actualBoundingBoxRight + measured.actualBoundingBoxLeft);
  const capHeight = Math.max(1, measured.actualBoundingBoxAscent);
  const size = Math.min(width * MEASURE / inkWidth, height * CAP_LIMIT / capHeight) * probe;
  ctx.font = `850 ${size.toFixed(1)}px ${family}`; spacing(size);
  const final = ctx.measureText(text);
  ctx.fillStyle = "white";
  ctx.fillText(text, width * MARGIN + final.actualBoundingBoxLeft, height * BASELINE);
}
