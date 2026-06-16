"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { scrollProgress } from "@/lib/scrollProgress";
import { audio } from "@/lib/audio";
import { onIntroDone, markWorldReady } from "@/lib/intro";
import { PostFX } from "./PostFX";

const LOW_END =
  typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
const COUNT = LOW_END ? 18000 : 100000; // full count, only during the intro
const SCROLL_COUNT = LOW_END ? 9000 : 38000; // reduced for the scroll phase

// One sample on the "TZ" initials inside a roughly unit box (x ~ ±1.5, y ~ ±0.95).
function tzPoint(rnd: () => number): [number, number, number] {
  const j = rnd();
  const z0 = (rnd() * 2 - 1) * 0.12;
  let x0: number;
  let y0: number;
  if (j < 0.28) {
    x0 = -0.78 + (rnd() * 2 - 1) * 0.18;
    y0 = (rnd() * 2 - 1) * 0.92;
  } else if (j < 0.42) {
    x0 = -0.78 + (rnd() * 2 - 1) * 0.68;
    y0 = 0.82 + (rnd() * 2 - 1) * 0.12;
  } else if (j < 0.58) {
    x0 = 0.78 + (rnd() * 2 - 1) * 0.68;
    y0 = 0.82 + (rnd() * 2 - 1) * 0.12;
  } else if (j < 0.74) {
    x0 = 0.78 + (rnd() * 2 - 1) * 0.68;
    y0 = -0.82 + (rnd() * 2 - 1) * 0.12;
  } else {
    const td = rnd();
    x0 = 0.78 + (0.68 - td * 1.36) + (rnd() * 2 - 1) * 0.14;
    y0 = 0.8 - td * 1.6 + (rnd() * 2 - 1) * 0.06;
  }
  return [x0, y0, z0];
}

// A point in/on a sphere of radius R (shell-biased so spheres read as surfaces).
function spherePoint(rnd: () => number, R: number, shell = false): [number, number, number] {
  const u = rnd() * 6.2831;
  const v = Math.acos(2 * rnd() - 1);
  const r = shell ? R : R * (0.82 + 0.18 * Math.cbrt(rnd()));
  return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v), r * Math.sin(v) * Math.sin(u)];
}

