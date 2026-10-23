/** Exact exponential integration: coast distance is independent of refresh rate. */
export function coast(velocity: number, seconds: number) {
  const decay=Math.exp(-4.5*Math.max(0,seconds));
  return {distance:velocity*(1-decay)/4.5,velocity:Math.abs(velocity*decay)<0.002 ? 0 : velocity*decay};
}
export function follow(current: number,target: number,seconds: number) {
  const next=target+(current-target)*Math.exp(-22*Math.max(0,seconds));
  return Math.abs(target-next)<0.00001 ? target : next;
}
