import * as THREE from "three";
import { packParticleWorld, type ParticleWorld } from "./particle-world.ts";
import { WORLD_VERTEX, WORLD_FRAGMENT, FULLSCREEN_VERTEX, BLOOM_FRAGMENT, PRESENT_FRAGMENT } from "./particle-shaders.ts";
import type { ParticleScene } from "./particle-scene";

export function createParticleGeometry(world: ParticleWorld) {
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5], 2));
  const particles = new THREE.InstancedInterleavedBuffer(packParticleWorld(world), 20);
  for (const [index, name] of ["home", "work", "elsewhere", "contact", "colorSeed"].entries()) {
    geometry.setAttribute(name, new THREE.InterleavedBufferAttribute(particles, 4, index * 4));
  }
  geometry.instanceCount = world.count;
  return geometry;
}

export async function createParticleRenderer(canvas: HTMLCanvasElement, world: ParticleWorld, lowEnd: boolean, onError: (error: Error) => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: lowEnd ? "low-power" : "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = false;
  renderer.debug.onShaderError = (gl, program) => onError(new Error(gl.getProgramInfoLog(program) || "Die Grafik konnte nicht vorbereitet werden."));
  const clear = new THREE.Color().setRGB(0.0021247, 0.0030353, 0.0060488, THREE.LinearSRGBColorSpace);
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  const bloomX = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  const bloomY = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  const geometry = createParticleGeometry(world);
  const uniforms = {
    uModel: { value: new THREE.Matrix4() }, uView: { value: new THREE.Matrix4() }, uProjection: { value: new THREE.Matrix4() },
    animation: { value: new THREE.Vector4() }, mouse: { value: new THREE.Vector4() }, style: { value: new THREE.Vector4(1, 1, 1, 1) },
    colorA: { value: new THREE.Vector4() }, colorB: { value: new THREE.Vector4() },
  };
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: WORLD_VERTEX, fragmentShader: WORLD_FRAGMENT, uniforms,
    transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor, depthTest: false, depthWrite: false,
  });
  const worldScene = new THREE.Scene();
  const cloud = new THREE.Mesh(geometry, material);
  cloud.frustumCulled = false;
  worldScene.add(cloud);
  const camera = new THREE.Camera();
  const quad = new THREE.BufferGeometry();
  quad.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 3, -1, -1, 3], 2));
  const blurX = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: FULLSCREEN_VERTEX, fragmentShader: BLOOM_FRAGMENT, depthTest: false, depthWrite: false,
    uniforms: { source: { value: sceneTarget.texture }, blurParams: { value: new THREE.Vector4(1, 0, 1, 0) } },
  });
  const blurY = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: FULLSCREEN_VERTEX, fragmentShader: BLOOM_FRAGMENT, depthTest: false, depthWrite: false,
    uniforms: { source: { value: bloomX.texture }, blurParams: { value: new THREE.Vector4(0, 1, 0, 0) } },
  });
  const present = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: FULLSCREEN_VERTEX, fragmentShader: PRESENT_FRAGMENT, depthTest: false, depthWrite: false,
    uniforms: { source: { value: sceneTarget.texture }, glow: { value: bloomY.texture }, settings: { value: new THREE.Vector4(0, lowEnd ? 0.14 : 0.18, 1, 1) } },
  });
  const screen = new THREE.Scene();
  const screenMesh = new THREE.Mesh(quad, present);
  screenMesh.frustumCulled = false;
  screen.add(screenMesh);
  let disposed = false;
  const lost = (event: Event) => {
    event.preventDefault();
    if (!disposed) onError(new Error("Die Verbindung zur Grafikkarte wurde unterbrochen."));
  };
  canvas.addEventListener("webglcontextlost", lost);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener("webglcontextlost", lost);
    geometry.dispose();
    quad.dispose();
    for (const pass of [material, blurX, blurY, present]) pass.dispose();
    for (const target of [sceneTarget, bloomX, bloomY]) target.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  try {
    await renderer.compileAsync(worldScene, camera);
    for (const pass of [blurX, blurY, present]) {
      screenMesh.material = pass;
      await renderer.compileAsync(screen, camera);
    }
    let width = 1;
    let height = 1;
    return {
      renderer,
      resize(cssWidth: number, cssHeight: number, dpr: number) {
        const scale = Math.min(dpr, renderer.capabilities.maxTextureSize / Math.max(1, cssWidth, cssHeight));
        width = Math.max(1, Math.round(cssWidth * scale));
        height = Math.max(1, Math.round(cssHeight * scale));
        renderer.setSize(width, height, false);
        sceneTarget.setSize(width, height);
        const bloomWidth = Math.max(1, Math.ceil(width / 4));
        const bloomHeight = Math.max(1, Math.ceil(height / 4));
        bloomX.setSize(bloomWidth, bloomHeight);
        bloomY.setSize(bloomWidth, bloomHeight);
        blurX.uniforms.blurParams.value.set(1 / bloomWidth, 0, 1, 0);
        blurY.uniforms.blurParams.value.set(0, 1 / bloomHeight, 0, 0);
        present.uniforms.settings.value.set(0, lowEnd ? 0.14 : 0.18, width, height);
      },
      render(scene: ParticleScene) {
        const u = scene.uniforms;
        uniforms.uModel.value.copy(scene.object.matrixWorld);
        uniforms.uView.value.copy(scene.camera.matrixWorldInverse);
        uniforms.uProjection.value.copy(scene.camera.projectionMatrix);
        uniforms.animation.value.set(u.uTime.value, u.uMorph.value, u.uIntroAmt.value, u.uU.value);
        uniforms.mouse.value.set(u.uMouse.value.x, u.uMouse.value.y, u.uMouse.value.z, u.uMouseActive.value);
        uniforms.style.value.set(u.uSize.value, u.uOpacity.value, width, height);
        uniforms.colorA.value.set(u.uColorA.value.r, u.uColorA.value.g, u.uColorA.value.b, 1);
        uniforms.colorB.value.set(u.uColorB.value.r, u.uColorB.value.g, u.uColorB.value.b, 1);
        geometry.instanceCount = scene.drawCount;
        renderer.setRenderTarget(sceneTarget);
        renderer.setClearColor(clear, 1);
        renderer.clear();
        renderer.render(worldScene, camera);
        for (const [pass, target] of [[blurX, bloomX], [blurY, bloomY], [present, null]] as const) {
          screenMesh.material = pass;
          renderer.setRenderTarget(target);
          renderer.render(screen, camera);
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export type ParticleRenderer = Awaited<ReturnType<typeof createParticleRenderer>>;
