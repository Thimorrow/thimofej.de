import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePrintWaves, queuePrintWave, nearestUnfoldPhase } from '../src/components/type-lab/unfold-motion.ts';

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

test('rapid text clicks keep the four newest pulses without resetting older ages',()=>{
  let waves=[];
  for(let index=0;index<12;index++) {
    waves=advancePrintWaves(waves,.1,true,1);
    waves=queuePrintWave(waves,{x:index/12,y:0,age:0,variation:index});
    assert.ok(waves.length<=4);
  }
  assert.deepEqual(waves.map(w=>w.variation),[8,9,10,11]);
  assert.ok(waves[0].age>waves[1].age && waves[1].age>waves[2].age);
  assert.equal(waves[3].age,0);
  assert.deepEqual(advancePrintWaves(waves,5,true,1),[]);
});

test('pause, reduced motion and leaving the text discard impulses permanently',()=>{
  const pulse=[{x:.3,y:-.2,age:.5,variation:.4}];
  for(const [playing,position] of [[false,1],[true,0],[true,.83],[true,1.72],[true,2]]) {
    const stopped=advancePrintWaves(pulse,.016,playing,position);
    assert.deepEqual(stopped,[]);
    assert.deepEqual(advancePrintWaves(stopped,.016,true,1),[]);
  }
  assert.equal(advancePrintWaves(pulse,.2,true,1)[0].age,.7);
  assert.equal(pulse[0].age,.5);
});
