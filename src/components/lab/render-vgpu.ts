import { draw, frame, init, storage, surface, type Gpu } from "vgpu";
import shader from "./particles.wgsl";
import { createParticleData, type ParticleRenderer } from "./particle-data";

export async function createRenderer(canvas: HTMLCanvasElement, count: number, onError: (error: Error) => void): Promise<ParticleRenderer> {
  let gpu: Gpu | undefined;
  try {
    gpu = await init({ powerPreference: "high-performance", label: "TZ particle experiment" });
    const context = gpu;
    context.onError(onError);
    void context.lost.then(() => {
      if (!context.disposed) onError(new Error("Die Verbindung zur Grafikkarte wurde unterbrochen."));
    });
    const target = surface(context, canvas, {
      autoResize: false,
      clearColor: [7 / 255, 10 / 255, 18 / 255, 1],
      size: [1, 1],
      dpr: 1,
    });
    const data = createParticleData(count);
    const points = storage(context, data.byteLength, "read");
    points.write(data);
    let view = [1, 1, 1, 0];
    const particles = draw(context, {
      shader, vertices: 6, instances: count,
      blend: { color: { src: "src-alpha", dst: "one" }, alpha: { src: "one", dst: "one" } },
      set: { points, settings: { view, mouse: [0, 0, 0, 0], motion: [0, 0, 0, 0] } },
    });
    await particles.compile(target);
    return {
      resize(width, height, dpr) {
        target.resize([Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr))]);
        view = [width / height, height * dpr, dpr, 0];
      },
      render(state) {
        particles.set({ settings: { view, mouse: [...state.pointer, state.pointerActive, state.spread], motion: [state.time, 0, 0, 0] } });
        frame(context, (f) => f.pass(target, particles));
      },
      dispose() { context.dispose(); },
    };
  } catch (error) {
    gpu?.dispose();
    throw error;
  }
}
