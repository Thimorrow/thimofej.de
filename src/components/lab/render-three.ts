import * as THREE from "three";
import { createParticleData, VERTEX_SHADER, FRAGMENT_SHADER, type ParticleRenderer } from "./particle-data";

export async function createRenderer(canvas: HTMLCanvasElement, count: number, onError: (error: Error) => void): Promise<ParticleRenderer> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor("#070a12", 1);
  const geometry = new THREE.BufferGeometry();
  const data = new THREE.InterleavedBuffer(createParticleData(count), 4);
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(data, 3, 0));
  geometry.setAttribute("seed", new THREE.InterleavedBufferAttribute(data, 1, 3));
  const uniforms = {
    uTime: { value: 0 }, uSpread: { value: 0 },
    uPointer: { value: new THREE.Vector3() },
    uDpr: { value: 1 }, uAspect: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, uniforms,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false,
  });
  const scene = new THREE.Scene();
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  const camera = new THREE.PerspectiveCamera();
  const lost = (event: Event) => {
    event.preventDefault();
    onError(new Error("Die Verbindung zur Grafikkarte wurde unterbrochen."));
  };
  canvas.addEventListener("webglcontextlost", lost);
  let disposed = false;
  return {
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      uniforms.uAspect.value = width / height;
      uniforms.uDpr.value = dpr;
    },
    render(state) {
      uniforms.uTime.value = state.time;
      uniforms.uSpread.value = state.spread;
      uniforms.uPointer.value.set(...state.pointer, state.pointerActive);
      renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
