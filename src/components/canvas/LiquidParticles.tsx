"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { scrollProgress } from "@/lib/scrollProgress";
import { audio } from "@/lib/audio";
import {
  onIntroDone,
  markWorldReady,
  skipFlight,
  onReplay,
  emitArrive,
  emitFlightStart,
  onFlightSkip,
  FLIGHT_SEGS,
  FLIGHT_TOTAL,
} from "@/lib/intro";
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
const N_SOLAR = Math.floor(COUNT * 0.16);
const N_SATURN = Math.floor(COUNT * 0.1);
const N_CITY = Math.floor(COUNT * 0.3);
// room = the remainder (~0.20)
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

// A jittered point on the outline of a rect (w/h = half-extents), edge-weighted
// so the particle density is even along the perimeter.
function rectEdgePoint(rnd: () => number, w: number, h: number): [number, number] {
  const horizontal = rnd() < w / (w + h);
  const s = rnd() < 0.5 ? -1 : 1;
  const j = () => (rnd() * 2 - 1) * 0.045;
  return horizontal
    ? [(rnd() * 2 - 1) * w + j(), s * h + j()]
    : [s * w + j(), (rnd() * 2 - 1) * h + j()];
}

// A jittered point on the segment (x1,y1) -> (x2,y2).
function segPoint(
  rnd: () => number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number] {
  const t = rnd();
  const j = () => (rnd() * 2 - 1) * 0.045;
  return [x1 + (x2 - x1) * t + j(), y1 + (y2 - y1) * t + j()];
}

