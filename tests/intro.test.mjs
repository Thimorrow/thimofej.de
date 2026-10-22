import test from 'node:test';
import assert from 'node:assert/strict';

// Each case gets its own module state, like a fresh browser document.
const fresh = () => import(`../src/lib/intro.ts?case=${crypto.randomUUID()}`);

test('a scene loaded after the entry click still receives the start signal once', async () => {
  const intro = await fresh();
  intro.markIntroDone();
  let starts = 0;
  intro.onIntroDone(() => starts++);
  await Promise.resolve();
  intro.markIntroDone();
  assert.equal(starts, 1);
});

test('skip is set before the scene starts and late hero subscribers are revealed', async () => {
  const intro = await fresh();
  intro.setSkipFlight(true);
  intro.markIntroDone();
  intro.markWorldReady();
  let revealed = false;
  intro.onWorldReady(() => { revealed = true; });
  await Promise.resolve();
  assert.equal(intro.skipFlight(), true);
  assert.equal(revealed, true);
});

test('replay, arrival and skip listeners can detach when leaving the homepage', async () => {
  const intro = await fresh();
  let calls = 0;
  const remove = [intro.onReplay, intro.onArrive, intro.onFlightSkip].map(on => on(() => calls++));
  intro.requestReplay();
  intro.emitArrive();
  intro.requestFlightSkip();
  assert.equal(calls, 3);
  remove.forEach(off => off());
  intro.requestReplay();
  intro.emitArrive();
  intro.requestFlightSkip();
  assert.equal(calls, 3);
});

test('disabled browser storage does not prevent entry or crash the intro', async () => {
  const intro = await fresh();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage disabled'); } });
  try {
    assert.equal(intro.introSeen(), false);
    assert.doesNotThrow(() => intro.markIntroSeen());
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
