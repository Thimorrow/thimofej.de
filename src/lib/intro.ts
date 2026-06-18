// Intro lifecycle, module-level (not window) so it stays typed and SSR-safe — no
// listener can run before hydration anyway.
//
// Two LATCHING boot signals (race-safe: a late subscriber still fires once):
//  - introDone  : the gate was entered, or a returning-visitor skip was decided.
//                 The particle flight starts here (or jumps straight to the hero
//                 when skipFlight() is set).
//  - worldReady : the hero/chrome reveal for the SKIP and reduced-motion paths,
//                 where there is no flight to wait for.
//
// Two NON-LATCHING events (only ever fired by a user click long after mount, so
// no subscribe race is possible):
//  - replay : the visitor asked to see the intro again.
//  - arrive : a flight finished (first run or replay) — reveal the hero text.

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

// Returning visitors skip the flight. Set BEFORE markIntroDone().
let _skip = false;
export const setSkipFlight = (v: boolean) => {
  _skip = v;
};
export const skipFlight = () => _skip;

function makeEvent() {
  const subs = new Set<() => void>();
  const on = (cb: () => void) => {
    subs.add(cb);
    return () => subs.delete(cb);
  };
  const emit = () => subs.forEach((f) => f());
  return { on, emit };
}

const replay = makeEvent();
export const onReplay = replay.on;
export const requestReplay = replay.emit;

const arrive = makeEvent();
export const onArrive = arrive.on;
export const emitArrive = arrive.emit;

// Persisted "the visitor has seen the intro at least once" flag. localStorage so
// it survives across sessions — the flight auto-plays exactly once, ever.
const SEEN_KEY = "tz-intro-seen";
export function introSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
export function markIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // private mode / storage disabled — just replay each visit, no crash.
  }
}
