// Folio: one printed sheet, creased like paper. The vertex stage integrates the crease angles
// along the width so every panel keeps its true length; the fragment stage is a matte paper
// material with letterpress edges, fibre grain, crease occlusion and back-lit transmission.
// settings.view.w selects the pass: 0 shades the sheet, 1 projects it onto the wall as a shadow.
struct Settings {
  view: vec4f,
  motion: vec4f,
  shape: vec4f,
  ink: vec4f,
  paper: vec4f,
  light: vec4f,
  sheet: vec4f,
  creases: array<vec4f, 8>,
};
@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var letters: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;

const COLUMNS = 512u;
const ROWS = 4u;
const STEPS = 96u;
const NEAR = 1.0;
const FAR = 30.0;

struct Out {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) world: vec3f,
  @location(2) normal: vec3f,
  @location(3) tangent: vec3f,
  @location(4) cavity: f32,
  @location(5) reach: f32,
};

fn ry(p: vec3f, a: f32) -> vec3f { return vec3f(cos(a) * p.x + sin(a) * p.z, p.y, -sin(a) * p.x + cos(a) * p.z); }
fn rx(p: vec3f, a: f32) -> vec3f { return vec3f(p.x, cos(a) * p.y - sin(a) * p.z, sin(a) * p.y + cos(a) * p.z); }

// Heading of the sheet at u: every crease adds its angle across a rounded radius.
fn foldAngle(u: f32) -> f32 {
  var a = 0.0;
  for (var i = 0u; i < 8u; i++) {
    let c = settings.creases[i];
    a += c.y * smoothstep(-1.0, 1.0, (u - c.x) / settings.sheet.z);
  }
  return a;
}
// Midpoint integration of the heading keeps panel lengths exact; the result is (x, z) in world units.
// Steps are fixed across the sheet so neighbouring vertices share their partial sums and the
// surface stays smooth; only the last partial step is evaluated at its own midpoint.
fn foldPoint(u: f32) -> vec2f {
  var p = vec2f(0.0);
  let step = 1.0 / f32(STEPS);
  let whole = floor(u * f32(STEPS));
  for (var k = 0u; k < STEPS; k++) {
    if (f32(k) >= whole) { break; }
    let a = foldAngle((f32(k) + 0.5) * step);
    p += vec2f(cos(a), sin(a)) * step;
  }
  let start = whole * step;
  let last = foldAngle((start + u) * 0.5);
  p += vec2f(cos(last), sin(last)) * (u - start);
  return p * settings.sheet.x;
}
// Signed closeness to a fold: positive where the front face sits in a valley.
fn cavity(u: f32) -> f32 {
  var c = 0.0;
  for (var i = 0u; i < 8u; i++) {
    let k = settings.creases[i];
    let d = (u - k.x) / 0.045;
    c += k.y * exp(-d * d);
  }
  return c;
}
fn project(p: vec3f) -> vec4f {
  let w = settings.view.z - p.z;
  return vec4f(p.x * settings.view.y / settings.view.x, p.y * settings.view.y, (w - NEAR) / (FAR - NEAR) * w, w);
}

@vertex fn vs_main(@builtin(vertex_index) vi: u32) -> Out {
  let corners = array<vec2f, 6>(vec2f(0, 0), vec2f(1, 0), vec2f(0, 1), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1));
  let cell = vi / 6u;
  let uv = (vec2f(f32(cell % COLUMNS), f32(cell / COLUMNS)) + corners[vi % 6u]) / vec2f(f32(COLUMNS), f32(ROWS));
  // Level the chord between both edges and centre on it, so folding never drifts the sheet.
  let end = foldPoint(1.0);
  let chord = atan2(end.y, end.x);
  let local = foldPoint(uv.x) - end * 0.5;
  let cs = cos(chord);
  let sn = sin(chord);
  let a = foldAngle(uv.x) - chord;
  var p = vec3f(local.x * cs + local.y * sn, (0.5 - uv.y) * settings.sheet.y, -local.x * sn + local.y * cs);
  var n = vec3f(-sin(a), 0.0, cos(a));
  var t = vec3f(cos(a), 0.0, sin(a));
  let yaw = settings.motion.x;
  let pitch = settings.motion.y;
  p = rx(ry(p, yaw), pitch);
  n = rx(ry(n, yaw), pitch);
  t = rx(ry(t, yaw), pitch);
  p = p * settings.shape.z + vec3f(0.0, settings.motion.z, 0.0);
  var o: Out;
  o.uv = uv;
  o.world = p;
  o.normal = n;
  o.tangent = t;
  o.cavity = cavity(uv.x);
  o.reach = 0.0;
  if (settings.view.w > 0.5) {
    // Shadow pass: slide each point along the key light until it meets the wall plane.
    let l = normalize(settings.light.xyz);
    let reach = max((p.z - settings.shape.w) / l.z, 0.1);
    p = p - l * reach;
    o.reach = reach / 8.0;
  }
  o.position = project(p);
  return o;
}

