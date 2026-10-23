import { draw, frame, init, sampler, surface, target, texture, type Gpu } from "vgpu";
import sheetShader from "./folio.wgsl";
import wallShader from "./folio-backdrop.wgsl";
import { palettes, seeded, type Config } from "./config";
import { SHEET, creaseAngle, creaseLayout, type Crease } from "./folio-geometry";
import { ATLAS, typesetSheet } from "./folio-type";

const WALL_Z = -3.3;
const FAMILY = "TypeLabSans";

/** FontFaceSet.check() answers true for families it has never seen, so look for the face itself. */
async function ensureFont() {
  await document.fonts.ready;
  const present = [...document.fonts].some(face => face.family.replace(/["']/g, "") === FAMILY && face.status === "loaded");
  if (present) return;
  const face = new FontFace(FAMILY, 'url("/type-lab/inter.woff2")', { weight: "100 900" });
  await face.load();
  document.fonts.add(face);
}

export async function createFolioRenderer(canvas: HTMLCanvasElement, config: Config, fail: (message: string) => void, signal: AbortSignal) {
  let gpu: Gpu | undefined;
  try {
    try { await ensureFont(); } catch { /* A missing woff2 falls back to the system sans; the scene still runs. */ }
    signal.throwIfAborted();
    gpu = await init({ label: "Folio · vgpu", powerPreference: "high-performance" });
    signal.throwIfAborted();
    const context = gpu;
    signal.addEventListener("abort", () => context.dispose(), { once: true });
    context.onError(error => fail(error.message));
    void context.lost.then(() => { if (!context.disposed) fail("Die GPU-Verbindung wurde unterbrochen. Bitte neu laden."); });

    const stage = surface(context, canvas, { autoResize: false, size: [1, 1], dpr: 1, depth: true, msaa: 4 });
    const shadows = target(context, { size: [1, 1], format: "rgba8unorm", clearColor: [0, 0, 0, 1], label: "folio shadow" });
    const atlas = document.createElement("canvas");
    atlas.width = ATLAS.width; atlas.height = ATLAS.height;
    const ctx = atlas.getContext("2d");
    if (!ctx) throw new Error("Die Schrift konnte nicht vorbereitet werden.");
    const letters = texture(context, { kind: "2d", size: [ATLAS.width, ATLAS.height], format: "rgba8unorm", usage: ["texture_binding", "copy_dst", "render_attachment"] });
    let lastText = "";
    const writeText = (text: string) => {
      typesetSheet(ctx, text, `"${FAMILY}", sans-serif`);
      context.gpu.queue.copyExternalImageToTexture({ source: atlas }, { texture: letters.gpu }, [ATLAS.width, ATLAS.height]);
      lastText = text;
    };
    writeText(config.text);

    // Cache by seed only: saved configurations must not depend on a previous render.
    let layoutSeed=config.seed, layout=creaseLayout(config.seed);
    const creasesFor=(c:Config):Crease[]=>{
      if(c.seed!==layoutSeed){layoutSeed=c.seed;layout=creaseLayout(c.seed);}
      return layout;
    };

    let aspect = 1;
    const uniforms = (c: Config, intro: number, pass: number, creases: Crease[]) => {
      const palette = palettes[c.palette];
      const arrival = 1 - intro;
      const depth = (c.depth - 0.2) / 1.4;
      const focal = 2.35 - 0.7 * depth;
      const camera = (Math.max(9.4, 9.6 / aspect) + arrival * 2.6) * focal / 2;
      const phase = seeded(c.seed)() * 6.283;
      const yaw = c.yaw - (0.16 + 0.22 * depth) + Math.sin(c.time * 0.21 + phase) * 0.06 - arrival * 0.55;
      const pitch = c.pitch + 0.1 + Math.sin(c.time * 0.17 + phase * 2) * 0.025 + arrival * 0.15;
      const lift = -0.25 + Math.sin(c.time * 0.3 + phase) * 0.05 - arrival * 0.3;
      const angle = Math.max(-1.2, Math.min(1.2, c.light ?? 0));
      const light = [-0.3 * Math.cos(angle) + 0.85 * Math.sin(angle), 0.42, 0.3 * Math.sin(angle) + 0.85 * Math.cos(angle)];
      const translucency = 1 - Math.min(1, Math.max(0, ((c.thickness ?? 0.045) - 0.015) / 0.085));
      return {
        view: [aspect, focal, camera, pass],
        motion: [yaw, pitch, lift, arrival],
        shape: [c.depth, c.bend, c.scale, WALL_Z],
        ink: [...palette.ink, 1],
        paper: [...palette.background, 1],
        light: [...light, c.roughness ?? 0.38],
        sheet: [SHEET.width, SHEET.height, SHEET.creaseRadius, translucency],
        creases: creases.map(k => [k.position, creaseAngle(k, c.time, c.bend, depth, arrival), 0, 0]),
      };
    };
    const backdrop = (c: Config) => ({ color: [...palettes[c.palette].background, 1], view: [aspect, 0.36, -0.5, 0.75] });

    const linearSampler = sampler(context, { minFilter: "linear", magFilter: "linear" });
    const vertices = SHEET.columns * SHEET.rows * 6;
    const initial = creasesFor(config);
    const sheetDraw = draw(context, { shader: sheetShader, vertices, label: "folio sheet", set: { settings: uniforms(config, 1, 0, initial), letters, linearSampler } });
    const shadowDraw = draw(context, { shader: sheetShader, vertices, depth: false, label: "folio shadow", set: { settings: uniforms(config, 1, 1, initial), letters, linearSampler } });
    const wallDraw = draw(context, { shader: wallShader, vertices: 3, depth: false, label: "folio wall", set: { background: backdrop(config), shadow: shadows, linearSampler } });
    await Promise.all([sheetDraw.compile(stage), shadowDraw.compile(shadows), wallDraw.compile(stage)]);
    signal.throwIfAborted();

    return {
      resize(width: number, height: number) {
        const dpr = Math.min(devicePixelRatio, 1.75);
        aspect = width / height;
        const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
        stage.resize([w, h]);
        shadows.resize([Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3))]);
      },
      render(c: Config, intro = 1) {
        if (lastText !== c.text) writeText(c.text);
        const creases = creasesFor(c);
        stage.clearColor = [...palettes[c.palette].background, 1];
        sheetDraw.set({ settings: uniforms(c, intro, 0, creases) });
        shadowDraw.set({ settings: uniforms(c, intro, 1, creases) });
        wallDraw.set({ background: backdrop(c) });
        frame(context, f => {
          f.pass(shadows, pass => { pass.draw(shadowDraw); });
          f.pass(stage, pass => { pass.draw(wallDraw); pass.draw(sheetDraw); });
        });
      },
      dispose() { context.dispose(); },
    };
  } catch (error) { gpu?.dispose(); throw error; }
}
