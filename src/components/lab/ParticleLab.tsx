"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Backend, ParticleFrame, ParticleRenderer } from "./particle-data";
import styles from "./ParticleLab.module.css";

const COUNTS = [12000, 40000, 100000];
type Status = { kind: "loading" | "ready" | "error"; message: string };

function ParticleStage({ backend, count, paused, dispersed, onStatus, onFps }: {
  backend: Backend; count: number; paused: boolean; dispersed: boolean;
  onStatus: (status: Status) => void; onFps: (fps: number | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const options = useRef({ paused, dispersed });
  const wake = useRef<(() => void) | null>(null);

  useEffect(() => {
    options.current = { paused, dispersed };
    wake.current?.();
  }, [paused, dispersed]);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    // Every setup owns a fresh canvas. A disposed graphics context cannot be
    // reused by Strict Mode or Fast Refresh, even before the next paint.
    const element = document.createElement("canvas");
    element.className = styles.canvas;
    host.append(element);
    let cancelled = false;
    let failed = false;
    let renderer: ParticleRenderer | undefined;
    let animation = 0;
    let previous = 0;
    let sampleTime = 0;
    let samples = 0;
    let width = 1;
    let height = 1;
    const state: ParticleFrame = { time: 0, spread: 0, pointer: [0, 0], pointerActive: 0 };
    let pointerTarget = 0;
    const fail = (error: unknown) => {
      if (cancelled || failed) return;
      failed = true;
      cancelAnimationFrame(animation);
      onFps(null);
      onStatus({ kind: "error", message: error instanceof Error ? error.message : "Die Grafik konnte nicht gestartet werden." });
      renderer?.dispose();
    };
    const tick = (now: number) => {
      animation = 0;
      if (cancelled || failed || !renderer || document.hidden) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      const { paused, dispersed } = options.current;
      if (!paused) state.time += delta;
      const target = dispersed ? 1 : 0;
      const easing = paused ? 1 : 1 - Math.exp(-delta * 4);
      state.spread += (target - state.spread) * easing;
      state.pointerActive += ((paused ? 0 : pointerTarget) - state.pointerActive) * (paused ? 1 : 1 - Math.exp(-delta * 8));
      try { renderer.render(state); } catch (error) { fail(error); return; }
      if (!paused) {
        samples++;
        if (!sampleTime) sampleTime = now;
        if (now - sampleTime >= 1000) {
          onFps(Math.round((samples - 1) * 1000 / (now - sampleTime)));
          samples = 0;
          sampleTime = 0;
        }
        animation = requestAnimationFrame(tick);
      } else {
        sampleTime = 0;
        samples = 0;
        onFps(null);
      }
    };
    const schedule = () => {
      if (!cancelled && !failed && renderer && !animation && !document.hidden) {
        previous = 0;
        animation = requestAnimationFrame(tick);
      }
    };
    wake.current = schedule;
    const resize = () => {
      if (!renderer || failed) return;
      const rect = element.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      try { renderer.resize(width, height, Math.min(window.devicePixelRatio || 1, 2)); }
      catch (error) { fail(error); }
      schedule();
    };
    const pointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      state.pointer = [
        ((event.clientX - rect.left) / width * 2 - 1) * (width / height) * 7.2 / 2.414214,
        (1 - (event.clientY - rect.top) / height * 2) * 7.2 / 2.414214,
      ];
      pointerTarget = 1;
    };
    const leave = () => { pointerTarget = 0; };
    const visibility = () => {
      cancelAnimationFrame(animation);
      animation = 0;
      previous = 0;
      sampleTime = 0;
      samples = 0;
      schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    element.addEventListener("pointermove", pointer);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointerup", leave);
    document.addEventListener("visibilitychange", visibility);
    async function start() {
      try {
        const graphics = backend === "vgpu" ? await import("./render-vgpu") : await import("./render-three");
        if (cancelled) return;
        const created = await graphics.createRenderer(element, count, fail);
        if (cancelled || failed) { created.dispose(); return; }
        renderer = created;
        resize();
        if (!failed) onStatus({ kind: "ready", message: backend === "vgpu" ? "vgpu · WebGPU aktiv" : "Three.js · WebGL aktiv" });
      } catch (error) { fail(error); }
    }
    void start();
    return () => {
      cancelled = true;
      wake.current = null;
      cancelAnimationFrame(animation);
      observer.disconnect();
      element.removeEventListener("pointermove", pointer);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointerup", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer?.dispose();
      element.remove();
    };
  }, [backend, count, onStatus, onFps]);

  return <div ref={container} aria-hidden="true" />;
}

