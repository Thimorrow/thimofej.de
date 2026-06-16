// Two one-shot intro signals, module-level (not window) so they stay typed and
// SSR-safe — no listener can run before hydration anyway.
//
//  - introDone  : the preloader curtain has lifted. The particle drone-flight
//                 starts here, and the page chrome hides for a fullscreen ride.
//  - worldReady : the flight has arrived (or the user scrolled past it). The
//                 hero text and nav reveal here, not before.

type Signal = { done: boolean; subs: Set<() => void> };

function makeSignal(): Signal {
  return { done: false, subs: new Set() };
}

function fire(sig: Signal) {
  if (sig.done) return;
  sig.done = true;
  sig.subs.forEach((f) => f());
  sig.subs.clear();
}

function subscribe(sig: Signal, cb: () => void): () => void {
  if (sig.done) {
    queueMicrotask(cb);
    return () => {};
  }
  sig.subs.add(cb);
  return () => sig.subs.delete(cb);
}

const introDone = makeSignal();
const worldReady = makeSignal();

export const markIntroDone = () => fire(introDone);
export const onIntroDone = (cb: () => void) => subscribe(introDone, cb);

export const markWorldReady = () => fire(worldReady);
export const onWorldReady = (cb: () => void) => subscribe(worldReady, cb);
