import type { DemoMission } from './mission-model';

const CATALOG_MS = 3200;
const QUESTION_MS = 1800;
const TYPING_MS = 2600;
const ANSWER_MS = 2400;
const STEP_MS = QUESTION_MS + TYPING_MS + ANSWER_MS;
const RESULT_MS = 7000;

export function demoLoopDuration(mission: DemoMission) {
  return CATALOG_MS + mission.steps.length * STEP_MS + RESULT_MS;
}

/** A pure timeline makes pausing, resuming and every repeat use the same frames. */
export function demoLoopFrame(elapsed: number, mission: DemoMission) {
  const duration = demoLoopDuration(mission);
  const time = Math.max(0, elapsed) % duration;
  const conversationTime = time - CATALOG_MS;
  const stepIndex = Math.floor(conversationTime / STEP_MS);
  const inStep = conversationTime % STEP_MS;
  const result = stepIndex >= mission.steps.length;
  const sent = inStep >= QUESTION_MS + TYPING_MS;
  const count = conversationTime < 0 ? 0 : Math.min(mission.steps.length, stepIndex + Number(sent));
  const example = mission.steps[stepIndex]?.suggestions[0] ?? '';
  const typed = Math.max(0, Math.min(1, (inStep - QUESTION_MS) / TYPING_MS));
  return {
    selected: conversationTime < 0 ? null : mission.id,
    answers: mission.steps.slice(0, count).map(step => step.suggestions[0]),
    draft: conversationTime < 0 || sent || result ? '' : example.slice(0, Math.floor(example.length * typed)),
    view: result ? 'result' as const : 'chat' as const,
    phase: conversationTime < 0 ? 'Mission finden' : result ? 'Ergebnis mitnehmen' : 'Mit Tomo arbeiten',
    progress: time / duration,
    resultProgress: result ? Math.max(0, Math.min(1, (conversationTime - mission.steps.length * STEP_MS - 1400) / 4200)) : 0,
  };
}
