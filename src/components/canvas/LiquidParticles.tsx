"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { scrollProgress } from "@/lib/scrollProgress";
import { audio } from "@/lib/audio";
import { onIntroDone } from "@/lib/intro";
import { PostFX } from "./PostFX";

const LOW_END =
  typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
const COUNT = LOW_END ? 9000 : 38000;

// Six content-resonant target forms the cloud morphs between on scroll:
// sphere (intro) -> cube (work/building) -> helix (life/growth) ->
// cross (likes/faith) -> plane (writing/a page) -> ring (contact).
function buildGeo() {
  const rnd = Math.random;
  const a0 = new Float32Array(COUNT * 3); // sphere
  const cube = new Float32Array(COUNT * 3);
  const helix = new Float32Array(COUNT * 3);
  const cross = new Float32Array(COUNT * 3);
  const plane = new Float32Array(COUNT * 3);
  const ring = new Float32Array(COUNT * 3);
  const scatter = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // a0 = "TZ" initials (the hero form) — particles placed on the letters
    {
      const sc = 1.1;
      const j = rnd();
      const z0 = (rnd() * 2 - 1) * 0.12;
      let x0;
      let y0;
      if (j < 0.28) {
        // T stem
        x0 = -0.78 + (rnd() * 2 - 1) * 0.18;
        y0 = (rnd() * 2 - 1) * 0.92;
      } else if (j < 0.42) {
        // T top bar (wider)
        x0 = -0.78 + (rnd() * 2 - 1) * 0.68;
        y0 = 0.82 + (rnd() * 2 - 1) * 0.12;
      } else if (j < 0.58) {
        // Z top bar (wider)
        x0 = 0.78 + (rnd() * 2 - 1) * 0.68;
        y0 = 0.82 + (rnd() * 2 - 1) * 0.12;
      } else if (j < 0.74) {
        // Z bottom bar (wider)
        x0 = 0.78 + (rnd() * 2 - 1) * 0.68;
        y0 = -0.82 + (rnd() * 2 - 1) * 0.12;
      } else {
        // Z diagonal (wider)
        const td = rnd();
        x0 = 0.78 + (0.68 - td * 1.36) + (rnd() * 2 - 1) * 0.14;
        y0 = 0.8 - td * 1.6 + (rnd() * 2 - 1) * 0.06;
      }
      a0[i * 3] = x0 * sc;
      a0[i * 3 + 1] = y0 * sc;
      a0[i * 3 + 2] = z0;
    }

    // cube EDGES (wireframe) — Work / structure
    {
      const H = 1.12;
      const axis = Math.floor(rnd() * 3);
      const tt = (rnd() * 2 - 1) * H;
      const c1 = rnd() < 0.5 ? -H : H;
      const c2 = rnd() < 0.5 ? -H : H;
      const jx = (rnd() * 2 - 1) * 0.05;
      const jy = (rnd() * 2 - 1) * 0.05;
      const jz = (rnd() * 2 - 1) * 0.05;
      if (axis === 0) {
        cube[i * 3] = tt + jx; cube[i * 3 + 1] = c1 + jy; cube[i * 3 + 2] = c2 + jz;
      } else if (axis === 1) {
        cube[i * 3] = c1 + jx; cube[i * 3 + 1] = tt + jy; cube[i * 3 + 2] = c2 + jz;
      } else {
        cube[i * 3] = c1 + jx; cube[i * 3 + 1] = c2 + jy; cube[i * 3 + 2] = tt + jz;
      }
    }

    // thick donut (torus) — Life
    {
      const ta = rnd() * 6.2831;
      const tb = rnd() * 6.2831;
      const TR = 1.0;
      const Tt = 0.42;
      helix[i * 3] = (TR + Tt * Math.cos(tb)) * Math.cos(ta);
      helix[i * 3 + 1] = (TR + Tt * Math.cos(tb)) * Math.sin(ta);
      helix[i * 3 + 2] = Tt * Math.sin(tb);
    }

    // cross (vertical bar + upper horizontal bar) — a Christian cross
    if (rnd() < 0.6) {
      // vertical bar (bigger, centred)
      cross[i * 3] = (rnd() * 2 - 1) * 0.26;
      cross[i * 3 + 1] = (rnd() * 2 - 1) * 1.65;
      cross[i * 3 + 2] = (rnd() * 2 - 1) * 0.26;
    } else {
      // horizontal bar (bigger, centred)
      cross[i * 3] = (rnd() * 2 - 1) * 1.15;
      cross[i * 3 + 1] = 0.54 + (rnd() * 2 - 1) * 0.26;
      cross[i * 3 + 2] = (rnd() * 2 - 1) * 0.26;
    }

    // filled sphere — Writing (a clean orb)
    {
      const su = rnd() * 6.2831;
      const sc2 = 2 * rnd() - 1;
      const ss = Math.sqrt(1 - sc2 * sc2);
      const sr = 1.4 * Math.cbrt(rnd());
      plane[i * 3] = sr * ss * Math.cos(su);
      plane[i * 3 + 1] = sr * ss * Math.sin(su);
      plane[i * 3 + 2] = sr * sc2;
    }

    // filled sphere (tighter) — Contact (gather back to the orb)
    {
      const gu = rnd() * 6.2831;
      const gc = 2 * rnd() - 1;
      const gs = Math.sqrt(1 - gc * gc);
      const gr = 1.4 * Math.cbrt(rnd());
      ring[i * 3] = gr * gs * Math.cos(gu);
      ring[i * 3 + 1] = gr * gs * Math.sin(gu);
      ring[i * 3 + 2] = gr * gc;
    }

    // scatter (assemble-from-dust on load)
    scatter[i * 3] = (rnd() * 2 - 1) * 4.5;
    scatter[i * 3 + 1] = (rnd() * 2 - 1) * 4.5;
    scatter[i * 3 + 2] = (rnd() * 2 - 1) * 4.5;
    seed[i] = rnd();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(a0, 3));
  g.setAttribute("aF1", new THREE.BufferAttribute(cube, 3));
  g.setAttribute("aF2", new THREE.BufferAttribute(helix, 3));
  g.setAttribute("aF3", new THREE.BufferAttribute(cross, 3));
  g.setAttribute("aF4", new THREE.BufferAttribute(plane, 3));
  g.setAttribute("aF5", new THREE.BufferAttribute(ring, 3));
  g.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return g;
}
const PARTICLE_GEO = buildGeo();