// Builds the static world. `position` is each particle's fixed place; `aReveal`
// is the `u` at which its scene fades in. The hero TZ group additionally carries
// the scroll-phase forms — one meaningful symbol per section; every other
// particle's scroll forms equal its own position (never rendered in scroll,
// kept inert).
function buildGeo() {
  const rnd = Math.random;
  const pos = new Float32Array(COUNT * 3);
  const f1 = new Float32Array(COUNT * 3); // gear (Work: bauen)
  const f2 = new Float32Array(COUNT * 3); // arrow up (Life: das bessere Ich)
  const f3 = new Float32Array(COUNT * 3); // cross (Likes: Glaube zuerst)
  const f4 = new Float32Array(COUNT * 3); // page with lines (Writing)
  const f5 = new Float32Array(COUNT * 3); // envelope (Contact: Postfach offen)
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
        // GEAR (Arbeit): hub + ring + 8 teeth — the thing that builds things.
        const pick = rnd();
        let ga: number;
        let gr: number;
        if (pick < 0.18) {
          ga = rnd() * 6.2831;
          gr = 0.3 + rnd() * 0.16;
        } else if (pick < 0.66) {
          ga = rnd() * 6.2831;
          gr = 0.72 + rnd() * 0.33;
        } else {
          const tooth = Math.floor(rnd() * 8);
          ga = (tooth / 8) * 6.2831 + (rnd() * 2 - 1) * 0.16;
          gr = 1.05 + rnd() * 0.35;
        }
        set(f1, i, Math.cos(ga) * gr, Math.sin(ga) * gr, (rnd() * 2 - 1) * 0.18);
      }
      {
        // ARROW UP (Leben): the better self, always pointing up. Head sampled
        // area-weighted so the solid triangle glows evenly.
        if (rnd() < 0.45) {
          set(
            f2,
            i,
            (rnd() * 2 - 1) * 0.16,
            -1.35 + rnd() * 1.75,
            (rnd() * 2 - 1) * 0.18,
          );
        } else {
          const th = 1 - Math.sqrt(rnd());
          const hw = 0.72 * (1 - th);
          set(
            f2,
            i,
            (rnd() * 2 - 1) * hw,
            0.32 + th * 1.05,
            (rnd() * 2 - 1) * 0.18,
          );
        }
      }
      // CROSS (Mag ich): faith first — the one form that always made sense.
      if (rnd() < 0.6) set(f3, i, (rnd() * 2 - 1) * 0.26, (rnd() * 2 - 1) * 1.65, (rnd() * 2 - 1) * 0.26);
      else set(f3, i, (rnd() * 2 - 1) * 1.15, 0.54 + (rnd() * 2 - 1) * 0.26, (rnd() * 2 - 1) * 0.26);
      {
        // PAGE (Schreiben): a sheet outline with text lines, the last one short
        // like a paragraph that just ended.
        if (rnd() < 0.38) {
          const [px, py] = rectEdgePoint(rnd, 0.8, 1.05);
          set(f4, i, px, py, (rnd() * 2 - 1) * 0.15);
        } else {
          const line = Math.floor(rnd() * 4);
          const ly = 0.62 - line * 0.42;
          const lx = line === 3 ? -0.55 + rnd() * 0.55 : -0.55 + rnd() * 1.1;
          set(f4, i, lx, ly + (rnd() * 2 - 1) * 0.035, (rnd() * 2 - 1) * 0.15);
        }
      }
      {
        // ENVELOPE (Kontakt): the open Postfach — outline plus flap.
        if (rnd() < 0.55) {
          const [ex, ey] = rectEdgePoint(rnd, 1.3, 0.82);
          set(f5, i, ex, ey, (rnd() * 2 - 1) * 0.15);
        } else {
          const sgn = rnd() < 0.5 ? -1 : 1;
          const [ex, ey] = segPoint(rnd, sgn * 1.3, 0.82, 0, -0.08);
          set(f5, i, ex, ey, (rnd() * 2 - 1) * 0.15);
        }
      }
    } else if (i < B) {
      // ---- SOLAR SYSTEM (sun + corona + orbit rings + inner planets + a
      // milky-way band of stars) ----
      rev = -1; // visible from the very first frame
      const tilt = 0.34;
      const rr = rnd();
      if (rr < 0.3) {
        // sun core: white-hot centre cooling to a deep orange rim
        const [a, b, c] = spherePoint(rnd, 0.95);
        x = a; y = b; z = c;
        const rN = Math.min(1, Math.hypot(a, b, c) / 0.95);
        const heat = 1 - rN * rN;
        cr = 1.0;
        cg = 0.52 + 0.42 * heat + rnd() * 0.05;
        cb = 0.2 + 0.68 * heat;
      } else if (rr < 0.36) {
        // corona: sparse flaring shell, dimmer the farther it reaches
        const reach = Math.pow(rnd(), 2.4);
        const [a, b, c] = spherePoint(rnd, 0.98 + reach * 0.55, true);
        x = a; y = b; z = c;
        const dim = 0.55 - reach * 0.35;
        cr = dim; cg = dim * 0.6; cb = dim * 0.25;
      } else if (rr < 0.62) {
        const idx = Math.floor(rnd() * 3);
        const ro = 1.7 + idx * 0.95;
        const ang = rnd() * 6.2831;
        const fx = ro * Math.cos(ang);
        const fz = ro * Math.sin(ang);
        x = fx + (rnd() * 2 - 1) * 0.03;
        y = -fz * Math.sin(tilt) + (rnd() * 2 - 1) * 0.03;
        z = fz * Math.cos(tilt);
        cr = 0.55; cg = 0.8; cb = 1.0;
      } else if (rr < 0.84) {
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
      } else if (rnd() < 0.6) {
        // a tilted milky-way band behind the system: dense along a diagonal,
        // falling off softly above and below it
        const along = (rnd() * 2 - 1) * 5.5;
        const spread = (rnd() + rnd() + rnd() - 1.5) / 1.5; // soft gaussian
        x = along;
        y = along * 0.32 + spread * 0.9 + 1.2;
        z = (rnd() * 2 - 1) * 4 - 2;
        const w = 0.45 + 0.55 * rnd();
        cr = 0.75 * w; cg = 0.8 * w; cb = w;
      } else {
        // loose scattered stars, a few warm giants among the cool ones
        x = (rnd() * 2 - 1) * 4.5;
        y = (rnd() * 2 - 1) * 3.2;
        z = (rnd() * 2 - 1) * 4;
        if (rnd() < 0.18) { cr = 1.0; cg = 0.72; cb = 0.5; }
        else { cr = 0.8; cg = 0.85; cb = 1.0; }
      }
      x += 0; y += 0.2; z += 40;
    } else if (i < C) {
      // ---- SATURN: a big ringed planet, on an outer orbit of the SAME system,
      // so it's part of the solar view from the start; we fly OVER it ----
      rev = -1;
      if (rnd() < 0.68) {
        // banded gas-giant body: subtle latitude stripes, dimmer poles
        const [a, b, c] = spherePoint(rnd, 1.55, rnd() < 0.85);
        x = a; y = b; z = c;
        const lat = b / 1.55; // -1..1
        const band = 0.86 + 0.14 * Math.sin(lat * 11.5 + 0.8);
        const pole = 1 - 0.25 * lat * lat;
        cr = 0.97 * band * pole;
        cg = 0.85 * band * pole;
        cb = 0.58 * pole;
      } else {
        // rings: a bright cream inner ring, the dark Cassini division as a
        // real gap, and a cooler, dimmer outer ring — kept thin so the disc
        // reads flat, with radial grain so it shimmers
        const inner = rnd() < 0.62;
        const rr2 = inner ? 2.05 + rnd() * 0.55 : 2.74 + rnd() * 0.42;
        const ang = rnd() * 6.2831;
        const tlt = 0.5;
        const fx = rr2 * Math.cos(ang);
        const fz = rr2 * Math.sin(ang);
        x = fx;
        y = -fz * Math.sin(tlt) + (rnd() * 2 - 1) * 0.02;
        z = fz * Math.cos(tlt);
        const grain = 0.8 + 0.2 * Math.sin(rr2 * 34.0);
        if (inner) { cr = 0.92 * grain; cg = 0.84 * grain; cb = 0.66 * grain; }
        else { cr = 0.66 * grain; cg = 0.64 * grain; cb = 0.58 * grain; }
      }
      x += 4.5; y += 1.0; z += 32;
    } else if (i < D) {
      // ---- CITY + THE WAY HOME (world coords). The camera flies DOWN a central
      // boulevard cut through the skyline (towers flank both sides, none on the
      // camera line), out the far end onto a lamp-lit street that narrows toward
      // ONE small house — the room's near wall (z≈5) gets a full facade + gable
      // roof around its warm window, so "city -> window" reads as coming home. ----
      rev = 0.28;
      const GY = -3.2; // ground / street level
      const SP = 1.15; // tower grid spacing
      const HZ = 5.06; // house facade plane, just outside the room's near wall
      const r = rnd();
      if (r < 0.05) {
        // big pale moon low BEHIND the house — down the boulevard the closing
        // shot is: small house, big moon
        const ang = rnd() * 6.2831;
        const rad = 2.0 * Math.sqrt(rnd());
        x = -3.2 + rad * Math.cos(ang);
        y = 3.8 + rad * Math.sin(ang);
        z = 1.5;
        cr = 1.0; cg = 0.98; cb = 0.93;
      } else if (r < 0.11) {
        // ground haze around the city + a faint warm horizon far beyond the house
        const horizon = rnd() < 0.4;
        x = (rnd() * 2 - 1) * 8.5;
        y = GY + (horizon ? 0.04 : (rnd() * 2 - 1) * 0.12);
        z = horizon ? 2 + (rnd() * 2 - 1) * 0.4 : 15.5 + rnd() * 6;
        cr = 1.0; cg = horizon ? 0.64 : 0.5; cb = horizon ? 0.34 : 0.26;
      } else if (r < 0.2) {
        // sodium street grid: the lit boulevard the camera flies down + cross
        // streets glowing between the tower rows
        if (rnd() < 0.55) {
          const lane = rnd() < 0.7 ? (rnd() < 0.5 ? -0.85 : 0.85) : (rnd() * 2 - 1) * 0.8;
          x = lane + (rnd() * 2 - 1) * 0.05;
          y = GY + 0.02;
          z = 17.4 + rnd() * 6.4;
          cr = 1.0; cg = 0.58; cb = 0.24;
        } else {
          const rowz = 18 + (Math.floor(rnd() * 4) + 0.5) * SP;
          x = (rnd() * 2 - 1) * 8.5;
          y = GY + 0.02;
          z = rowz + (rnd() * 2 - 1) * 0.06;
          const dimm = 0.5 + rnd() * 0.3;
          cr = dimm; cg = 0.55 * dimm; cb = 0.22 * dimm;
        }
      } else if (r < 0.29) {
        // the way home: a street from the city's edge to the house, edges
        // converging on the door, centre dashes, lampposts alternating sides
        const t = rnd();
        if (t < 0.5) {
          const s = rnd() < 0.5 ? -1 : 1;
          z = 5.6 + rnd() * 11.8;
          const wRoad = 0.55 + (z - 5.6) * 0.03;
          x = s * wRoad + (rnd() * 2 - 1) * 0.05;
          y = GY + 0.02;
          cr = 0.85; cg = 0.5; cb = 0.24;
        } else if (t < 0.68) {
          const di = Math.floor(rnd() * 9);
          z = 6.2 + di * 1.25 + rnd() * 0.5;
          x = (rnd() * 2 - 1) * 0.05;
          y = GY + 0.02;
          cr = 0.9; cg = 0.78; cb = 0.45;
        } else {
          const k = Math.floor(rnd() * 6);
          const lz = 6.6 + k * 1.85;
          const lx = (k % 2 === 0 ? -1 : 1) * 1.25;
          if (rnd() < 0.35) {
            // pole
            x = lx + (rnd() * 2 - 1) * 0.02;
            y = GY + rnd() * 1.15;
            z = lz + (rnd() * 2 - 1) * 0.02;
            cr = 0.4; cg = 0.46; cb = 0.6;
          } else {
            // warm glow cluster at the lamp head
            const ga = rnd() * 6.2831;
            const gr2 = Math.sqrt(rnd()) * 0.16;
            x = lx + Math.cos(ga) * gr2;
            y = GY + 1.2 + Math.sin(ga) * gr2 * 0.8;
            z = lz + (rnd() * 2 - 1) * 0.08;
            cr = 1.0; cg = 0.78; cb = 0.42;
          }
        }
      } else if (r < 0.37) {
        // the HOUSE: a facade with gable roof + chimney wrapped around the
        // room's warm window, so the window belongs to a home, not to the void
        const f = rnd();
        if (f < 0.3) {
          // dim wall fill (window opening kept clear so the warm pane pops)
          x = (rnd() * 2 - 1) * 3.0;
          y = GY + rnd() * (2.3 - GY);
          if (Math.abs(x) < 1.85 && Math.abs(y - 0.1) < 1.45) {
            x = (1.95 + rnd() * 0.95) * (rnd() < 0.5 ? -1 : 1);
          }
          z = HZ + (rnd() * 2 - 1) * 0.04;
          cr = 0.2; cg = 0.24; cb = 0.34;
        } else if (f < 0.48) {
          // corner + eaves edge lines
          if (rnd() < 0.5) { x = rnd() < 0.5 ? -3.0 : 3.0; y = GY + rnd() * (2.3 - GY); }
          else { x = (rnd() * 2 - 1) * 3.0; y = 2.3; }
          z = HZ + (rnd() * 2 - 1) * 0.03;
          cr = 0.5; cg = 0.58; cb = 0.78;
        } else if (f < 0.75) {
          // gable roof: two rising edges to the ridge + sparse fill under them
          if (rnd() < 0.6) {
            const s = rnd() < 0.5 ? -1 : 1;
            const tt = rnd();
            x = s * (3.0 - tt * 3.0);
            y = 2.3 + tt * 1.2;
            cr = 0.6; cg = 0.66; cb = 0.84;
          } else {
            const fx = rnd() * 2 - 1;
            x = fx * 3.0;
            y = 2.3 + rnd() * (1 - Math.abs(fx)) * 1.2;
            cr = 0.24; cg = 0.28; cb = 0.4;
          }
          z = HZ + (rnd() * 2 - 1) * 0.04;
        } else if (f < 0.85) {
          // chimney on the roof slope + a couple of faint smoke wisps
          if (rnd() < 0.72) {
            x = 1.7 + (rnd() * 2 - 1) * 0.16;
            y = 2.85 + rnd() * 0.95;
            cr = 0.42; cg = 0.46; cb = 0.58;
          } else {
            x = 1.7 + (rnd() * 2 - 1) * 0.3 + rnd() * 0.25;
            y = 3.85 + rnd() * 0.9;
            cr = 0.3; cg = 0.32; cb = 0.38;
          }
          z = HZ + (rnd() * 2 - 1) * 0.05;
        } else {
          // warm light spilling out around the window frame — the beacon
          const ha = rnd() * 6.2831;
          const hr = 1.0 + rnd() * rnd() * 0.5;
          x = Math.cos(ha) * 1.7 * hr;
          y = 0.1 + Math.sin(ha) * 1.3 * hr;
          z = HZ + 0.03 + rnd() * 0.03;
          const dimm = 0.5 - (hr - 1.0) * 0.7;
          cr = dimm; cg = 0.75 * dimm; cb = 0.45 * dimm;
        }
      } else {
        // towers: two banks flanking the boulevard (gx=0 stays clear), downtown
        // height profile + landmark spikes, windows in real grids, neon signs.
        // Particles never occlude, so legibility comes from restraint: fewer
        // towers, windows only on the two faces the camera actually sees, and
        // rows dimming with depth so near buildings separate from far ones.
        let gx = Math.floor(rnd() * 10) - 5; // -5..4
        if (gx >= 0) gx += 1; // skip 0 -> boulevard stays open
        const gz = Math.floor(rnd() * 5); // 0..4 rows receding
        const bank = gx > 0 ? 1 : -1;
        const cx = gx * SP + bank * 0.3 + (phash(gx, gz, 7) - 0.5) * 0.26;
        const cz = 18 + gz * SP;
        const dim2 = 1 - gz * 0.15; // depth cue: far rows fall back
        const prof = Math.exp(-Math.pow(Math.abs(gx) - 2.6, 2) / 14);
        let hh = 2.2 + phash(gx, gz, 1) * 3.4 + prof * 2.8;
        if (phash(gx, gz, 9) > 0.93) hh += 2.4; // landmark towers
        const bw = 0.36 + phash(gx, gz, 2) * 0.18;
        const bd = 0.36 + phash(gx, gz, 3) * 0.18;
        const role = rnd();
        if (role < 0.05 && hh > 5.4) {
          // antenna spire, red beacon at the tip
          const at = rnd();
          x = cx + (rnd() * 2 - 1) * 0.04;
          z = cz + (rnd() * 2 - 1) * 0.04;
          y = GY + hh + at * 1.1;
          if (at > 0.82) { cr = 1.0; cg = 0.22; cb = 0.16; }
          else { cr = 0.55 * dim2; cg = 0.62 * dim2; cb = 0.75 * dim2; }
        } else if (role < 0.2) {
          // crisp flat roof cap -> the skyline silhouette against the sky
          x = cx + (rnd() * 2 - 1) * bw;
          z = cz + (rnd() * 2 - 1) * bd;
          y = GY + hh;
          cr = 0.78 * dim2; cg = 0.9 * dim2; cb = dim2;
        } else if (role < 0.32) {
          // bright vertical corner columns -> read the tower edges
          x = cx + (rnd() < 0.5 ? -bw : bw);
          z = cz + (rnd() < 0.5 ? -bd : bd);
          y = GY + rnd() * hh;
          cr = 0.6 * dim2; cg = 0.76 * dim2; cb = dim2;
        } else if (role < 0.36 && phash(gx, gz, 11) > 0.72) {
          // a neon sign strip on the boulevard-facing facade
          const sy = GY + 0.9 + phash(gx, gz, 13) * 2.6;
          x = cx - bank * (bw + 0.01);
          z = cz + (rnd() * 2 - 1) * bd * 0.5;
          y = sy + rnd() * 0.9;
          const np = phash(gx, gz, 17);
          if (np < 0.4) { cr = 0.25 * dim2; cg = 0.95 * dim2; cb = dim2; }
          else if (np < 0.7) { cr = dim2; cg = 0.3 * dim2; cb = 0.72 * dim2; }
          else { cr = dim2; cg = 0.62 * dim2; cb = 0.2 * dim2; }
        } else {
          // windows in a real grid: quantized columns AND rows, whole windows
          // lit or dark — and ONLY on the approach-facing and boulevard-facing
          // facades, so you don't read three overlapping grids through a tower
          const cols = 4 + Math.floor(phash(gx, gz, 4) * 3);
          const ci = Math.floor(rnd() * cols);
          const across = ((ci + 0.5) / cols) * 2 - 1;
          const front = rnd() < 0.5;
          const side = front ? 2 : 1;
          if (front) { z = cz + bd; x = cx + across * bw; }
          else { x = cx - bank * bw; z = cz + across * bd; }
          x += (rnd() * 2 - 1) * 0.015;
          z += (rnd() * 2 - 1) * 0.015;
          const wr = Math.floor(rnd() * Math.max(4, Math.round(hh / 0.22)));
          y = GY + 0.18 + (wr + 0.5) * 0.22 + (rnd() * 2 - 1) * 0.02;
          if (y > GY + hh) y = GY + hh - rnd() * 0.2;
          const lit = phash(gx * 7 + side, gz * 5 + ci, wr + 2);
          if (lit > 0.3) {
            if (phash(gx + wr, gz + side, ci) > 0.86) {
              cr = 0.7 * dim2; cg = 0.86 * dim2; cb = dim2; // cool-white windows
            } else {
              cr = dim2; cg = (0.74 + 0.16 * lit) * dim2; cb = 0.42 * dim2; // warm
            }
          } else {
            cr = 0.14; cg = 0.16; cb = 0.24; // dark windows keep the grid visible
          }
        }
      }
    } else {
      // ---- ROOM around the origin: a clean dark room the camera flies into — a
      // perspective floor grid, slim wall/ceiling edges, and one warm glowing
      // window (on the near wall) we pass through. The TZ floats at its centre,
      // no clutter, no furniture. ----
      rev = 0.5;
      const RX = 2.8;
      const RY = 2.0;
      const NEARZ = 5.0;
      const FARZ = -2.2;
      const rr3 = rnd();
      if (rr3 < 0.4) {
        // perspective floor grid: lines along z (depth) and along x (across)
        if (rnd() < 0.5) {
          x = (Math.floor(rnd() * 7) / 6 - 0.5) * 2 * RX;
          z = FARZ + rnd() * (NEARZ - FARZ);
        } else {
          z = FARZ + (Math.floor(rnd() * 7) / 6) * (NEARZ - FARZ);
          x = (rnd() * 2 - 1) * RX;
        }
        y = -RY + 0.01;
        cr = 0.4; cg = 0.66; cb = 1.0;
      } else if (rr3 < 0.56) {
        // slim room frame: the 4 vertical corners + ceiling rails (clean box)
        const pick = Math.floor(rnd() * 3);
        const e1 = rnd() < 0.5 ? -1 : 1;
        if (pick === 0) {
          x = e1 * RX;
          y = (rnd() * 2 - 1) * RY;
          z = rnd() < 0.5 ? FARZ : NEARZ;
        } else {
          x = pick === 1 ? (rnd() * 2 - 1) * RX : e1 * RX;
          y = RY;
          z = FARZ + rnd() * (NEARZ - FARZ);
        }
        cr = 0.45; cg = 0.6; cb = 0.9;
      } else if (rr3 < 0.92) {
        // the warm glowing window on the near wall, the one we fly through
        const ww = 1.7;
        const wh = 1.3;
        const wcy = 0.1;
        if (rnd() < 0.32) {
          // bright frame outline
          const edge = Math.floor(rnd() * 4);
          const t = rnd() * 2 - 1;
          if (edge === 0) { x = t * ww; y = wcy + wh; }
          else if (edge === 1) { x = t * ww; y = wcy - wh; }
          else if (edge === 2) { x = ww; y = wcy + t * wh; }
          else { x = -ww; y = wcy + t * wh; }
          cr = 1.0; cg = 0.85; cb = 0.55;
        } else {
          // soft warm glow filling the pane (+ an occasional mullion)
          x = (rnd() * 2 - 1) * ww;
          y = wcy + (rnd() * 2 - 1) * wh;
          if (rnd() < 0.16) {
            if (rnd() < 0.5) x = 0;
            else y = wcy;
          }
          cr = 1.0; cg = 0.78; cb = 0.5;
        }
        z = NEARZ - 0.02;
      } else {
        // faint dust in the air of the room
        x = (rnd() * 2 - 1) * RX;
        y = (rnd() * 2 - 1) * RY;
        z = FARZ + rnd() * (NEARZ - FARZ);
        cr = 0.5; cg = 0.62; cb = 0.85;
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

// Cuts a running flight straight to the hero (scroll past the threshold, or the
// skip button). Everything it touches is module state, so both callers share it.
function cutFlightToHero() {
  if (!intro.active) return;
  introTl?.kill();
  intro.active = false;
  intro.amt = 0;
  intro.u = 1;
  particleUniforms.uSize.value = BASE_SIZE;
  PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT);
  document.documentElement.classList.remove("intro-flying");
  emitArrive();
  markWorldReady();
}

// The camera's continuous zoom through the static world. 9 control points -> 8
// segments; scene beats land on the EVEN indices (u = 0,.25,.5,.75,1) and the
// ODD indices shape the curve. The path: take in the whole solar system (Saturn
// included) -> rise UP and OVER Saturn's horizon -> descend to the canyon mouth
// of the city boulevard -> fly DOWN the boulevard between the towers -> out the
// far end, along the lamp-lit street to the small house -> up to its lit window
// -> through, into the room -> swing to the front of the TZ -> hero. The camera
// only ever moves forward / around.
const CAM_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 1.6, 52), // 0 solar system (Saturn in view)
    new THREE.Vector3(3.5, 3.2, 41), // 1 climb toward Saturn
    new THREE.Vector3(5.0, 5.0, 34), // 2 OVER Saturn's horizon
    new THREE.Vector3(0.8, 1.9, 30), // 3 descend, lining up on the boulevard
    new THREE.Vector3(0, -1.3, 26), // 4 canyon mouth, low: rooflines vs. sky
    new THREE.Vector3(0, -0.9, 15.2), // 5 down the boulevard, out the far end
    new THREE.Vector3(0, 0.15, 7), // 6 up to the lit window (== orbit start)
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
    new THREE.Vector3(0, -0.9, 21), // 3 down into the streets ahead
    new THREE.Vector3(0, 0.2, 12), // 4 slightly UP the boulevard: skyline vs. sky
    new THREE.Vector3(0, 0.0, 4.6), // 5 the lit window of the house
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
  (window as unknown as { __geo: typeof PARTICLE_GEO }).__geo = PARTICLE_GEO;
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

    // Returning visitors / reduced motion: no flight, jump straight to the hero.
    const jumpToHero = () => {
      intro.active = false;
      intro.amt = 0;
      intro.u = 1;
      particleUniforms.uU.value = 1;
      particleUniforms.uSize.value = BASE_SIZE;
      document.documentElement.classList.remove("intro-flying");
      PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT);
    };

    // The cinematic camera flight. Re-runnable: the replay button calls it again.
    const startFlight = () => {
      introTl?.kill();
      intro.u = 0;
      intro.amt = 1;
      intro.active = true;
      document.documentElement.classList.add("intro-flying");
      emitFlightStart();
      audio.flight();
      particleUniforms.uSize.value = LOW_END ? 30 : 42;
      PARTICLE_GEO.setDrawRange(0, COUNT);
      introTl = gsap.timeline({
        onComplete: () => {
          intro.active = false;
          document.documentElement.classList.remove("intro-flying");
          emitArrive();
          audio.arrival();
        },
      });

      // ONE even, gently-eased glide — the camera accelerates away from a scene
      // and eases into the next at a steady pace, only ever slowing at a scene,
      // never stopping, never lurching. All motion is the camera; world is rigid.
      // Segment durations live in FLIGHT_SEGS (shared with the caption overlay).
      introTl.to(
        intro,
        {
          keyframes: [
            { u: 0.25, duration: FLIGHT_SEGS[0], ease: "sine.inOut" }, // system -> over Saturn
            { u: 0.5, duration: FLIGHT_SEGS[1], ease: "sine.inOut" }, // -> city
            { u: 0.75, duration: FLIGHT_SEGS[2], ease: "sine.inOut" }, // -> house window
            { u: 1, duration: FLIGHT_SEGS[3], ease: "sine.inOut" }, // through, orbit, hero
          ],
        },
        0,
      );

      // Swoosh at each segment's MIDPOINT, where the camera moves fastest.
      introTl.add(() => audio.transition(), FLIGHT_SEGS[0] / 2);
      introTl.add(() => audio.transition(), FLIGHT_SEGS[0] + FLIGHT_SEGS[1] / 2);
      introTl.add(
        () => audio.transition(),
        FLIGHT_SEGS[0] + FLIGHT_SEGS[1] + FLIGHT_SEGS[2] / 2,
      );

      // Resolve: crossfade to the scroll forms, ease the pixels back to the hero
      // size, then drop the (already faded) world particles for the scroll phase.
      introTl
        .to(intro, { amt: 0, duration: 1.2, ease: "power2.in" }, FLIGHT_TOTAL - 0.8)
        .to(
          particleUniforms.uSize,
          { value: BASE_SIZE, duration: 2.4, ease: "power2.inOut" },
          FLIGHT_TOTAL - 3.0,
        );
      introTl.add(() => PARTICLE_GEO.setDrawRange(0, SCROLL_COUNT), FLIGHT_TOTAL + 0.1);
    };

    const unsubIntro = onIntroDone(() => {
      if (reduce || skipFlight()) {
        jumpToHero();
        markWorldReady();
        return;
      }
      startFlight();
    });
    const unsubReplay = onReplay(() => startFlight());
    const unsubSkip = onFlightSkip(cutFlightToHero);

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
      unsubIntro();
      unsubReplay();
      unsubSkip();
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
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __mat: THREE.ShaderMaterial }).__mat = mat;
    }
    const cam = state.camera;
    const d = Math.min(delta, 0.05);
    mat.uniforms.uTime.value += d;

    // R3F clones the `uniforms` prop into the material — the module-level
    // particleUniforms the gsap tweens (flight pixel size) write to is NOT the
    // object the shader reads. Sync the externally-animated scalars here every
    // frame; everything else is either static or set via mat below.
    mat.uniforms.uSize.value = particleUniforms.uSize.value;

    // Scrolling cuts the cinematic short and hands straight to scroll.
    if (intro.active && scrollProgress.progress > 0.02) {
      cutFlightToHero();
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
          cam.position.set(R * Math.sin(ang), 0.15 * (1 - o), R * Math.cos(ang));
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
      {/* Matches --color-void. */}
      <color attach="background" args={["#070a12"]} />
      <PointsField />
      <SignalReady />
      <PostFX low={LOW_END} />
    </Canvas>
  );
}
