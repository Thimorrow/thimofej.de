export type DemoTimer =
  | { kind: 'idle'; duration: number }
  | { kind: 'running'; duration: number; deadline: number }
  | { kind: 'paused'; duration: number; remaining: number };

export function timerRemaining(timer: DemoTimer, now: number): number {
  if (timer.kind === 'running') return Math.max(0, Math.ceil((timer.deadline - now) / 1000));
  return timer.kind === 'paused' ? Math.ceil(timer.remaining) : timer.duration;
}

export function pauseTimer(timer: DemoTimer, now: number): DemoTimer {
  return timer.kind === 'running' ? {kind: 'paused', duration: timer.duration, remaining: Math.max(0, (timer.deadline - now) / 1000)} : timer;
}

export function toggleTimer(timer: DemoTimer, now: number): DemoTimer {
  if (timer.kind === 'running') return pauseTimer(timer, now);
  const remaining = (timer.kind === 'paused' ? timer.remaining : timer.duration) || timer.duration;
  return {kind: 'running', duration: timer.duration, deadline: now + remaining * 1000};
}

export function extendTimer(timer: DemoTimer): DemoTimer {
  if (timer.kind === 'running') return {...timer, deadline: timer.deadline + 300_000};
  if (timer.kind === 'paused') return {...timer, remaining: timer.remaining + 300};
  return {kind: 'paused', duration: timer.duration, remaining: timer.duration + 300};
}

export function timerClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
