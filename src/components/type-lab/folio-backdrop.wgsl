// Studio wall behind the sheet: lit from the key light's side and carrying the sheet's shadow.
// The shadow mask stores coverage in R and caster distance in G; the penumbra widens with distance.
struct Backdrop { color: vec4f, view: vec4f };
@group(0) @binding(0) var<uniform> background: Backdrop;
@group(0) @binding(1) var shadow: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
struct Out { @builtin(position) position: vec4f, @location(0) ndc: vec2f };

@vertex fn vs_main(@builtin(vertex_index) vi: u32) -> Out {
  let p = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  var o: Out;
  o.position = vec4f(p[vi], 0.0, 1.0);
  o.ndc = p[vi];
  return o;
}
fn softClip(c: vec3f) -> vec3f {
  let knee = 0.8;
  return select(c, knee + (1.0 - knee) * (1.0 - exp(-(c - knee) / (1.0 - knee))), c > vec3f(knee));
}

@fragment fn fs_main(i: Out) -> @location(0) vec4f {
  let aspect = background.view.x;
  let uv = vec2f(i.ndc.x * 0.5 + 0.5, 0.5 - i.ndc.y * 0.5);
  let taps = array<vec2f, 16>(
    vec2f(-0.94201624, -0.39906216), vec2f(0.94558609, -0.76890725), vec2f(-0.094184101, -0.92938870), vec2f(0.34495938, 0.29387760),
    vec2f(-0.91588581, 0.45771432), vec2f(-0.81544232, -0.87912464), vec2f(-0.38277543, 0.27676845), vec2f(0.97484398, 0.75648379),
    vec2f(0.44323325, -0.97511554), vec2f(0.53742981, -0.47373420), vec2f(-0.26496911, -0.41893023), vec2f(0.79197514, 0.19090188),
    vec2f(-0.24188840, 0.99706507), vec2f(-0.81409955, 0.91437590), vec2f(0.19984126, 0.78641367), vec2f(0.14383161, -0.14100790));
  // Per-pixel disc rotation trades banding for fine, static grain.
  let angle = 6.2831853 * fract(52.9829189 * fract(dot(i.position.xy, vec2f(0.06711056, 0.00583715))));
  let spin = mat2x2f(cos(angle), sin(angle), -sin(angle), cos(angle));
  let axis = vec2f(1.0 / aspect, 1.0);
  var reach = 0.0;
  var hits = 0.0;
  for (var k = 0u; k < 16u; k++) {
    let s = textureSample(shadow, linearSampler, uv + (spin * taps[k]) * axis * 0.035);
    reach += s.g * s.r;
    hits += s.r;
  }
  let penumbra = 0.005 + 0.03 * (reach / max(hits, 0.001));
  var cover = 0.0;
  for (var k = 0u; k < 16u; k++) {
    cover += textureSample(shadow, linearSampler, uv + (spin * taps[k]) * axis * penumbra).r;
  }
  cover /= 16.0;

  let p = vec2f(i.ndc.x * aspect, i.ndc.y);
  let centre = vec2f(background.view.z * aspect, background.view.w);
  let glow = exp(-dot(p - centre, p - centre) * 0.42);
  let base = pow(background.color.xyz, vec3f(2.2));
  var wall = base * (0.76 + 0.24 * glow + 0.05 * i.ndc.y) + glow * 0.0025;
  wall *= 1.0 - background.view.y * cover;
  wall *= 1.0 - 0.10 * smoothstep(0.7, 1.9, length(i.ndc));
  return vec4f(pow(softClip(wall), vec3f(1.0 / 2.2)), 1.0);
}
