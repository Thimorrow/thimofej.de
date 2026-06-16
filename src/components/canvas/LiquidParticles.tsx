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
const COUNT = LOW_END ? 34000 : 170000; // full static world, only during the intro

// The particles form ONE static 3D world: every particle belongs to exactly one
// scene and stays fixed in space — the camera is the only thing that moves, it
// zooms straight through. Partitioned by index (the hero TZ group FIRST so the
// scroll phase can render just those via drawRange). Nothing morphs during the
// flight; far scenes fade in only as the camera nears them (aReveal), and the
// far-scene particles are dropped at the end (off-screen behind the camera).
const N_TZ = Math.floor(COUNT * 0.24);
const N_SOLAR = Math.floor(COUNT * 0.18);
const N_SATURN = Math.floor(COUNT * 0.12);
const N_CITY = Math.floor(COUNT * 0.24);
// room = the remainder (~0.22)
const SCROLL_COUNT = N_TZ; // scroll phase renders exactly the hero-TZ particles

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

// Builds the static world. `position` is each particle's fixed place; `aReveal`
// is the `u` at which its scene fades in. The hero TZ group additionally carries
// the scroll-phase forms (cube/torus/cross/two spheres); every other particle's
// scroll forms equal its own position (never rendered in scroll, kept inert).
function buildGeo() {
  const rnd = Math.random;
  const pos = new Float32Array(COUNT * 3);
  const f1 = new Float32Array(COUNT * 3); // cube (Work)
  const f2 = new Float32Array(COUNT * 3); // torus (Life)
  const f3 = new Float32Array(COUNT * 3); // cross (Likes)
  const f4 = new Float32Array(COUNT * 3); // sphere (Writing)
  const f5 = new Float32Array(COUNT * 3); // sphere (Contact)
  const colors = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const reveal = new Float32Array(COUNT);

  const planetPal = [
    [0.42, 0.6, 1.0],
    [1.0, 0.46, 0.28],
    [0.35, 0.95, 0.85],
    [0.86, 0.72, 0.46],
  ];
  const set = (arr: Float32Array, i: number, x: number, y: number, z: number) => {
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  };
  // deterministic 0..1 hash, for stable per-building / per-window properties
  const phash = (a: number, b: number, c: number) => {
    const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
    return s - Math.floor(s);
  };

  // partition boundaries
  const A = N_TZ;
  const B = A + N_SOLAR;
  const C = B + N_SATURN;
  const D = C + N_CITY;

  for (let i = 0; i < COUNT; i++) {
    let x = 0;
    let y = 0;
    let z = 0;
    let cr = 1;
    let cg = 1;
    let cb = 1;
    let rev = -1;

    if (i < A) {
      // ---- HERO TZ at the origin (inside the room) ----
      rev = 0.56;
      const [tx, ty, tz] = tzPoint(rnd);
      x = tx * 1.1;
      y = ty * 1.1;
      z = tz * 2.6; // extruded so the letters read as 3D in the 360° orbit
      cr = 0.85;
      cg = 0.92;
      cb = 1.0;
      {
        const H = 1.12;
        const axis = Math.floor(rnd() * 3);
        const tt = (rnd() * 2 - 1) * H;
        const c1 = rnd() < 0.5 ? -H : H;
        const c2 = rnd() < 0.5 ? -H : H;
        const jx = (rnd() * 2 - 1) * 0.05;
        const jy = (rnd() * 2 - 1) * 0.05;
        const jz = (rnd() * 2 - 1) * 0.05;
        if (axis === 0) set(f1, i, tt + jx, c1 + jy, c2 + jz);
        else if (axis === 1) set(f1, i, c1 + jx, tt + jy, c2 + jz);
        else set(f1, i, c1 + jx, c2 + jy, tt + jz);
      }
      {
        const ta = rnd() * 6.2831;
        const tb = rnd() * 6.2831;
        const TR = 1.0;
        const Tt = 0.42;
        set(
          f2,
          i,
          (TR + Tt * Math.cos(tb)) * Math.cos(ta),
          (TR + Tt * Math.cos(tb)) * Math.sin(ta),
          Tt * Math.sin(tb),
        );
      }
      if (rnd() < 0.6) set(f3, i, (rnd() * 2 - 1) * 0.26, (rnd() * 2 - 1) * 1.65, (rnd() * 2 - 1) * 0.26);
      else set(f3, i, (rnd() * 2 - 1) * 1.15, 0.54 + (rnd() * 2 - 1) * 0.26, (rnd() * 2 - 1) * 0.26);
      {
        const [sx, sy, sz] = spherePoint(rnd, 1.4);
        set(f4, i, sx, sy, sz);
        const [gx, gy, gz] = spherePoint(rnd, 1.4);
        set(f5, i, gx, gy, gz);
      }
    } else if (i < B) {
      // ---- SOLAR SYSTEM (sun + orbit rings + inner planets + star dust) ----
      rev = -1; // visible from the very first frame
      const tilt = 0.34;
      const rr = rnd();
      if (rr < 0.36) {
        const [a, b, c] = spherePoint(rnd, 0.95);
        x = a; y = b; z = c;
        cr = 1.0; cg = 0.68 + rnd() * 0.12; cb = 0.28;
      } else if (rr < 0.74) {
        const idx = Math.floor(rnd() * 3);
        const ro = 1.7 + idx * 0.95;
        const ang = rnd() * 6.2831;
        const fx = ro * Math.cos(ang);
        const fz = ro * Math.sin(ang);
        x = fx + (rnd() * 2 - 1) * 0.03;
        y = -fz * Math.sin(tilt) + (rnd() * 2 - 1) * 0.03;
        z = fz * Math.cos(tilt);
        cr = 0.55; cg = 0.8; cb = 1.0;
      } else if (rr < 0.94) {
        const idx = Math.floor(rnd() * 3);
        const ro = 1.7 + idx * 0.95;
        const ang = idx * 2.2 + 0.7;
        const fx = ro * Math.cos(ang);
        const fz = ro * Math.sin(ang);
        const [px, py, pz] = spherePoint(rnd, 0.28 + idx * 0.08);
        x = fx + px;
        y = -fz * Math.sin(tilt) + py;
        z = fz * Math.cos(tilt) + pz;
        const col = planetPal[idx];
        cr = col[0]; cg = col[1]; cb = col[2];
      } else {
        x = (rnd() * 2 - 1) * 4;
        y = (rnd() * 2 - 1) * 3;
        z = (rnd() * 2 - 1) * 4;
        cr = 0.8; cg = 0.85; cb = 1.0;
      }
      x += 0; y += 0.2; z += 40;
    } else if (i < C) {
      // ---- SATURN: a big ringed planet, on an outer orbit of the SAME system,
      // so it's part of the solar view from the start; we fly OVER it ----
      rev = -1;
      if (rnd() < 0.74) {
        const [a, b, c] = spherePoint(rnd, 1.55, rnd() < 0.85);
        x = a; y = b; z = c;
        cr = 0.95; cg = 0.84; cb = 0.6;
      } else {
        const ang = rnd() * 6.2831;
        const rr2 = 2.2 + rnd() * 0.9;
        const tlt = 0.5;
        const fx = rr2 * Math.cos(ang);
        const fz = rr2 * Math.sin(ang);
        x = fx;
        y = -fz * Math.sin(tlt) + (rnd() * 2 - 1) * 0.04;
        z = fz * Math.cos(tlt);
        cr = 0.85; cg = 0.78; cb = 0.62;
      }
      x += 4.5; y += 1.0; z += 32;
    } else if (i < D) {
      // ---- CITY: a night skyline — solid towers + lit-window grids on a
      // glowing street grid, so it reads as a city at a glance ----
      rev = 0.28;
      const gx = Math.floor(rnd() * 9) - 4;
      const gz = Math.floor(rnd() * 7) - 3;
      const sp = 0.98; // block spacing (the gaps between are the streets)
      const dd = 1 - Math.min(1, (Math.abs(gx) + Math.abs(gz)) / 7);
      const hh = 1.3 + (0.25 + 0.75 * dd) * phash(gx, gz, 1) * 5.0; // tower height
      const bw = 0.34 + phash(gx, gz, 2) * 0.13; // half width
      const bd = 0.34 + phash(gx, gz, 3) * 0.13; // half depth
      const cx = gx * sp;
      const cz = gz * sp;
      const base = -2.6;
      const role = rnd();
      if (role < 0.1) {
        // glowing street grid: warm lines running between the blocks
        if (rnd() < 0.5) {
          x = cx + (rnd() * 2 - 1) * sp * 0.5;
          z = cz + (rnd() < 0.5 ? -0.5 : 0.5) * sp;
        } else {
          x = cx + (rnd() < 0.5 ? -0.5 : 0.5) * sp;
          z = cz + (rnd() * 2 - 1) * sp * 0.5;
        }
        y = base;
        cr = 1.0; cg = 0.58; cb = 0.28;
      } else if (role < 0.2) {
        // crisp flat roof cap (defines the jagged skyline) + red beacon on tall
        if (dd > 0.45 && rnd() < 0.3) {
          x = cx + (rnd() * 2 - 1) * 0.05;
          z = cz + (rnd() * 2 - 1) * 0.05;
          y = base + hh + rnd() * 0.3;
          cr = 1.0; cg = 0.2; cb = 0.16;
        } else {
          x = cx + (rnd() * 2 - 1) * bw;
          z = cz + (rnd() * 2 - 1) * bd;
          y = base + hh;
          cr = 0.6; cg = 0.72; cb = 0.95;
        }
      } else if (role < 0.28) {
        // bright vertical corner edges define the box
        x = cx + (rnd() < 0.5 ? -bw : bw);
        z = cz + (rnd() < 0.5 ? -bd : bd);
        y = base + rnd() * hh;
        cr = 0.5; cg = 0.62; cb = 0.85;
      } else {
        // DENSE lit windows over the whole facade so each tower reads as a solid
        // lit block — most warm, a few cool, only a few dark
        const side = Math.floor(rnd() * 4);
        const cols = Math.max(2, Math.round(bw / 0.14));
        const rows = Math.max(4, Math.round(hh / 0.24));
        const wc = Math.floor(rnd() * cols);
        const wr = Math.floor(rnd() * rows);
        const across = ((wc + 0.5) / cols) * 2 - 1;
        const jx = (rnd() * 2 - 1) * 0.03;
        const jy = (rnd() * 2 - 1) * 0.04;
        if (side === 0) { x = cx + bw; z = cz + across * bd + jx; }
        else if (side === 1) { x = cx - bw; z = cz + across * bd + jx; }
        else if (side === 2) { x = cx + across * bw + jx; z = cz + bd; }
        else { x = cx + across * bw + jx; z = cz - bd; }
        y = base + 0.2 + ((wr + 0.5) / rows) * (hh - 0.35) + jy;
        const lit = phash(gx * 3 + side, gz * 5 + wc, wr + 2);
        if (lit > 0.22) {
          if (phash(gx + wc, gz + wr, side) > 0.88) {
            cr = 0.7; cg = 0.85; cb = 1.0; // a few cool-white windows
          } else {
            cr = 1.0; cg = 0.76 + 0.14 * lit; cb = 0.44; // warm windows
          }
        } else {
          cr = 0.18; cg = 0.2; cb = 0.28; // a few dark windows
        }
      }
      y += -2.5; z += 18;
    } else {
      // ---- ROOM around the origin (box + window frame + table) — the room you
      // see through a city window, then fly into ----
      rev = 0.5;
      const RX = 2.7;
      const RY = 1.9;
      const NEARZ = 5;
      const FARZ = -1.5;
      const zc = (s: number) => ((s + 1) / 2) * (NEARZ - FARZ) + FARZ;
      const rr3 = rnd();
      if (rr3 < 0.46) {
        const axis = Math.floor(rnd() * 3);
        const s = rnd() * 2 - 1;
        const e1 = rnd() < 0.5 ? -1 : 1;
        const e2 = rnd() < 0.5 ? -1 : 1;
        if (axis === 0) { x = s * RX; y = e1 * RY; z = zc(e2); }
        else if (axis === 1) { x = e1 * RX; y = s * RY; z = zc(e2); }
        else { x = e1 * RX; y = e2 * RY; z = zc(s); }
        cr = 0.5; cg = 0.82; cb = 1.0;
      } else if (rr3 < 0.64) {
        const ww = 1.5;
        const wh = 1.2;
        const edge = Math.floor(rnd() * 4);
        const t = rnd() * 2 - 1;
        if (edge === 0) { x = t * ww; y = 0.3 + wh; }
        else if (edge === 1) { x = t * ww; y = 0.3 - wh; }
        else if (edge === 2) { x = ww; y = 0.3 + t * wh; }
        else { x = -ww; y = 0.3 + t * wh; }
        z = NEARZ - 0.02;
        cr = 1.0; cg = 0.97; cb = 0.86;
      } else if (rr3 < 0.82) {
        if (rnd() < 0.7) {
          x = (rnd() * 2 - 1) * 1.4;
          y = -1.15;
          z = (rnd() * 2 - 1) * 0.8;
        } else {
          x = (rnd() < 0.5 ? -1 : 1) * 1.15;
          y = -1.15 - rnd() * 0.9;
          z = (rnd() < 0.5 ? -1 : 1) * 0.6;
        }
        cr = 0.55; cg = 0.8; cb = 1.0;
      } else {
        x = (rnd() * 2 - 1) * RX;
        y = -RY + 0.02;
        z = zc(rnd() * 2 - 1);
        cr = 0.45; cg = 0.7; cb = 1.0;
      }
    }

    set(pos, i, x, y, z);
    if (i >= A) {
      set(f1, i, x, y, z);
      set(f2, i, x, y, z);
      set(f3, i, x, y, z);
      set(f4, i, x, y, z);
      set(f5, i, x, y, z);
    }
    colors[i * 3] = cr;
    colors[i * 3 + 1] = cg;
    colors[i * 3 + 2] = cb;
    seed[i] = rnd();
    reveal[i] = rev;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aF1", new THREE.BufferAttribute(f1, 3));
  g.setAttribute("aF2", new THREE.BufferAttribute(f2, 3));
  g.setAttribute("aF3", new THREE.BufferAttribute(f3, 3));
  g.setAttribute("aF4", new THREE.BufferAttribute(f4, 3));
  g.setAttribute("aF5", new THREE.BufferAttribute(f5, 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setAttribute("aReveal", new THREE.BufferAttribute(reveal, 1));
  return g;
}
const PARTICLE_GEO = buildGeo();

const particleUniforms = {
  uTime: { value: 0 },
  uMorph: { value: 0 },
  uIntroAmt: { value: 1 }, // 1 = show the static world, 0 = show the scroll forms
  uU: { value: 0 }, // the flight parameter, drives per-scene reveal
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
uniform float uIntroAmt;
uniform float uU;
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
attribute vec3 aColor;
attribute float aSeed;
attribute float aReveal;
varying float vA;
varying vec3 vCol;
float tw(float m, float c) { return max(0.0, 1.0 - abs(m - c)); }
void main() {
  vec3 scrollForm =
    position * tw(uMorph, 0.0) + aF1 * tw(uMorph, 1.0) + aF2 * tw(uMorph, 2.0) +
    aF3 * tw(uMorph, 3.0) + aF4 * tw(uMorph, 4.0) + aF5 * tw(uMorph, 5.0);
  // intro = the static world (position); after handoff = the scroll forms. The
  // hero TZ sits at the origin in both, so the swap is invisible.
  vec3 p = mix(scrollForm, position, uIntroAmt);

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
  float infl = uMouseActive * smoothstep(0.5, 0.0, dM) * (1.0 - uIntroAmt);
  world.xy += normalize(toM + 0.0001) * infl * 0.16;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize / max(0.1, -mv.z);
  // per-scene reveal: a scene stays hidden until the camera flies up to it
  float vis = smoothstep(aReveal, aReveal + 0.18, uU);
  // the outer world (solar, Saturn, city: aReveal < 0.4) fades away before the
  // final orbit, so circling behind the TZ never shows the city through it; the
  // room (aReveal 0.5) fades as we settle onto the front hero shot.
  if (aReveal < 0.4) vis *= 1.0 - smoothstep(0.74, 0.82, uU);
  else if (aReveal < 0.55) vis *= 1.0 - smoothstep(0.94, 1.0, uU);
  vis = mix(1.0, vis, uIntroAmt);
  vA = (0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 6.2831)) * vis;
  vec3 heroCol = mix(uColorA, uColorB, smoothstep(0.45, 1.0, aSeed));
  vCol = mix(heroCol, aColor, uIntroAmt);
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

// Cinematic intro state. `u` (0..1) drives the camera along its flight; `amt`
// crossfades the static world -> scroll forms at the very end.
const intro = { active: false, u: 0, amt: 1 };
let introTl: gsap.core.Timeline | null = null;
const TWO_PI = Math.PI * 2;
const morphState = { v: 0 };
let lockArmed = false;
let lastHoverSound = 0;
let camRoll = 0;
const LOCK_NOTES = [196, 220, 247, 294, 330, 392];
const BASE_SIZE = LOW_END ? 18 : 22;

// The camera's continuous zoom through the static world. 9 control points -> 8
// segments; scene beats land on the EVEN indices (u = 0,.25,.5,.75,1) and the
// ODD indices shape the curve. The path: take in the whole solar system (Saturn
// included) -> rise UP and OVER Saturn's horizon -> the city revealed beyond ->
// fly over the city, down toward a house window -> into the room -> swing to the
// front of the TZ -> hero. The camera only ever moves forward / around.
const CAM_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 1.6, 52), // 0 solar system (Saturn in view)
    new THREE.Vector3(3.5, 3.2, 41), // 1 climb toward Saturn
    new THREE.Vector3(5.0, 5.0, 34), // 2 OVER Saturn's horizon
    new THREE.Vector3(0.6, 1.5, 28), // 3 descend past Saturn toward the city
    new THREE.Vector3(0, -0.2, 24), // 4 down at skyline height, in profile
    new THREE.Vector3(0, 0.6, 12), // 5 rise over the rooftops toward a window
    new THREE.Vector3(0, 0.4, 7), // 6 at the window (== orbit start, o=0)
    new THREE.Vector3(2.6, 0.2, 3.2), // 7 (curve shaping; orbit takes over here)
    new THREE.Vector3(0, 0, 4.2), // 8 hero front
  ],
  false,
  "centripetal",
);
const LOOK_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(1.0, 0.3, 40), // 0 the system
    new THREE.Vector3(4.5, 1.2, 33), // 1 Saturn
    new THREE.Vector3(3.0, -0.5, 25), // 2 over Saturn, toward the far side
    new THREE.Vector3(0, -0.8, 20), // 3 the city ahead
    new THREE.Vector3(0, -0.5, 16), // 4 across the skyline (near-horizontal)
    new THREE.Vector3(0, -0.1, 3), // 5 the house window
    new THREE.Vector3(0, 0, 0), // 6 room / TZ (== orbit look target, origin)
    new THREE.Vector3(0, 0, 0), // 7 TZ
    new THREE.Vector3(0, 0, 0), // 8 hero TZ at origin
  ],
  false,
  "centripetal",
);
const _camPos = new THREE.Vector3();
const _lookPos = new THREE.Vector3();
const _tan = new THREE.Vector3();

