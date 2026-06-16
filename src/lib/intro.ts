// Tiny one-shot signal: the Preloader fires it when the curtain has lifted; the
// hero text listens so its reveal hands off cleanly from the intro instead of
// guessing with a hard-coded delay. Module-level (not window) so it stays typed
// and SSR-safe — no listener can run before hydration anyway.
let done = false;
const subs = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((f) => f());
  subs.clear();
}

// Subscribe to the intro-finished signal. If it already fired, the callback runs
// on the next microtask. Returns an unsubscribe.
export function onIntroDone(cb: () => void): () => void {
  if (done) {
    queueMicrotask(cb);
    return () => {};
  }
  subs.add(cb);
  return () => subs.delete(cb);
}
