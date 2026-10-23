# Orbit laboratory

Open `/lab/type`. Orbit is the selected direction. This isolated route is not imported by the homepage. vgpu/WebGPU renders extruded typographic rings with studio lighting and an optional moving character field.

## Controls

The lab uses Mandarine/Tinte. A dark inline DialKit panel overlays the stage and can be hidden from the header. Its 27 controls cover the base raster, ambient wave, click impulse and their interaction. Definitions, ranges and defaults live in `background-tuning.ts`; `BackgroundDials.tsx` writes directly to the shared configuration ref. Settings persist to `tz-background-tuning`, are validated on reload, and can be reset or exported as JSON. The export contains tuning settings only. Graphit and the visible Orbit heading remain removed.

Drag the sculpture to rotate, click it for a new seed, and press the background for a wave. Pause and R/replay remain available. Reduced motion suppresses impulses. The default raster opacity is 8.5%, ambient strength 0.22 and click strength 1.15. The fixed raster stays visible while the click wake softens and attenuates the ambient light.

## Files

- `renderer.ts`, `orbit.wgsl`: curved glyph fronts/backs, contour walls and material lighting.
- `orbit-geometry.ts`: subpixel contour extraction from the full-resolution glyph mask.
- `orbit-motion.ts`, `TypeScene.tsx`: frame-rate independent release motion, interaction and lifecycle.
- `orbit-field.wgsl`, `orbit-backdrop.wgsl`: personal character field and studio/flow alternatives.
- `config.ts`: shared validation, defaults and reproducible seed phase transitions.

Reduced motion disables automatic movement. Hidden tabs do not draw. DPR is capped. No generated images, three.js renderer, or live deployment is involved. Lighting and the soft grounding shadow are art-directed approximations.

## Archived directions

Folio source (`folio*`) was authored by Claude Code Fable High, integrated and visually checked before the user selected Orbit. It is no longer imported by the lab. Echo is documented in `docs/echo-idea.md`. `type.wgsl` and `picker.css` are retained reference files from the initial exploration, not live imports.

## Verification

Historical checks before removal of the tuning panel: both colorways, lighting/material controls, pointer rotation and release, new seeds, pause/replay, save/restore, mobile layout, reduced motion and missing-WebGPU handling. DialKit sliders, keyboard adjustment, save and panel reopening were checked. TypeScript, scoped ESLint, project tests and production build passed. Browser GPU compilation was verified; standalone CLI GPU validation had no adapter in the sandbox. No claim of CI or production verification.

Latest checks after removing the controls and adding impulses: TypeScript, scoped ESLint and six focused tests passed; desktop GPU rendering, a background click and Pause were checked in ego-browser.

Dark DialKit verification: all 27 sliders rendered, the three opacity controls adjusted independently by keyboard, reset restored defaults, reload restored settings, and JSON export downloaded successfully. Browser GPU shader compilation passed.

Latest refinement: ambient light uses slowly advected broad folds rather than rotating torus silhouettes. A click has a primary outward front plus a delayed short directional compression inside it, with shared displacement and wake. The two Random buttons independently change only ambient controls or click/after-impulse controls; raster and interaction settings stay intact. Both actions were verified via UI and persisted values, then the original settings were restored.
