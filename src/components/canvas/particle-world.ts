export type ParticleWorld = {
  count: number;
  heroCount: number;
  position: Float32Array;
  forms: [Float32Array, Float32Array, Float32Array];
  colors: Float32Array;
  seed: Float32Array;
  reveal: Float32Array;
};

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
export function createParticleWorld(count: number, rnd: () => number = Math.random): ParticleWorld {
  const N_TZ = Math.floor(count * 0.24);
  const N_SOLAR = Math.floor(count * 0.16);
  const N_SATURN = Math.floor(count * 0.1);
  const N_CITY = Math.floor(count * 0.3);
  const pos = new Float32Array(count * 3);
  const f1 = new Float32Array(count * 3); // gear (Work: bauen)
  const f2 = new Float32Array(count * 3); // arrow up (Life: das bessere Ich)
  const f3 = new Float32Array(count * 3); // cross (Likes: Glaube zuerst)
  const f4 = new Float32Array(count * 3); // page with lines (Writing)
  const f5 = new Float32Array(count * 3); // envelope (Contact: Postfach offen)
  const colors = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const reveal = new Float32Array(count);

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

  for (let i = 0; i < count; i++) {
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

  // The live chapters are initials, work, elsewhere and contact. The old
  // arrow and cross are intentionally not exposed as active scroll forms.
  return { count, heroCount: N_TZ, position: pos, forms: [f1, f4, f5], colors, seed, reveal };
}

/** Interleaved storage layout shared with the WGSL Particle struct (80 bytes). */
export function packParticleWorld(world: ParticleWorld) {
  const packed = new Float32Array(world.count * 20);
  for (let i = 0; i < world.count; i++) {
    const source = i * 3;
    const offset = i * 20;
    for (let axis = 0; axis < 3; axis++) {
      packed[offset + axis] = world.position[source + axis];
      packed[offset + 4 + axis] = world.forms[0][source + axis];
      packed[offset + 8 + axis] = world.forms[1][source + axis];
      packed[offset + 12 + axis] = world.forms[2][source + axis];
      packed[offset + 16 + axis] = world.colors[source + axis];
    }
    packed[offset + 3] = world.reveal[i];
    packed[offset + 19] = world.seed[i];
  }
  return packed;
}