const particleUniforms = {
  uTime: { value: 0 },
  uMorph: { value: 0 },
  uAssemble: { value: 1 },
  uMouse: { value: new THREE.Vector3(999, 999, 0) },
  uMouseActive: { value: 0 },
  uSize: { value: LOW_END ? 18 : 22 },
  uColorA: { value: new THREE.Color("#dbf1ff") }, // icy white-blue (most)
  uColorB: { value: new THREE.Color("#21e6ff") }, // cyan accent (some)
  uOpacity: { value: 0.95 },
};

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uAssemble;
uniform vec3 uMouse;
uniform float uMouseActive;
uniform float uSize;
uniform vec3 uColorA;
uniform vec3 uColorB;
attribute vec3 aF1;
attribute vec3 aF2;
attribute vec3 aF3;
attribute vec3 aF4;
attribute vec3 aF5;
attribute vec3 aScatter;
attribute float aSeed;
varying float vA;
varying vec3 vCol;
void main() {
  // triangular blend across the 6 forms (weights sum to 1 between neighbours)
  float w0 = max(0.0, 1.0 - abs(uMorph - 0.0));
  float w1 = max(0.0, 1.0 - abs(uMorph - 1.0));
  float w2 = max(0.0, 1.0 - abs(uMorph - 2.0));
  float w3 = max(0.0, 1.0 - abs(uMorph - 3.0));
  float w4 = max(0.0, 1.0 - abs(uMorph - 4.0));
  float w5 = max(0.0, 1.0 - abs(uMorph - 5.0));
  float nearestF = floor(uMorph + 0.5);
  float crisp = 1.0 - smoothstep(0.06, 0.34, abs(uMorph - nearestF));
  vec3 form = position * w0 + aF1 * w1 + aF2 * w2 + aF3 * w3 + aF4 * w4 + aF5 * w5;
  // between forms: particles interpolate directly from one form to the next
  vec3 p = mix(form, aScatter, uAssemble);
  p += (1.0 - crisp) * 0.06 * vec3(
    sin(uTime * 0.5 + aSeed * 6.2831),
    cos(uTime * 0.43 + aSeed * 4.7),
    sin(uTime * 0.31 + aSeed * 3.3)
  );
  // hover repulsion in WORLD space (after rotation) so it always pushes away
  // from the cursor on screen, never with the spin.
  vec4 world = modelMatrix * vec4(p, 1.0);
  vec2 toM = world.xy - uMouse.xy;
  float dM = length(toM);
  float infl = uMouseActive * smoothstep(0.5, 0.0, dM);
  world.xy += normalize(toM + 0.0001) * infl * 0.16;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize / max(0.1, -mv.z);
  vA = 0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 6.2831);
  // most particles icy white-blue, a minority pull toward the cyan accent ->
  // depth and a real palette instead of one flat tone.
  vCol = mix(uColorA, uColorB, smoothstep(0.45, 1.0, aSeed));
}
`;
const FRAG = /* glsl */ `
precision mediump float;
uniform float uOpacity;
varying float vA;
varying vec3 vCol;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  // defined bright core with a quick soft edge -> crisp, high-res points
  // instead of fuzzy glow blobs.
  float a = smoothstep(0.5, 0.16, d) * uOpacity * vA;
  gl_FragColor = vec4(vCol, a);
}
`;

const introProxy2 = { v: 1 };
const morphState = { v: 0 }; // eased morph value (lags scroll -> slower, smoother)
let lockArmed = false; // re-armed mid-transition; fires one cue when a form locks
let lastHoverSound = 0; // throttle for the sparkle taps while hovering the cloud
// Low pentatonic notes per form so each lock blooms warm, not shrill.
const LOCK_NOTES = [196, 220, 247, 294, 330, 392];

function PointsField() {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  useEffect(() => {
    // Stay scattered as dust until the preloader hands off, then assemble into
    // the TZ — so the build-up plays as the curtain lifts, not hidden behind it.
    introProxy2.v = 1;
    let tween: gsap.core.Tween | null = null;
    const unsub = onIntroDone(() => {
      tween = gsap.to(introProxy2, {
        v: 0,
        duration: 2.6,
        ease: "power3.out",
        delay: 0.15,
      });
    });
    const tmp = new THREE.Vector3();
    const onMove = (e: MouseEvent) => {
      const mat = matRef.current;
      if (!mat) return;
      const ndcx = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcy = -(e.clientY / window.innerHeight) * 2 + 1;
      tmp.set(ndcx, ndcy, 0.5).unproject(camera);
      tmp.sub(camera.position).normalize();
      const dist = -camera.position.z / tmp.z;
      const world = mat.uniforms.uMouse.value
        .copy(camera.position)
        .add(tmp.multiplyScalar(dist));
      mat.uniforms.uMouseActive.value = 1;
      // Sparkle taps while the cursor is over the cloud (throttled). The cloud
      // lives near the origin, radius ~1.6 across its forms.
      const near = world.x * world.x + world.y * world.y < 2.6;
      const now = performance.now();
      if (near && now - lastHoverSound > 90) {
        lastHoverSound = now;
        audio.hover();
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      unsub();
      tween?.kill();
      window.removeEventListener("mousemove", onMove);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const d = Math.min(delta, 0.05);
    mat.uniforms.uTime.value += d;
    mat.uniforms.uAssemble.value = introProxy2.v;
    // Form target comes from which section heading is centred (set by the
    // smooth-scroll provider), so each form locks onto its own section. A
    // PLATEAU per form holds the shape readable a beat before transitioning.
    const raw = Math.min(Math.max(scrollProgress.morphTarget, 0), 5);
    const seg = Math.min(Math.floor(raw), 4);
    const frac = raw - seg;
    // Small plateau per form so the shape stays readable a beat longer, but the
    // middle of each segment is mostly transition -> the morph keeps flowing.
    const HOLD = 0.2;
    let f;
    if (frac < HOLD) f = 0;
    else if (frac > 1 - HOLD) f = 1;
    else {
      const t = (frac - HOLD) / (1 - 2 * HOLD);
      f = t * t * (3 - 2 * t);
    }
    const target = seg + f;
    // Ease the morph toward the plateaued target. Low factor = the cloud takes
    // its time travelling between forms, so even a fast scroll plays out as one
    // slow, clean transition instead of a snap to the side and back.
    morphState.v += (target - morphState.v) * 0.045;
    const morph = morphState.v;
    mat.uniforms.uMorph.value = morph;
    // hold still near a form so it "snaps" gently into the perfect shape
    const fd = Math.min(Math.max((Math.abs(morph - Math.round(morph)) - 0.06) / 0.28, 0), 1);
    const crisp = 1 - fd * fd * (3 - 2 * fd);
    // Audio cue: one soft chime the instant a form snaps in (silent unless the
    // user turned sound on). Re-armed once the cloud is clearly mid-transition.
    if (crisp > 0.92 && lockArmed) {
      lockArmed = false;
      audio.lock(LOCK_NOTES[Math.min(Math.max(Math.round(morph), 0), 5)]);
    } else if (crisp < 0.5) {
      lockArmed = true;
    }
    const p = ref.current;
    if (p) {
      const t = mat.uniforms.uTime.value;
      // Transition -> gentle tumble. Locked -> ease into a slow rock so the form
      // stays front-facing and readable, but never dead-still.
      p.rotation.y += d * 0.3 * (1 - crisp);
      p.rotation.y += (Math.sin(t * 0.4) * 0.14 - p.rotation.y) * 0.04 * crisp;
      // One clean arc per transition: sin(morph*PI) is exactly 0 at every form
      // (locked = dead-centre) and peaks at the midpoint, so the cloud swings
      // smoothly out to one side and back, alternating sides, no jerk.
      // Drift sideways only while morphing; a locked form is dead-centre
      // (crisp -> 1 cancels the offset), so it never strands off to the side.
      p.position.x = Math.sin(morph * Math.PI) * 0.38 * (1 - crisp);
      // Every form sits at screen centre, so it lands on its section heading as
      // that section scrolls to the middle. The TZ (form 0) floats higher in the
      // hero, above the identity text at the bottom.
      const w0 = Math.max(0, 1 - Math.abs(morph));
      p.position.y = w0 * 0.5 + Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <points ref={ref} geometry={PARTICLE_GEO}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={particleUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SignalReady() {
  useEffect(() => {
    document.documentElement.classList.add("canvas-ready");
    return () => document.documentElement.classList.remove("canvas-ready");
  }, []);
  return null;
}

export default function LiquidParticles() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <color attach="background" args={["#070a12"]} />
      <PointsField />
      <SignalReady />
      <PostFX low={LOW_END} />
    </Canvas>
  );
}