// Scroll forms (TZ -> cube -> torus -> cross -> sphere -> sphere) PLUS four
// full-cloud intro scenes (every particle appears in every scene, so each scene
// is dense and only one is visible at a time): solar system -> planet -> city ->
// house (window + table + TZ). aColor carries a cosmic colour for the intro.
function buildGeo() {
  const rnd = Math.random;
  const a0 = new Float32Array(COUNT * 3); // TZ (hero)
  const cube = new Float32Array(COUNT * 3);
  const helix = new Float32Array(COUNT * 3);
  const cross = new Float32Array(COUNT * 3);
  const plane = new Float32Array(COUNT * 3);
  const ring = new Float32Array(COUNT * 3);
  const solar = new Float32Array(COUNT * 3);
  const planet = new Float32Array(COUNT * 3);
  const city = new Float32Array(COUNT * 3);
  const house = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);

  const planetPal = [
    [0.42, 0.6, 1.0],
    [1.0, 0.46, 0.28],
    [0.35, 0.95, 0.85],
    [0.86, 0.72, 0.46],
  ];

  for (let i = 0; i < COUNT; i++) {
    const r = i / COUNT;

    // --- hero TZ ---
    {
      const [x0, y0, z0] = tzPoint(rnd);
      a0[i * 3] = x0 * 1.1;
      a0[i * 3 + 1] = y0 * 1.1;
      a0[i * 3 + 2] = z0;
    }

    // --- cube edges (Work) ---
    {
      const H = 1.12;
      const axis = Math.floor(rnd() * 3);
      const tt = (rnd() * 2 - 1) * H;
      const c1 = rnd() < 0.5 ? -H : H;
      const c2 = rnd() < 0.5 ? -H : H;
      const jx = (rnd() * 2 - 1) * 0.05;
      const jy = (rnd() * 2 - 1) * 0.05;
      const jz = (rnd() * 2 - 1) * 0.05;
      if (axis === 0) { cube[i * 3] = tt + jx; cube[i * 3 + 1] = c1 + jy; cube[i * 3 + 2] = c2 + jz; }
      else if (axis === 1) { cube[i * 3] = c1 + jx; cube[i * 3 + 1] = tt + jy; cube[i * 3 + 2] = c2 + jz; }
      else { cube[i * 3] = c1 + jx; cube[i * 3 + 1] = c2 + jy; cube[i * 3 + 2] = tt + jz; }
    }

    // --- torus (Life) ---
    {
      const ta = rnd() * 6.2831;
      const tb = rnd() * 6.2831;
      const TR = 1.0;
      const Tt = 0.42;
      helix[i * 3] = (TR + Tt * Math.cos(tb)) * Math.cos(ta);
      helix[i * 3 + 1] = (TR + Tt * Math.cos(tb)) * Math.sin(ta);
      helix[i * 3 + 2] = Tt * Math.sin(tb);
    }

    // --- cross (Likes) ---
    if (rnd() < 0.6) {
      cross[i * 3] = (rnd() * 2 - 1) * 0.26;
      cross[i * 3 + 1] = (rnd() * 2 - 1) * 1.65;
      cross[i * 3 + 2] = (rnd() * 2 - 1) * 0.26;
    } else {
      cross[i * 3] = (rnd() * 2 - 1) * 1.15;
      cross[i * 3 + 1] = 0.54 + (rnd() * 2 - 1) * 0.26;
      cross[i * 3 + 2] = (rnd() * 2 - 1) * 0.26;
    }

    // --- spheres (Writing, Contact) ---
    {
      const [sx, sy, sz] = spherePoint(rnd, 1.4);
      plane[i * 3] = sx; plane[i * 3 + 1] = sy; plane[i * 3 + 2] = sz;
      const [gx, gy, gz] = spherePoint(rnd, 1.4);
      ring[i * 3] = gx; ring[i * 3 + 1] = gy; ring[i * 3 + 2] = gz;
    }

    // --- INTRO scene 0: SOLAR SYSTEM (sun + tilted orbit rings + planets) ---
    {
      const tilt = 0.34;
      let cr = 1, cg = 1, cb = 1;
      if (r < 0.34) {
        // bright dense sun
        const [x, y, z] = spherePoint(rnd, 1.2);
        solar[i * 3] = x; solar[i * 3 + 1] = y; solar[i * 3 + 2] = z;
        cr = 1.0; cg = 0.68 + rnd() * 0.12; cb = 0.28;
      } else if (r < 0.72) {
        // three orbit rings (the orbital paths), tilted toward the camera
        const idx = Math.floor(rnd() * 3);
        const ro = 2.6 + idx * 1.35;
        const ang = rnd() * 6.2831;
        const fx = ro * Math.cos(ang);
        const fz = ro * Math.sin(ang);
        solar[i * 3] = fx + (rnd() * 2 - 1) * 0.03;
        solar[i * 3 + 1] = -fz * Math.sin(tilt) + (rnd() * 2 - 1) * 0.03;
        solar[i * 3 + 2] = fz * Math.cos(tilt);
        cr = 0.55; cg = 0.8; cb = 1.0;
      } else if (r < 0.96) {
        // a planet sitting on each ring
        const idx = Math.floor(rnd() * 3);
        const ro = 2.6 + idx * 1.35;
        const ang = idx * 2.2 + 0.7;
        const fx = ro * Math.cos(ang);
        const fz = ro * Math.sin(ang);
        const [px, py, pz] = spherePoint(rnd, 0.42 + idx * 0.12);
        solar[i * 3] = fx + px;
        solar[i * 3 + 1] = -fz * Math.sin(tilt) + py;
        solar[i * 3 + 2] = fz * Math.cos(tilt) + pz;
        const col = planetPal[idx];
        cr = col[0]; cg = col[1]; cb = col[2];
      } else {
        // far star dust
        solar[i * 3] = (rnd() * 2 - 1) * 9;
        solar[i * 3 + 1] = (rnd() * 2 - 1) * 6;
        solar[i * 3 + 2] = (rnd() * 2 - 1) * 9;
        cr = 0.8; cg = 0.85; cb = 1.0;
      }
      colors[i * 3] = cr; colors[i * 3 + 1] = cg; colors[i * 3 + 2] = cb;
    }

    // --- INTRO scene 1: PLANET (sphere + a tilted Saturn ring) ---
    {
      if (r < 0.8) {
        const [x, y, z] = spherePoint(rnd, 2.0, rnd() < 0.85);
        planet[i * 3] = x; planet[i * 3 + 1] = y; planet[i * 3 + 2] = z;
      } else {
        const ang = rnd() * 6.2831;
        const rr = 2.8 + rnd() * 0.8;
        const tilt = 0.45;
        const fx = rr * Math.cos(ang);
        const fz = rr * Math.sin(ang);
        planet[i * 3] = fx;
        planet[i * 3 + 1] = -fz * Math.sin(tilt) + (rnd() * 2 - 1) * 0.04;
        planet[i * 3 + 2] = fz * Math.cos(tilt);
      }
    }

    // --- INTRO scene 2: CITY (a skyline of solid building columns) ---
    {
      const col = Math.round((rnd() * 2 - 1) * 6);
      const row = Math.round((rnd() * 2 - 1) * 2.2);
      // deterministic height per cell so each column is one solid building
      const kk = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
      const hh = 0.5 + (kk - Math.floor(kk)) * 4.2;
      city[i * 3] = col * 0.82 + (rnd() * 2 - 1) * 0.16;
      city[i * 3 + 1] = -2.4 + rnd() * hh;
      city[i * 3 + 2] = row * 0.82 + (rnd() * 2 - 1) * 0.16;
    }

    // --- INTRO scene 3: ROOM (cuboid wireframe + window + table + TZ) ---
    {
      const RX = 2.7, RY = 1.9, RZ = 2.2;
      if (r < 0.32) {
        // room: edges of a cuboid -> reads as an interior
        const axis = Math.floor(rnd() * 3);
        const s = rnd() * 2 - 1;
        const e1 = rnd() < 0.5 ? -1 : 1;
        const e2 = rnd() < 0.5 ? -1 : 1;
        if (axis === 0) { house[i * 3] = s * RX; house[i * 3 + 1] = e1 * RY; house[i * 3 + 2] = e2 * RZ; }
        else if (axis === 1) { house[i * 3] = e1 * RX; house[i * 3 + 1] = s * RY; house[i * 3 + 2] = e2 * RZ; }
        else { house[i * 3] = e1 * RX; house[i * 3 + 1] = e2 * RY; house[i * 3 + 2] = s * RZ; }
      } else if (r < 0.46) {
        // a bright window on the back wall
        house[i * 3] = -1.0 + (rnd() * 2 - 1) * 1.0;
        house[i * 3 + 1] = 0.4 + (rnd() * 2 - 1) * 1.0;
        house[i * 3 + 2] = -RZ + 0.02;
      } else if (r < 0.6) {
        // table: a slab on two legs
        if (rnd() < 0.68) {
          house[i * 3] = 0.6 + (rnd() * 2 - 1) * 1.2;
          house[i * 3 + 1] = -1.05;
          house[i * 3 + 2] = (rnd() * 2 - 1) * 0.7;
        } else {
          house[i * 3] = 0.6 + (rnd() < 0.5 ? -1 : 1) * 1.0;
          house[i * 3 + 1] = -1.05 - rnd() * 0.8;
          house[i * 3 + 2] = (rnd() < 0.5 ? -1 : 1) * 0.5;
        }
      } else {
        // TZ standing on the table
        const [tx, ty, tz] = tzPoint(rnd);
        house[i * 3] = 0.6 + tx * 0.62;
        house[i * 3 + 1] = -0.1 + ty * 0.52;
        house[i * 3 + 2] = tz;
      }
    }

    seed[i] = rnd();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(a0, 3));
  g.setAttribute("aF1", new THREE.BufferAttribute(cube, 3));
  g.setAttribute("aF2", new THREE.BufferAttribute(helix, 3));
  g.setAttribute("aF3", new THREE.BufferAttribute(cross, 3));
  g.setAttribute("aF4", new THREE.BufferAttribute(plane, 3));
  g.setAttribute("aF5", new THREE.BufferAttribute(ring, 3));
  g.setAttribute("aSolar", new THREE.BufferAttribute(solar, 3));
  g.setAttribute("aPlanet", new THREE.BufferAttribute(planet, 3));
  g.setAttribute("aCity", new THREE.BufferAttribute(city, 3));
  g.setAttribute("aHouse", new THREE.BufferAttribute(house, 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return g;
}
const PARTICLE_GEO = buildGeo();

const particleUniforms = {
  uTime: { value: 0 },
  uMorph: { value: 0 },
  uIntro: { value: 0 }, // 0..4 across the intro scenes
  uIntroAmt: { value: 1 }, // 1 = show intro scenes, 0 = show scroll forms
  uIntroTint: { value: new THREE.Color(1, 1, 1) }, // per-scene colour mood
  uMouse: { value: new THREE.Vector3(999, 999, 0) },
  uMouseActive: { value: 0 },
  uSize: { value: LOW_END ? 18 : 22 },
  uColorA: { value: new THREE.Color("#dbf1ff") },
  uColorB: { value: new THREE.Color("#21e6ff") },
  uOpacity: { value: 0.95 },
};

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uIntro;
uniform float uIntroAmt;
uniform vec3 uIntroTint;
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
attribute vec3 aSolar;
attribute vec3 aPlanet;
attribute vec3 aCity;
attribute vec3 aHouse;
attribute vec3 aColor;
attribute float aSeed;
varying float vA;
varying vec3 vCol;
float tw(float m, float c) { return max(0.0, 1.0 - abs(m - c)); }
void main() {
  // scroll forms (post-intro): TZ, cube, torus, cross, sphere, sphere
  vec3 scrollForm =
    position * tw(uMorph, 0.0) + aF1 * tw(uMorph, 1.0) + aF2 * tw(uMorph, 2.0) +
    aF3 * tw(uMorph, 3.0) + aF4 * tw(uMorph, 4.0) + aF5 * tw(uMorph, 5.0);
  // intro scenes: solar -> planet -> city -> house -> hero TZ (position)
  vec3 introForm =
    aSolar * tw(uIntro, 0.0) + aPlanet * tw(uIntro, 1.0) + aCity * tw(uIntro, 2.0) +
    aHouse * tw(uIntro, 3.0) + position * tw(uIntro, 4.0);
  vec3 p = mix(scrollForm, introForm, uIntroAmt);

  float nf = floor(uMorph + 0.5);
  float crisp = 1.0 - smoothstep(0.06, 0.34, abs(uMorph - nf));
  float drift = (1.0 - crisp) * (1.0 - uIntroAmt);
  p += drift * 0.06 * vec3(
    sin(uTime * 0.5 + aSeed * 6.2831),
    cos(uTime * 0.43 + aSeed * 4.7),
    sin(uTime * 0.31 + aSeed * 3.3)
  );

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec2 toM = world.xy - uMouse.xy;
  float dM = length(toM);
  float infl = uMouseActive * smoothstep(0.5, 0.0, dM);
  world.xy += normalize(toM + 0.0001) * infl * 0.16;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize / max(0.1, -mv.z);
  vA = 0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 6.2831);
  vec3 heroCol = mix(uColorA, uColorB, smoothstep(0.45, 1.0, aSeed));
  // cosmic scene colours (tinted per scene) during the intro, fading to the
  // hero palette at the end
  vCol = mix(heroCol, aColor * uIntroTint, uIntroAmt);
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
  float a = smoothstep(0.5, 0.16, d) * uOpacity * vA;
  gl_FragColor = vec4(vCol, a);
}
`;

// Cinematic intro state. `phase` morphs across the four scenes (+ hero), `amt`
// crossfades intro<->scroll, `cz/cy` place the camera and `ly` its look height,
// `spin` turns the cloud.
const intro = { active: false, phase: 0, amt: 1, cz: 14, cy: 5, ly: 0, spin: 0 };
let introTl: gsap.core.Timeline | null = null;
const TWO_PI = Math.PI * 2;
const morphState = { v: 0 };
let lockArmed = false;
let lastHoverSound = 0;
const LOCK_NOTES = [196, 220, 247, 294, 330, 392];
const BASE_SIZE = LOW_END ? 18 : 22;

function PointsField() {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  useEffect(() => {
    intro.phase = 0;
    intro.amt = 1;
    intro.cz = 13;
    intro.cy = 4.6;
    intro.ly = 0;
    intro.spin = 0.1;
    const unsub = onIntroDone(() => {
      intro.active = true;
      document.documentElement.classList.add("intro-flying");
      audio.flight();
      particleUniforms.uSize.value = LOW_END ? 26 : 32;
      particleUniforms.uIntroTint.value.setRGB(1.0, 0.92, 0.8); // solar warm
      PARTICLE_GEO.setDrawRange(0, COUNT); // full density for the cinematic
      introTl = gsap.timeline({
        onComplete: () => {
          intro.active = false;
          document.documentElement.classList.remove("intro-flying");
          markWorldReady();
          audio.arrival();
        },
      });
      const tint = (rr: number, gg: number, bb: number, at: number, dur: number) =>
        introTl!.to(
          particleUniforms.uIntroTint.value,
          { r: rr, g: gg, b: bb, duration: dur, ease: "power1.inOut" },
          at,
        );

      // ONE continuous tween carries BOTH the camera (cz/cy/ly) and the scene
      // morph (phase) through every keyframe — so the camera always glides into
      // the next scene instead of cutting. "Hold" keyframes keep phase steady
      // while the camera drifts slowly (a held shot that breathes, never frozen).
      introTl.to(
        intro,
        {
          keyframes: [
            { phase: 0, cz: 11, cy: 4.2, ly: 0, duration: 2.2, ease: "power1.inOut" }, // solar hold
            { phase: 1, cz: 6, cy: 0.8, ly: 0, duration: 2.2, ease: "power2.inOut" }, // -> planet
            { phase: 1, cz: 5.2, cy: 0.5, ly: 0, duration: 1.8, ease: "sine.inOut" }, // planet drift
            { phase: 2, cz: 8.5, cy: -1.4, ly: 0.8, duration: 2.4, ease: "power2.inOut" }, // -> city (low)
            { phase: 2, cz: 7.8, cy: -1.3, ly: 0.8, duration: 1.8, ease: "sine.inOut" }, // skyline drift
            { phase: 3, cz: 5.4, cy: 0, ly: -0.2, duration: 2.4, ease: "power2.inOut" }, // -> room
            { phase: 3, cz: 5.0, cy: 0, ly: -0.2, duration: 1.8, ease: "sine.inOut" }, // room drift
            { phase: 4, cz: 4.2, cy: 0, ly: 0, duration: 2.2, ease: "power2.inOut" }, // -> hero TZ
          ],
        },
        0,
      );

      // Per-scene colour mood, aligned to each morph.
      tint(0.6, 0.78, 1.0, 2.2, 2.2); // planet blue
      tint(1.0, 0.82, 0.55, 6.2, 2.4); // city warm
      tint(0.65, 0.92, 1.0, 10.4, 2.4); // room cool

      // A soft swoosh on each scene change.
      introTl.add(() => audio.transition(), 2.2);
      introTl.add(() => audio.transition(), 6.2);
      introTl.add(() => audio.transition(), 10.4);

      // Resolve into the hero: thin out the count mid-swarm, drop the spin,
      // crossfade to the scroll forms, ease the pixels back to the hero size.
      introTl.add(() => PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT), 15.8);
      introTl
        .to(intro, { spin: 0, duration: 1.6, ease: "power2.out" }, 15.0)
        .to(intro, { amt: 0, duration: 1.6, ease: "power2.in" }, 15.2)
        .to(
          particleUniforms.uSize,
          { value: BASE_SIZE, duration: 1.8, ease: "power2.in" },
          15.0,
        );
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
      const near = world.x * world.x + world.y * world.y < 2.6;
      const now = performance.now();
      if (!intro.active && near && now - lastHoverSound > 120) {
        lastHoverSound = now;
        // higher in the cloud -> higher pitch
        const heightT = Math.min(Math.max((world.y + 1.8) / 3.6, 0), 1);
        audio.hoverParticle(150 + heightT * 520);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      unsub();
      introTl?.kill();
      intro.active = false;
      document.documentElement.classList.remove("intro-flying");
      particleUniforms.uSize.value = BASE_SIZE;
      window.removeEventListener("mousemove", onMove);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const cam = state.camera;
    const d = Math.min(delta, 0.05);
    mat.uniforms.uTime.value += d;

    // Scrolling cuts the cinematic short and hands straight to scroll.
    if (intro.active && scrollProgress.progress > 0.02) {
      introTl?.kill();
      intro.active = false;
      intro.amt = 0;
      intro.phase = 4;
      particleUniforms.uSize.value = BASE_SIZE;
      PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT);
      document.documentElement.classList.remove("intro-flying");
      markWorldReady();
    }

    mat.uniforms.uIntro.value = intro.phase;
    mat.uniforms.uIntroAmt.value = intro.amt;

    // Scroll morph target (only meaningful once the intro has handed off).
    const raw = Math.min(Math.max(scrollProgress.morphTarget, 0), 5);
    const seg = Math.min(Math.floor(raw), 4);
    const frac = raw - seg;
    const HOLD = 0.2;
    let f;
    if (frac < HOLD) f = 0;
    else if (frac > 1 - HOLD) f = 1;
    else {
      const tt = (frac - HOLD) / (1 - 2 * HOLD);
      f = tt * tt * (3 - 2 * tt);
    }
    morphState.v += (seg + f - morphState.v) * 0.045;
    const morph = morphState.v;
    mat.uniforms.uMorph.value = morph;

    const fd = Math.min(Math.max((Math.abs(morph - Math.round(morph)) - 0.06) / 0.28, 0), 1);
    const crisp = 1 - fd * fd * (3 - 2 * fd);
    if (!intro.active && crisp > 0.92 && lockArmed) {
      lockArmed = false;
      audio.lock(LOCK_NOTES[Math.min(Math.max(Math.round(morph), 0), 5)]);
    } else if (crisp < 0.5) {
      lockArmed = true;
    }

    const p = ref.current;
    if (p) {
      const t = mat.uniforms.uTime.value;
      if (intro.active) {
        // The world transforms scene to scene; the camera pushes/rises and the
        // cloud turns slowly for a weighty, cinematic feel.
        cam.position.set(0, intro.cy, intro.cz);
        cam.lookAt(0, intro.ly, 0);
        p.position.set(0, 0, 0);
        p.rotation.y += d * intro.spin;
        p.rotation.x += (0 - p.rotation.x) * 0.02;
      } else {
        p.rotation.y += d * 0.3 * (1 - crisp);
        p.rotation.y += (Math.sin(t * 0.4) * 0.14 - p.rotation.y) * 0.04 * crisp;
        p.rotation.y -= TWO_PI * Math.round(p.rotation.y / TWO_PI);
        p.rotation.x += (0 - p.rotation.x) * 0.05;
        cam.position.x += (0 - cam.position.x) * 0.06;
        cam.position.y += (0 - cam.position.y) * 0.06;
        cam.position.z += (4.2 - cam.position.z) * 0.05;
        cam.rotation.x += (0 - cam.rotation.x) * 0.06;
        cam.rotation.y += (0 - cam.rotation.y) * 0.06;
        cam.rotation.z += (0 - cam.rotation.z) * 0.06;
        p.position.x = Math.sin(morph * Math.PI) * 0.38 * (1 - crisp);
        const w0 = Math.max(0, 1 - Math.abs(morph));
        p.position.y = w0 * 0.5 + Math.sin(t * 0.5) * 0.05;
      }
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
      camera={{ position: [0, 0, 16], fov: 45 }}
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
