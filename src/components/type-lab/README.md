# Orbit laboratory

Open `/lab/type` for the laboratory. The homepage and `/lab/home` share the Orbit scene, including its scroll unfolding. Three.js/WebGL renders the extruded typographic rings, studio lighting and moving character field. WebGPU is not required.

## Controls

The lab uses Mandarine/Tinte. A dark inline DialKit panel overlays the stage and can be hidden from the header. Its 27 controls cover the base raster, ambient wave, click impulse and their interaction. Definitions, ranges and defaults live in `background-tuning.ts`; `BackgroundDials.tsx` writes directly to the shared configuration ref. Settings persist to `tz-background-tuning`, are validated on reload, and can be reset or exported as JSON. The export contains tuning settings only. Graphit and the visible Orbit heading remain removed.

Drag the sculpture to rotate, click it for a new seed, and press the background for a wave. Pause and R/replay remain available. Reduced motion suppresses impulses. The default raster opacity is 8.5%, ambient strength 0.22 and click strength 1.15. The fixed raster stays visible while the click wake softens and attenuates the ambient light.

## Files

- `renderer.ts`, `orbit-shaders.ts`: curved glyph fronts/backs, contour walls, material lighting and the character-field passes.
- `orbit-geometry.ts`: subpixel contour extraction from the full-resolution glyph mask.
- `orbit-motion.ts`, `TypeScene.tsx`: frame-rate independent release motion, interaction and lifecycle.
- `config.ts`: shared validation, defaults and reproducible seed phase transitions.

Reduced motion disables automatic movement. Hidden tabs do not draw. DPR is capped. Canvas glyph atlases retain the loaded Geist fonts. Lighting and the soft grounding shadow are art-directed approximations. If WebGL fails, the homepage keeps its HTML lettering, personal information and contact links.

## Archived directions

Folio geometry, typesetting and WGSL files remain reference material from before the user selected Orbit. The unused vgpu Folio renderer was removed during the WebGL migration; its implementation remains in Git history. Echo is documented in `docs/echo-idea.md`. `type.wgsl` and `picker.css` are also reference files, not live imports.

## Verification

The WebGL migration was compared with the original renderer side by side at fixed configuration, time, click age and five unfolding phases. Shader compilation and browser checks are separate from TypeScript and unit tests. `scripts/check-webgl-shaders.mjs` compiles and links the active Orbit and filmflight shader programs in a browser.

Historical checks before removal of the tuning panel: both colorways, lighting/material controls, pointer rotation and release, new seeds, pause/replay, save/restore, mobile layout, reduced motion and missing-WebGPU handling. DialKit sliders, keyboard adjustment, save and panel reopening were checked. TypeScript, scoped ESLint, project tests and production build passed. Browser GPU compilation was verified; standalone CLI GPU validation had no adapter in the sandbox. No claim of CI or production verification.

Latest checks after removing the controls and adding impulses: TypeScript, scoped ESLint and six focused tests passed; desktop GPU rendering, a background click and Pause were checked in ego-browser.

Dark DialKit verification: all 27 sliders rendered, the three opacity controls adjusted independently by keyboard, reset restored defaults, reload restored settings, and JSON export downloaded successfully. Browser GPU shader compilation passed.

Latest refinement: ambient light uses slowly advected broad folds rather than rotating torus silhouettes. A click has a primary outward front plus a delayed short directional compression inside it, with shared displacement and wake. The two Random buttons independently change only ambient controls or click/after-impulse controls; raster and interaction settings stay intact. Both actions were verified via UI and persisted values, then the original settings were restored.
