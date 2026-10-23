# Orbit — selected direction

Aktueller akzeptierter Stand und Einstieg zur Fortsetzung: [orbit-status.md](orbit-status.md). Die folgenden Abschnitte dokumentieren auch überholte Zwischenstände.

User decision, 2026-10-23: "wir machen Orbit". Keep the work in the lab for now; do not publish or replace the homepage as part of this exploration.

## Selected

Three spatial typographic rings, vgpu / WebGPU, actual glyph thickness, satin studio lighting, damped dragging and inertial release. Default tuning was selected through ego-browser comparisons and is stored in `src/components/type-lab/orbit-preset.json`. Mandarine/Tinte is fixed. The character field is the selected background; the palette picker and visible Orbit heading have been removed.

Background reference inspected in Ego: https://x.com/shivasainix/status/2110622613827682570 — a 19-second recording of the Claude Desktop UI. The reference uses a fine character raster whose illumination creates flowing organic forms. Our experiment keeps the centre calm and derives the field from the selected palette.

## Archived alternatives

- Echo: rejected by the user; idea preserved in `docs/echo-idea.md`.
- Folio: independently refined by Claude Code Fable High and visually checked by the primary agent. The printed folded sheet, soft projected shadow and paper lighting are a credible alternative, but the user chose Orbit. Reference source remains in `src/components/type-lab/folio*`; it is no longer imported by the live lab. The prior experiment shader `type.wgsl` remains a source reference, not a separate selectable direction.

## Second opinion and resulting changes

Fable reviewed Orbit read-only. Font loading and camera-dependent view vectors had already been fixed. Subsequent changes increased ring separation, reduced independent tilt, generated contour walls from the full glyph atlas, smoothed contour normals, tinted fill/reflection by the environment, and made seed transitions explicit in saved config. Folio's renderer history-dependent crease blending was removed so its archived config rendering remains reproducible.

## Boundaries

The lighting is an art-directed approximation, not a path tracer. The soft studio grounding shadow is approximate. No generated images, no production promotion and no deployment.

## Personal field and controls

The selected default is the character field. Its character sequences are THIMOFEJ, ZAPKO and THIMORROW with separators. A low-resolution GPU ray-marched pair of rotating forms supplies the lighting of the fixed glyph grid. This follows the observed Claude video principle, without copying assets. The centre is attenuated behind the sculpture.

DialKit and its dependencies were removed at the user's request. Tuning now happens through chat and source edits. The grid is faint across the entire stage; the slow ambient wave locally reveals strong ink. Background presses trigger an immediate, gently irregular pressure wave that refracts the ambient illumination. The raster itself stays fixed. Up to four impulses overlap, with newest input replacing the oldest; reduced motion suppresses impulses and Pause freezes them.

## Normal click-wave refinement

Revisited the X recording at https://x.com/shivasainix/status/2110622613827682570 on 2026-10-23, inspecting successive frames around 3–6 seconds. The normal expanding rim is narrow and unevenly visible. The implementation now uses narrower signed pressure fronts, continuous spatial modulation, and interference between overlapping clicks. This is an interpretation of the visible motion, not the original algorithm. No heart or other symbolic shape is included. Baseline glyph opacity is restored to 4.5%; ambient-wave ink strength is reduced from 0.62 to 0.40 at the user's request.

Click-wave dominance: the impulse now carries a decaying wake. That wake softens and attenuates the ambient illumination locally, while the click crest has higher contrast. The ambient form returns as the wake decays; the 4.5% base raster stays unchanged. Verified browser GPU compilation and a click crossing an ambient form.

## Directed after-impulse reference

User supplied https://x.com/mdnlabs/status/2110417510314967075. Inspected paused frames at 100 ms intervals, especially 5.55–6.05 seconds: an initial ring under the cursor, then a localized brighter inner arc toward the right while the cursor moves down-left. Later larger rings include multiple distinct clicks and must not be treated as one impulse. The recording has no mouse-button overlay, so exact click timing and the original algorithm remain inferred.

The lab now models one input as an outward primary ring plus a delayed short travelling crescent, with its heading frozen per click. Four dark DialKit controls expose delay, distance, strength and duration. No heart shape. Existing raster and ambient opacity settings are preserved.

The detached crescent was replaced by a directional compression originating at the same click point. It remains inside the primary expanding front and fades sooner. Ambient geometry is now a slow advected light field, not a pair of rotating tori. This remains a visual reconstruction from the linked recording, not a verified identical implementation.

## Accepted user tuning, 2026-10-23

User is satisfied with the raster and ambient direction. Applied all 27 supplied numeric values as canonical defaults in `background-tuning.ts`, shared by the renderer, DialKit schema and Reset. Existing local custom settings remain overrides. The two separate Random actions remain; no all-settings Random action is restored.