// DEV-ONLY: lets the verification harness jump straight to a beat (set
// __intro.active = true, __intro.u = k) without playing the whole timeline.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __intro: typeof intro }).__intro = intro;
  (window as unknown as { __pu: typeof particleUniforms }).__pu = particleUniforms;
}

function PointsField() {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  useEffect(() => {
    intro.u = 0;
    intro.amt = 1;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const unsub = onIntroDone(() => {
      if (reduce) {
        intro.amt = 0;
        intro.u = 1;
        particleUniforms.uU.value = 1;
        PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT);
        markWorldReady();
        return;
      }
      intro.active = true;
      document.documentElement.classList.add("intro-flying");
      audio.flight();
      particleUniforms.uSize.value = LOW_END ? 30 : 42;
      PARTICLE_GEO.setDrawRange(0, COUNT);
      introTl = gsap.timeline({
        onComplete: () => {
          intro.active = false;
          document.documentElement.classList.remove("intro-flying");
          markWorldReady();
          audio.arrival();
        },
      });

      // ONE even, gently-eased glide — the camera accelerates away from a scene
      // and eases into the next at a steady pace, only ever slowing at a scene,
      // never stopping, never lurching. All motion is the camera; world is rigid.
      introTl.to(
        intro,
        {
          keyframes: [
            { u: 0.25, duration: 3.4, ease: "sine.inOut" }, // system -> over Saturn
            { u: 0.5, duration: 3.4, ease: "sine.inOut" }, // -> city
            { u: 0.75, duration: 3.4, ease: "sine.inOut" }, // -> house window
            { u: 1, duration: 3.6, ease: "sine.inOut" }, // through, orbit, hero
          ],
        },
        0,
      );

      // Swoosh at each segment's MIDPOINT, where the camera moves fastest.
      introTl.add(() => audio.transition(), 1.7);
      introTl.add(() => audio.transition(), 5.1);
      introTl.add(() => audio.transition(), 8.5);

      // Resolve: crossfade to the scroll forms, ease the pixels back to the hero
      // size, then drop the (already faded) world particles for the scroll phase.
      introTl
        .to(intro, { amt: 0, duration: 1.2, ease: "power2.in" }, 13.0)
        .to(
          particleUniforms.uSize,
          { value: BASE_SIZE, duration: 1.8, ease: "power2.in" },
          12.6,
        );
      introTl.add(() => PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT), 13.9);
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
      intro.u = 1;
      particleUniforms.uSize.value = BASE_SIZE;
      PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT);
      document.documentElement.classList.remove("intro-flying");
      markWorldReady();
    }

    mat.uniforms.uIntroAmt.value = intro.amt;
    mat.uniforms.uU.value = intro.u;

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
        // The world is rigid; the camera is the only thing that moves.
        const u = Math.min(Math.max(intro.u, 0), 1);
        if (u <= 0.75) {
          // zoom through the world along the path, aimed at the scene ahead,
          // with a slight bank in the turns
          CAM_PATH.getPoint(u, _camPos);
          LOOK_PATH.getPoint(u, _lookPos);
          cam.position.copy(_camPos);
          cam.lookAt(_lookPos);
          CAM_PATH.getTangent(u, _tan);
          const rollTarget = Math.min(Math.max(-_tan.x * 0.4, -0.14), 0.14);
          camRoll += (rollTarget - camRoll) * 0.06;
          cam.rotateZ(camRoll);
        } else {
          // a real full 360° around the TZ, spiralling inward to the hero shot.
          // Starts at the window pose (matches path point 6) and ends dead front.
          const o = (u - 0.75) / 0.25; // 0..1
          const R = 7 + (4.2 - 7) * o;
          const ang = o * TWO_PI;
          cam.position.set(R * Math.sin(ang), 0.4 * (1 - o), R * Math.cos(ang));
          cam.lookAt(0, 0, 0);
          camRoll += (0 - camRoll) * 0.06;
          cam.rotateZ(camRoll);
        }
        p.position.set(0, 0, 0);
        p.rotation.set(0, 0, 0);
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
        // ease (don't snap) to the hero height — the intro ends with the TZ
        // centred (y=0); the hero wants it lifted (y=0.5) to leave room for the
        // text. Easing makes that a glide instead of a jump at the handoff.
        const targetY = w0 * 0.5 + Math.sin(t * 0.5) * 0.05;
        p.position.y += (targetY - p.position.y) * 0.04;
      }
    }
  });

  return (
    <points ref={ref} geometry={PARTICLE_GEO} frustumCulled={false}>
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