fn lattice(i: vec2f) -> f32 {
  var h = bitcast<vec2u>(vec2i(i)) * 1664525u + 1013904223u;
  h.x = h.x + h.y * 1664525u;
  h.y = h.y + h.x * 1664525u;
  h = h ^ (h >> vec2u(16u));
  h.x = h.x + h.y * 1664525u;
  h.y = h.y + h.x * 1664525u;
  h = h ^ (h >> vec2u(16u));
  return f32(h.x >> 8u) / 16777216.0;
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(lattice(i), lattice(i + vec2f(1, 0)), u.x), mix(lattice(i + vec2f(0, 1)), lattice(i + vec2f(1, 1)), u.x), u.y);
}
fn softClip(c: vec3f) -> vec3f {
  let knee = 0.8;
  return select(c, knee + (1.0 - knee) * (1.0 - exp(-(c - knee) / (1.0 - knee))), c > vec3f(knee));
}

@fragment fn fs_main(i: Out) -> @location(0) vec4f {
  if (settings.view.w > 0.5) { return vec4f(1.0, i.reach, 0.0, 1.0); }
  let texel = 1.0 / vec2f(textureDimensions(letters));
  let spread = texel * 3.0;
  let m = textureSample(letters, linearSampler, i.uv).r;
  let mx = textureSample(letters, linearSampler, i.uv + vec2f(spread.x, 0.0)).r - textureSample(letters, linearSampler, i.uv - vec2f(spread.x, 0.0)).r;
  let my = textureSample(letters, linearSampler, i.uv + vec2f(0.0, spread.y)).r - textureSample(letters, linearSampler, i.uv - vec2f(0.0, spread.y)).r;
  let edge = max(fwidth(m) * 0.7, 0.004);
  let cover = smoothstep(0.5 - edge, 0.5 + edge, m);

  var n = normalize(i.normal);
  let tu = normalize(i.tangent);
  let tv = normalize(cross(tu, n));
  let v = normalize(vec3f(0.0, 0.0, settings.view.z) - i.world);
  let front = dot(n, v) >= 0.0;
  if (!front) { n = -n; }

  // Paper: fine fibre streaks along the grain and a slow mottle, in tone and in relief.
  let fibre = vnoise(i.uv * vec2f(700.0, 2400.0));
  let fibreAcross = vnoise(i.uv * vec2f(2400.0, 700.0) + 17.0);
  let mottle = vnoise(i.uv * vec2f(13.0, 5.5)) * 0.65 + vnoise(i.uv * vec2f(29.0, 12.0) + 5.0) * 0.35;
  let paperLin = pow(settings.paper.xyz, vec3f(2.2)) + 0.004;
  let inkLin = pow(settings.ink.xyz, vec3f(2.2));
  let paperAlbedo = paperLin * (1.0 + (fibre - 0.5) * 0.05 + (mottle - 0.5) * 0.035);
  // The back shows the print through the sheet, mirrored, as thin paper does.
  let showThrough = 0.05 + settings.sheet.w * 0.12;
  let inkAmount = select(cover * showThrough, cover, front);
  let albedo = mix(paperAlbedo, inkLin, inkAmount);

  // Letterpress: the ink is pressed into the sheet, so letter edges tilt and catch the key light.
  let press = select(0.0, 0.012, front);
  let relief = tu * (mx / (2.0 * spread.x) / settings.sheet.x) + tv * (my / (2.0 * spread.y) / settings.sheet.y);
  n = normalize(n + relief * press + (tu * (fibreAcross - 0.5) + tv * (fibre - 0.5)) * 0.04);

  let l = normalize(settings.light.xyz);
  let key = vec3f(1.0, 0.965, 0.92) * 0.92;
  let nl = dot(n, l);
  let diffuse = pow(saturate((nl + 0.22) / 1.22), 1.15);
  let hemi = mix(vec3f(1.0, 0.93, 0.85) * 0.17, vec3f(0.80, 0.86, 1.0) * 0.30, n.y * 0.5 + 0.5);
  let occlusion = 1.0 - saturate(select(-i.cavity, i.cavity, front) * 0.42);
  let fill = saturate(dot(n, normalize(vec3f(0.7, 0.1, 0.6)))) * 0.10 * vec3f(0.9, 0.95, 1.0);
  let h = normalize(l + v);
  let nh = saturate(dot(n, h));
  let nv = max(dot(n, v), 0.001);
  let rough = mix(settings.light.w + 0.2, settings.light.w + 0.08, inkAmount);
  let a2 = pow(rough, 4.0);
  let dn = nh * nh * (a2 - 1.0) + 1.0;
  let d = a2 / (3.14159 * dn * dn);
  let f = 0.04 + 0.96 * pow(1.0 - saturate(dot(h, v)), 5.0);
  let sheen = d * f / (4.0 * max(nv, 0.05)) * saturate(nl) * 0.5;
  let rim = pow(1.0 - nv, 3.0) * saturate(dot(n, normalize(vec3f(0.5, 0.35, -0.8)))) * 0.12;
  // Light from behind glows through the paper; the print blocks most of it.
  let transmit = pow(saturate(dot(-n, l)), 1.5) * settings.sheet.w * 0.42 * (1.0 - cover * 0.85) * occlusion;
  var color = albedo * (hemi * occlusion + key * diffuse * (0.55 + 0.45 * occlusion) + fill);
  color += key * sheen + vec3f(0.85, 0.9, 1.0) * rim + paperAlbedo * key * transmit;
  return vec4f(pow(softClip(color), vec3f(1.0 / 2.2)), 1.0);
}
