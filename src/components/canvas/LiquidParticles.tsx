"use client";

import { useEffect, useRef, useState } from "react";
import { onIntroDone } from "@/lib/intro";
import { subscribeCanvasActivity } from "@/lib/canvasActivity";
import { createParticleWorld } from "./particle-world";
import { createParticleScene, type ParticleScene } from "./particle-scene";
import { createParticleRenderer, type ParticleRenderer } from "./particle-renderer";

type DebugWindow = Window & { __intro?: ParticleScene["intro"]; __particleScene?: ParticleScene; __particleGpu?: ParticleRenderer["gpu"] };

export default function LiquidParticles() {
  const host = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);

  useEffect(() => {
    if (!host.current) return;
    // Strict Mode and hot reload each own a fresh, disposable canvas context.
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    canvas.dataset.renderer = "vgpu";
    host.current.append(canvas);
    let disposed = false;
    let failed = false;
    let scene: ParticleScene | undefined;
    let renderer: ParticleRenderer | undefined;
    let animation = 0;
    let previous = 0;
    let active = false;
    let ready = false;
    let detachActivity: (() => void) | undefined;
    const debug = window as DebugWindow;
    const fail = (error: unknown) => {
      if (disposed || failed) return;
      failed = true;
      cancelAnimationFrame(animation);
      scene?.dispose();
      renderer?.dispose();
      document.documentElement.classList.remove("canvas-ready");
      setFailure(error instanceof Error ? error : new Error("WebGPU unavailable"));
    };
    const render = (now: number) => {
      animation = 0;
      if (disposed || failed || !active || !scene || !renderer) return;
      try {
        scene.update(previous ? (now - previous) / 1000 : 0);
        previous = now;
        renderer.render(scene);
        if (!ready) {
          ready = true;
          document.documentElement.classList.add("canvas-ready");
        }
        animation = requestAnimationFrame(render);
      } catch (error) { fail(error); }
    };
    const updateActivity = (value: boolean) => {
      active = value;
      previous = 0;
      cancelAnimationFrame(animation);
      animation = 0;
      if (value && !disposed && !failed) animation = requestAnimationFrame(render);
    };
    const resize = () => {
      if (!scene || !renderer || disposed || failed) return;
      const { width, height } = canvas.getBoundingClientRect();
      try {
        scene.resize(Math.max(1, width), Math.max(1, height));
        renderer.resize(width, height, Math.min(window.devicePixelRatio || 1, 2));
      } catch (error) { fail(error); }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    async function start() {
      try {
        const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
        const world = createParticleWorld(lowEnd ? 34000 : 170000);
        const created = await createParticleRenderer(canvas, world, lowEnd, fail);
        if (disposed || failed) { created.dispose(); return; }
        renderer = created;
        scene = createParticleScene(world, lowEnd);
        resize();
        if (failed) return;
        if (process.env.NODE_ENV !== "production") {
          debug.__intro = scene.intro;
          debug.__particleScene = scene;
          debug.__particleGpu = renderer.gpu;
        }
        detachActivity = subscribeCanvasActivity(onIntroDone, document, updateActivity);
      } catch (error) { fail(error); }
    }
    void start();
    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      observer.disconnect();
      detachActivity?.();
      scene?.dispose();
      renderer?.dispose();
      canvas.remove();
      document.documentElement.classList.remove("canvas-ready");
      if (debug.__particleScene === scene) {
        delete debug.__intro;
        delete debug.__particleScene;
        delete debug.__particleGpu;
      }
    };
  }, []);

  // Route asynchronous GPU failures through the existing static-poster boundary.
  if (failure) throw failure;
  return <div ref={host} className="h-full w-full" />;
}
