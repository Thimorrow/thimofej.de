import test from 'node:test';
import assert from 'node:assert/strict';
import {timerRemaining, toggleTimer, pauseTimer, extendTimer, timerClock} from '../src/components/orbit-preview/lilt-demo-model.ts';

test('focus timer pauses at the remaining deadline and resumes without losing time', () => {
  const running = toggleTimer({kind: 'idle', duration: 1500}, 1000);
  assert.equal(timerRemaining(running, 11_500), 1490);
  const paused = pauseTimer(running, 11_500);
  assert.equal(timerRemaining(paused, 90_000), 1490);
  const resumed = toggleTimer(paused, 90_000);
  assert.equal(timerRemaining(resumed, 100_000), 1480);
});

test('adding five minutes preserves the running or paused state and reset duration', () => {
  const running = extendTimer(toggleTimer({kind: 'idle', duration: 1500}, 1000));
  assert.equal(running.kind, 'running');
  assert.equal(timerRemaining(running, 61_000), 1740);
  const paused = extendTimer(pauseTimer(running, 61_000));
  assert.equal(paused.kind, 'paused');
  assert.equal(timerRemaining(paused, 999_000), 2040);
  assert.equal(paused.duration, 1500);
});

test('rapid pause and resume preserves partial seconds instead of adding time', () => {
  let timer = toggleTimer({kind: 'idle', duration: 60}, 0);
  for (let now=100; now<1000; now+=100) {
    timer = toggleTimer(pauseTimer(timer, now), now);
  }
  assert.equal(timer.kind, 'running');
  assert.equal(timer.deadline, 60_000);
});

test('a finished focus session never goes negative and can restart with its duration', () => {
  const running = toggleTimer({kind: 'idle', duration: 60}, 0);
  assert.equal(timerRemaining(running, 90_000), 0);
  const completed = pauseTimer(running, 90_000);
  assert.equal(timerRemaining(toggleTimer(completed, 100_000), 100_000), 60);
  assert.equal(timerClock(0), '0:00');
  assert.equal(timerClock(1500), '25:00');
  assert.equal(timerClock(61), '1:01');
});