export function ParticleLab() {
  const reduce = useReducedMotion();
  const [backend, setBackend] = useState<Backend>("vgpu");
  const [count, setCount] = useState(40000);
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null);
  const [dispersed, setDispersed] = useState(false);
  const [fps, setFps] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "loading", message: "Grafik startet …" });
  const paused = pauseOverride ?? reduce;
  const updateStatus = useCallback((value: Status) => setStatus(value), []);
  const updateFps = useCallback((value: number | null) => setFps(value), []);
  const changeBackend = (value: Backend) => {
    if (value === backend) return;
    setStatus({ kind: "loading", message: "Grafik startet …" });
    setFps(null);
    setBackend(value);
  };
  const changeCount = (value: number) => {
    if (value === count) return;
    setStatus({ kind: "loading", message: "Grafik startet …" });
    setFps(null);
    setCount(value);
  };

  return (
    <main className={styles.lab} lang="de">
      <nav className={styles.nav} aria-label="Vorschau">
        <Link href="/" className={styles.brand}>THIMORROW<span>.</span></Link>
        <span className={styles.edition}>Playground / 001</span>
        <Link href="/" className={styles.back}>Zur Startseite <span aria-hidden="true">↗</span></Link>
      </nav>

      <div className={styles.intro}>
        <p className={styles.eyebrow}><span /> Ein Experiment mit Vercel vgpu</p>
        <h1>Same initials.<br className={styles.mobileBreak} /> New energy<span>.</span></h1>
        <p className={styles.description}>Maus bewegen. Partikel auflösen. Den Unterschied spüren.</p>
      </div>

      <div className={styles.stage} data-status={status.kind} data-backend={backend}>
        <div className={styles.crosshair} aria-hidden="true" />
        <div className={styles.stageInfo} aria-hidden="true"><span>TZ / particle study</span><span>01 — interactive</span></div>
        <div className={styles.poster} aria-hidden="true">
          <Image src="/poster/hero-monogram.svg" alt="" width={620} height={620} unoptimized priority />
        </div>
        {status.kind !== "error" && <ParticleStage key={`${backend}-${count}`} backend={backend} count={count} paused={paused} dispersed={dispersed} onStatus={updateStatus} onFps={updateFps} />}
        {status.kind === "error" && (
          <div className={styles.error} role="alert">
            <p>{backend === "vgpu" ? "WebGPU ist hier gerade nicht verfügbar." : "Die Grafik konnte nicht starten."}</p>
            <p>{backend === "vgpu" ? "Versuch die Three.js-Variante oder öffne die Vorschau in einem aktuellen Browser mit WebGPU-Unterstützung." : status.message}</p>
            {backend === "vgpu" && <button type="button" onClick={() => changeBackend("three")}>Three.js ansehen →</button>}
          </div>
        )}
        <div className={styles.stageFoot}>
          <span role="status" className={styles.status}><i data-ready={status.kind === "ready"} />{status.kind === "error" ? "Grafik nicht verfügbar" : status.message}</span>
          <span className={styles.fps} title="Gerenderte Browserbilder pro Sekunde; kein GPU-Benchmark">{paused ? "Pause" : fps === null ? "—" : `${fps} fps`}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <fieldset className={styles.controlGroup}>
          <legend>Technik vergleichen</legend>
          <div className={styles.segmented}>
            <button type="button" aria-pressed={backend === "vgpu"} onClick={() => changeBackend("vgpu")}>vgpu <span>WebGPU</span></button>
            <button type="button" aria-pressed={backend === "three"} onClick={() => changeBackend("three")}>Three.js <span>WebGL</span></button>
          </div>
        </fieldset>
        <fieldset className={styles.controlGroup}>
          <legend>Partikel</legend>
          <div className={styles.densities}>{COUNTS.map((value) => <button key={value} type="button" aria-pressed={count === value} onClick={() => changeCount(value)}>{(value / 1000).toFixed(0)}.000</button>)}</div>
        </fieldset>
        <div className={styles.actions}>
          <button type="button" className={styles.disperse} aria-pressed={dispersed} onClick={() => setDispersed(!dispersed)} disabled={status.kind !== "ready"}>{dispersed ? "Zusammensetzen" : "Auflösen"}<span aria-hidden="true">{dispersed ? "↙" : "↗"}</span></button>
          <button type="button" className={styles.pause} onClick={() => setPauseOverride(!paused)} disabled={status.kind !== "ready"}>{paused ? "Abspielen" : "Pause"}</button>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Gleiche Form, gleiche Partikelzahl, zwei Grafiktechniken. Die Three.js-Ansicht ist eine Vergleichsszene; das komplette Intro der Startseite läuft hier nicht.</p>
        <span>Technikvergleich · Startseite mit vgpu</span>
      </footer>
    </main>
  );
}
