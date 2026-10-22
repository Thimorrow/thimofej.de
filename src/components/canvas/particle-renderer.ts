import { draw, effect, frame, init, sampler, storage, surface, target, type Gpu } from "vgpu";
import worldShader from "./world.wgsl";
import bloomShader from "./bloom.wgsl";
import presentShader from "./present.wgsl";
import { packParticleWorld, type ParticleWorld } from "./particle-world";
import type { ParticleScene } from "./particle-scene";

/** WebGPU owns drawing and post-processing; Three.js supplies camera math only. */
export async function createParticleRenderer(canvas: HTMLCanvasElement, world: ParticleWorld, lowEnd: boolean, onError: (error: Error) => void) {
  let gpu: Gpu | undefined;
  try {
    gpu = await init({ powerPreference: lowEnd ? "low-power" : "high-performance", label: "Thimorrow particle world" });
    const context = gpu;
    context.onError(onError);
    void context.lost.then(() => {
      if (!context.disposed) onError(new Error("WebGPU device lost"));
    });
    const screen = surface(context, canvas, { autoResize: false, size: [1, 1], dpr: 1 });
    const sceneTarget = target(context, { size: [1, 1], format: "rgba16float", clearColor: [0.0021247, 0.0030353, 0.0060488, 1] });
    const bloomX = target(context, { size: [1, 1], format: "rgba16float" });
    const bloomY = target(context, { size: [1, 1], format: "rgba16float" });
    const linearSampler = sampler(context, { magFilter: "linear", minFilter: "linear", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });
    const packed = packParticleWorld(world);
    const particles = storage(context, packed.byteLength, "read");
    particles.write(packed);
    const cloud = draw(context, {
      shader: worldShader, vertices: 6, instances: world.count, label: "world particles",
      blend: { color: { src: "src-alpha", dst: "one" }, alpha: { src: "one", dst: "one" } },
      set: { particles },
    });
    const blurX = effect(context, bloomShader, { label: "bloom horizontal", set: { source: sceneTarget, linearSampler, blurParams: [1, 0, 1, 0] } });
    const blurY = effect(context, bloomShader, { label: "bloom vertical", set: { source: bloomX, linearSampler, blurParams: [0, 1, 0, 0] } });
    const present = effect(context, presentShader, { label: "grain and vignette", set: { source: sceneTarget, glow: bloomY, linearSampler, settings: [0, lowEnd ? 0.14 : 0.18, 1, 1] } });
    await Promise.all([cloud.compile(sceneTarget), blurX.compile(bloomX), blurY.compile(bloomY), present.compile(screen)]);
    let width = 1;
    let height = 1;
    return {
      gpu: context,
      resize(cssWidth: number, cssHeight: number, dpr: number) {
        const scale = Math.min(dpr, context.gpu.limits.maxTextureDimension2D / Math.max(1, cssWidth, cssHeight));
        width = Math.max(1, Math.round(cssWidth * scale));
        height = Math.max(1, Math.round(cssHeight * scale));
        screen.resize([width, height]);
        sceneTarget.resize([width, height]);
        const bloomWidth = Math.max(1, Math.ceil(width / 4));
        const bloomHeight = Math.max(1, Math.ceil(height / 4));
        bloomX.resize([bloomWidth, bloomHeight]);
        bloomY.resize([bloomWidth, bloomHeight]);
        blurX.set({ blurParams: [1 / bloomWidth, 0, 1, 0] });
        blurY.set({ blurParams: [0, 1 / bloomHeight, 0, 0] });
        present.set({ settings: [0, lowEnd ? 0.14 : 0.18, width, height] });
      },
      render(scene: ParticleScene) {
        const u = scene.uniforms;
        cloud.set({ scene: {
          model: scene.object.matrixWorld.elements,
          view: scene.camera.matrixWorldInverse.elements,
          projection: scene.camera.projectionMatrix.elements,
          animation: [u.uTime.value, u.uMorph.value, u.uIntroAmt.value, u.uU.value],
          mouse: [...u.uMouse.value.toArray(), u.uMouseActive.value],
          style: [u.uSize.value, u.uOpacity.value, width, height],
          colorA: [...u.uColorA.value.toArray(), 1], colorB: [...u.uColorB.value.toArray(), 1],
        } });
        frame(context, (current) => {
          current.pass(sceneTarget, (pass) => pass.draw(cloud, { instances: scene.drawCount }));
          current.pass(bloomX, blurX);
          current.pass(bloomY, blurY);
          current.pass(screen, present);
        });
      },
      dispose() { context.dispose(); },
    };
  } catch (error) {
    gpu?.dispose();
    throw error;
  }
}

export type ParticleRenderer = Awaited<ReturnType<typeof createParticleRenderer>>;
