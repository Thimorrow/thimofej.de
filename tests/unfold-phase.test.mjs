import test from 'node:test';
import assert from 'node:assert/strict';
import { nearestUnfoldPhase } from '../src/components/type-lab/unfold-motion.ts';

test('remixing reaches the equivalent pattern without a full extra cycle', () => {
  for (const current of [-100, -Math.PI, 0, 3, 6.2, 100]) {
    for (const target of [0, .02, 3.14, 6.27, 9.99]) {
      const next = nearestUnfoldPhase(current, target);
      assert.ok(Math.abs(next - current) <= Math.PI + 1e-12);
      assert.ok(Math.abs(Math.sin(next) - Math.sin(target)) < 1e-12);
      assert.ok(Math.abs(Math.cos(next) - Math.cos(target)) < 1e-12);
      assert.ok(Math.abs(nearestUnfoldPhase(next, target) - next) < 1e-12);
    }
  }
});

test('an interrupted remix takes the shortest route from its current visible phase', () => {
  const current = 6.2;
  const first = nearestUnfoldPhase(current, .1);
  const interrupted = current + (first - current) * .3;
  const reversed = nearestUnfoldPhase(interrupted, 6);
  assert.ok(first > current);
  assert.ok(reversed < interrupted);
  assert.ok(interrupted - reversed < .3);
});
