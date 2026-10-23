/** Exact exponential integration: coast distance is independent of refresh rate. */
export function coast(velocity: number, seconds: number) {
  const decay=Math.exp(-4.5*Math.max(0,seconds));
  return {distance:velocity*(1-decay)/4.5,velocity:Math.abs(velocity*decay)<0.002 ? 0 : velocity*decay};
}
export function follow(current: number,target: number,seconds: number) {
  const next=target+(current-target)*Math.exp(-22*Math.max(0,seconds));
  return Math.abs(target-next)<0.00001 ? target : next;
}

/** Rebase both angles together so repeated drags never meet a stop or reverse. */
export function rotateYaw(current: number, target: number, delta: number) {
  const next = target + delta;
  const turn = Math.PI * 2;
  const offset = Math.floor((next + Math.PI) / turn) * turn;
  return { current: current - offset, target: next - offset };
}
import { spring } from "motion";


/** Sample Motion's spring on the scene clock, preserving momentum on reversal. */
export function createBandLag() {
  const response = spring({
    keyframes: [0, 0], stiffness: 190, damping: 16, mass: 1,
    restDelta: 0.0001, restSpeed: 0.001,
  });
  let value = 0, velocity = 0;
  return {
    step(angularVelocity: number, seconds: number, enabled = true) {
      if (!enabled) { value = 0; velocity = 0; return 0; }
      if (seconds <= 0) return value;
      const target = -Math.max(-0.36, Math.min(0.36, angularVelocity * 0.18));
      response.retarget!([value, target], velocity);
      const sample = response.next(seconds * 1000);
      value = sample.value;
      velocity = sample.done ? 0 : response.velocity!(seconds * 1000);
      return value;
    },
  };
}
