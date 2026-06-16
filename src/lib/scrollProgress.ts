// Module-level scroll state. The smooth-scroll ScrollTrigger writes here every
// frame; the 3D canvas (Phase 3+) will read it inside useFrame WITHOUT causing
// React re-renders. Intentionally a plain mutable object — see PLAN.md §5.
export const scrollProgress = { progress: 0, velocity: 0, morphTarget: 0 };

export function setScrollProgress(progress: number, velocity: number) {
  scrollProgress.progress = progress;
  scrollProgress.velocity = velocity;
}

// Form index (0..5) the cloud should be morphing toward, derived from which
// section heading is closest to the viewport centre. Lets each form lock in on
// its own section instead of being smeared evenly across total scroll.
export function setMorphTarget(value: number) {
  scrollProgress.morphTarget = value;
}
