import test from 'node:test';
import assert from 'node:assert/strict';
import { missions, appendAnswer, progressFor, resultMarkdown } from '../src/components/academy/mission-model.ts';

test('each demo mission can finish with its own answers and export a complete result', () => {
  for (const mission of missions) {
    let answers = [];
    assert.equal(progressFor(mission, answers), 0);
    for (let i = 0; i < mission.steps.length; i++) {
      const answer = `Eigener Kontext für ${mission.id}, Schritt ${i + 1}\nZweite Zeile`;
      answers = appendAnswer(mission, answers, answer);
      assert.equal(answers.length, i + 1);
      assert.ok(resultMarkdown(mission, answers).includes(answer));
      assert.ok(resultMarkdown(mission, answers).includes(mission.steps[i].heading));
    }
    assert.equal(progressFor(mission, answers), 100);
    assert.equal(appendAnswer(mission, answers, 'extra'), answers);
    assert.match(resultMarkdown(mission, answers), /kein KI-generiertes Ergebnis/);
  }
});

test('empty, whitespace and oversized answers never advance a mission or mutate its previous result', () => {
  const mission = missions[0];
  const answers = ['Meine Rolle'];
  for (const invalid of ['', '  \n  ', 'x'.repeat(1501)]) {
    assert.equal(appendAnswer(mission, answers, invalid), answers);
  }
  const next = appendAnswer(mission, answers, '  Meine eigene Antwort  ');
  assert.deepEqual(answers, ['Meine Rolle']);
  assert.deepEqual(next, ['Meine Rolle', 'Meine eigene Antwort']);
});

test('the sample tour can complete every mission and draft exports contain no unanswered sections', () => {
  for (const mission of missions) {
    let answers = [];
    for (const step of mission.steps) answers = appendAnswer(mission, answers, step.suggestions[0]);
    assert.equal(progressFor(mission, answers), 100);
    const draft = resultMarkdown(mission, answers.slice(0, 1));
    assert.ok(draft.includes(mission.steps[0].heading));
    assert.ok(!draft.includes(mission.steps[1].heading));
  }
});
