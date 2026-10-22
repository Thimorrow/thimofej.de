struct Particle {
  home: vec4f,
  work: vec4f,
  elsewhere: vec4f,
  contact: vec4f,
  colorSeed: vec4f,
};
struct Scene {
  model: mat4x4f,
  view: mat4x4f,
  projection: mat4x4f,
  animation: vec4f,
  mouse: vec4f,
  style: vec4f,
  colorA: vec4f,
  colorB: vec4f,
};
@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> scene: Scene;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec3f,
  @location(2) alpha: f32,
};
fn weight(morph: f32, chapter: f32) -> f32 {
  return max(0.0, 1.0 - abs(morph - chapter));
}

@vertex
fn vs_main(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> VertexOutput {
  let corners = array<vec2f, 6>(vec2f(-0.5, -0.5), vec2f(0.5, -0.5), vec2f(-0.5, 0.5), vec2f(-0.5, 0.5), vec2f(0.5, -0.5), vec2f(0.5, 0.5));
  let particle = particles[instance];
  let time = scene.animation.x;
  let morph = scene.animation.y;
  let intro = scene.animation.z;
  let flight = scene.animation.w;
  let seed = particle.colorSeed.w;
  let reveal = particle.home.w;
  let scroll = particle.home.xyz * weight(morph, 0.0)
    + particle.work.xyz * weight(morph, 1.0)
    + particle.elsewhere.xyz * weight(morph, 2.0)
    + particle.contact.xyz * (weight(morph, 3.0) + weight(morph, 4.0) + weight(morph, 5.0));
  var p = mix(scroll, particle.home.xyz, intro);
  let crisp = 1.0 - smoothstep(0.06, 0.34, abs(morph - floor(morph + 0.5)));
  let drift = (1.0 - crisp) * (1.0 - intro);
  p += drift * 0.06 * vec3f(sin(time * 0.5 + seed * 6.2831), cos(time * 0.43 + seed * 4.7), sin(time * 0.31 + seed * 3.3));
  var world = scene.model * vec4f(p, 1.0);
  let away = world.xy - scene.mouse.xy;
  let influence = scene.mouse.w * (1.0 - smoothstep(0.0, 0.5, length(away))) * (1.0 - intro);
  world = vec4f(world.xy + normalize(away + vec2f(0.0001)) * influence * 0.16, world.zw);
  let view = scene.view * world;
  var clip = scene.projection * view;
  // The preserved camera uses OpenGL's [-w,w] depth; WebGPU uses [0,w].
  clip.z = (clip.z + clip.w) * 0.5;
  let diameter = scene.style.x / max(0.1, -view.z);
  let uv = corners[vertex];
  clip = vec4f(clip.xy + uv * diameter * 2.0 / scene.style.zw * clip.w, clip.zw);
  var visible = smoothstep(reveal, reveal + 0.18, flight);
  if (reveal < 0.4) { visible *= 1.0 - smoothstep(0.74, 0.82, flight); }
  else if (reveal < 0.55) { visible *= 1.0 - smoothstep(0.94, 1.0, flight); }
  visible = mix(1.0, visible, intro);
  var output: VertexOutput;
  output.position = clip;
  output.uv = uv;
  let heroColor = mix(scene.colorA.rgb, scene.colorB.rgb, smoothstep(0.45, 1.0, seed));
  output.color = mix(heroColor, particle.colorSeed.rgb, intro);
  output.alpha = (0.5 + 0.5 * sin(time * 1.5 + seed * 6.2831)) * visible;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let distance = length(input.uv);
  if (distance > 0.5) { discard; }
  let alpha = (1.0 - smoothstep(0.16, 0.5, distance)) * scene.style.y * input.alpha;
  return vec4f(input.color, alpha);
}
