struct Settings {
  view: vec4f,
  motion: vec4f,
  shape: vec4f,
  ink: vec4f,
  paper: vec4f,
};
@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var letters: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
struct Out {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) world: vec3f,
  @location(2) layer: f32,
};
fn rotY(p: vec3f, a: f32) -> vec3f { return vec3f(cos(a)*p.x + sin(a)*p.z, p.y, -sin(a)*p.x + cos(a)*p.z); }
fn rotX(p: vec3f, a: f32) -> vec3f { return vec3f(p.x, cos(a)*p.y - sin(a)*p.z, sin(a)*p.y + cos(a)*p.z); }
@vertex fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) instance: u32) -> Out {
  let corners = array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
  let cell = vi / 6u;
  let uv = (vec2f(f32(cell % 96u), f32(cell / 96u)) + corners[vi % 6u]) / vec2f(96,12);
  let mode = settings.view.z;
  let t = settings.motion.x;
  let intro = settings.motion.w;
  let depth = settings.shape.x;
  let bend = settings.shape.y;
  let seed = settings.shape.w;
  let layer = f32(instance);
  var tex = uv;
  var p = vec3f(0);
  if (mode < 0.5) {
    let x = (uv.x - 0.5) * 8.4;
    let y = (0.5 - uv.y) * 3.4;
    let fold = sin(t * 0.65 + seed) * 0.5 + 0.5;
    let angle = (0.04 + fold * 1.1) * bend + (1.0-intro)*1.3;
    let section = floor((x + 4.2) / 1.4);
    let localX = x + 4.2 - section * 1.4;
    let odd = select(1.0,-1.0,u32(section)%2u == 1u);
    let z = select(localX, 1.4-localX, odd < 0.0) * sin(angle);
    p = vec3f((section*1.4 + localX)*cos(angle) - 4.2*cos(angle), y, z*depth*2.0);
    p.y += sin(uv.x*3.14159) * sin(t*0.5)*bend*0.25;
    p = rotY(p, -0.18 + sin(t*0.25)*0.14);
    p = rotX(p, -0.12);
  } else if (mode < 1.5) {
    let angle = uv.x * 6.283185 + t*0.32 + layer*0.65 + seed;
    let radius = 2.5 + depth * 0.35;
    p = vec3f(sin(angle)*radius, (0.5-uv.y)*1.65 + (layer-1.0)*1.12, cos(angle)*radius);
    p.y += sin(angle*2.0 + layer)*bend*0.3;
    p = rotX(p, 0.24 + (layer-1.0)*bend*0.26 + (1.0-intro)*0.8);
    p = rotY(p, -0.35);
    tex.x = uv.x*2.0;
  }
  p = rotY(p, settings.motion.y);
  p = rotX(p, settings.motion.z);
  p *= settings.shape.z;
  let camera = max(7.4, 5.3 / settings.view.x) + (1.0-intro)*3.5;
  let w = camera - p.z;
  var out: Out;
  out.position = vec4f(p.x * 1.85 / settings.view.x, p.y * 1.85, w - 0.1, w);
  out.world = p;
  out.uv = tex;
  out.layer = layer;
  return out;
}
@fragment fn fs_main(input: Out, @builtin(front_facing) front: bool) -> @location(0) vec4f {
  let mask = textureSample(letters, linearSampler, vec2f(fract(input.uv.x),input.uv.y)).r;
  if (mask < 0.12) { discard; }
  let n = normalize(cross(dpdx(input.world), dpdy(input.world)));
  let light = 0.55 + 0.45*abs(dot(n, normalize(vec3f(-0.4,0.6,1.0))));
  let layerFade = 1.0;
  var color = mix(settings.paper.xyz, settings.ink.xyz * light, layerFade);
  if (!front) { color = mix(settings.paper.xyz, settings.ink.xyz,0.45); }
  return vec4f(color, smoothstep(0.12,0.6,mask));
}
