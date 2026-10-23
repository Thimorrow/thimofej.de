import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/components/academy/mission-model.ts';
import { demoLoopDuration, demoLoopFrame } from '../src/components/academy/demo-loop.ts';

test('automatic tour visits catalog, types each answer, shows the complete result and repeats cleanly', () => {
  for (const mission of missions) {
    const duration = demoLoopDuration(mission);
    assert.equal(demoLoopFrame(0, mission).selected, null);
    assert.equal(demoLoopFrame(3200, mission).selected, mission.id);
    for (let i = 0; i < mission.steps.length; i++) {
      const start = 3200 + i * 6800;
      const typing = demoLoopFrame(start + 3100, mission);
      assert.equal(typing.answers.length, i);
      assert.ok(typing.draft.length > 0);
      assert.ok(mission.steps[i].suggestions[0].startsWith(typing.draft));
      const sent = demoLoopFrame(start + 4400, mission);
      assert.equal(sent.answers.length, i + 1);
      assert.equal(sent.draft, '');
    }
    const result = demoLoopFrame(duration - 1, mission);
    assert.equal(result.view, 'result');
    assert.deepEqual(result.answers, mission.steps.map(step => step.suggestions[0]));
    assert.deepEqual(demoLoopFrame(duration, mission), demoLoopFrame(0, mission));
    assert.deepEqual(demoLoopFrame(duration * 50 + 7000, mission), demoLoopFrame(7000, mission));
  }
});

test('the document stays at the top for reading, scrolls through, and resets on repeat', () => {
  const mission = missions[0];
  const duration = demoLoopDuration(mission);
  const resultStart = duration - 7000;
  assert.equal(demoLoopFrame(resultStart, mission).resultProgress, 0);
  assert.equal(demoLoopFrame(resultStart + 1400, mission).resultProgress, 0);
  assert.equal(demoLoopFrame(resultStart + 3500, mission).resultProgress, .5);
  assert.equal(demoLoopFrame(duration - 1, mission).resultProgress, 1);
  assert.equal(demoLoopFrame(duration, mission).resultProgress, 0);
});
