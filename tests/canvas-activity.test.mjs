import test from 'node:test';
import assert from 'node:assert/strict';
import { subscribeCanvasActivity } from '../src/lib/canvasActivity.ts';

function setup(hidden = false) {
  const visibility = new EventTarget();
  visibility.hidden = hidden;
  let enter;
  let unsubscribed = false;
  const states = [];
  const cleanup = subscribeCanvasActivity(
    callback => { enter = callback; return () => { unsubscribed = true; }; },
    visibility,
    active => states.push(active),
  );
  return {
    states,
    enter: () => enter(),
    show(value) { visibility.hidden = !value; visibility.dispatchEvent(new Event('visibilitychange')); },
    cleanup,
    unsubscribed: () => unsubscribed,
  };
}

test('the GPU scene stays asleep behind the entry gate, then follows tab visibility', () => {
  const scene = setup();
  scene.show(false);
  scene.show(true);
  assert.ok(scene.states.every(active => !active));
  scene.enter();
  scene.show(false);
  scene.show(true);
  assert.deepEqual(scene.states.slice(-3), [true, false, true]);
  scene.cleanup();
});

test('entry while hidden waits for visibility; detached or queued signals cannot wake it', () => {
  const scene = setup(true);
  scene.enter();
  assert.deepEqual(scene.states, [false, false]);
  scene.show(true);
  assert.equal(scene.states.at(-1), true);
  scene.cleanup();
  const count = scene.states.length;
  scene.show(false);
  scene.enter();
  assert.equal(scene.states.length, count);
  assert.equal(scene.unsubscribed(), true);
});
