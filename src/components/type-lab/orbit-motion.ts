import { spring } from "motion";

/** Exact exponential integration: coast distance is independent of refresh rate. */
export function coast(velocity: number, seconds: number) {
  const decay=Math.exp(-4.5*Math.max(0,seconds));
  return {distance:velocity*(1-decay)/4.5,velocity:Math.abs(velocity*decay)<0.002 ? 0 : velocity*decay};
}
export function follow(current: number,target: number,seconds: number,direct = false) {
  if (direct) return target;
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

/** Leave vertical gestures and ambiguous diagonals to native page scrolling. */
export function touchDragIntent(dx: number, dy: number): "pending" | "rotate" | "scroll" {
  if (Math.hypot(dx, dy) < 8) return "pending";
  return Math.abs(dx) > Math.abs(dy) * 1.2 ? "rotate" : "scroll";
}

/** Sample Motion's spring on the scene clock, preserving momentum on reversal. */
export function createBandLag() {
  const response = spring({
    // Physics options retain velocity when retargeted; duration-based springs don't.
    // A damping ratio of ~0.71 gives one small rebound without a loose wobble.
    keyframes: [0, 0], stiffness: 260, damping: 23, mass: 1,
    restDelta: 0.0001, restSpeed: 0.001,
  });
  let value = 0, velocity = 0;
  return {
    step(angularVelocity: number, seconds: number, enabled = true, dragging = true) {
      if (!enabled) { value = 0; velocity = 0; return 0; }
      if (seconds <= 0) return value;
      // The hand owns the overall rotation. Keep only a small bend while held;
      // on release unload that bend, without coasting winding it up again.
      const target = dragging ? -0.18 * Math.tanh(angularVelocity * 0.09 / 0.18) : 0;
      response.retarget!([value, target], velocity);
      const sample = response.next(seconds * 1000);
      value = sample.value;
      velocity = sample.done ? 0 : response.velocity!(seconds * 1000);
      return value;
    },
  };
}
