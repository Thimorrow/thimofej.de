# Echo — archived exploration

Status: removed from the live typography lab at the user's request, 2026-10-23. Orbit is the preferred direction. Folio remains the comparison. This is an idea archive, not an implementation task.

## Idea

A single name is repeated on ten typographic planes extending into space. A delayed wave of rotation and lateral movement travels through the stack; the planes separate, then visually converge. Near planes are strong, rear planes recede into the background. Dragging changes the view through the stack.

Visual vocabulary: spatial typography, repetition, depth, phased movement. A potentially useful transition or short scene inside a future direction, rather than necessarily a full homepage.

## Why parked

The user liked Orbit strongly, found Folio intermediate, and said Echo was not good. The experiment read as dense, overlapping text and less convincing than the circular spatial construction. Do not reintroduce it merely as an extra option. If revisited, first solve legibility, depth separation and a deliberate readable resting state.

## Reproduction notes from the experiment

- Ten planes, each 7.4 world units wide and 2.6 high.
- Plane `i` at `z = -i * depth * 0.62`.
- Rotation `sin(time * 0.55 - i * 0.14 + seedPhase) * bend * 0.22 + 0.22` about Y, then -0.2 radians about X.
- X offset `sin(i * 0.29 + time * 0.4) * bend * i * 0.13`.
- Y offset `cos(i * 0.23 + time * 0.4) * bend * i * 0.12`.
- Ink strength falls by 0.085 per layer, with a 0.22 minimum.
- Default depth 0.85, bend 0.6, scale 1, speed 0.7, seed 241026.
- Palette: graphite background, chalk-colored lettering.

These are the original experiment's parameters, not a recommendation to reproduce its shortcomings. Earlier mode-2 snapshots are archival; the live lab now accepts only Folio (0) and Orbit (1).
