struct Settings {
  view: vec4f,
  mouse: vec4f,
  motion: vec4f,
};
@group(0) @binding(0) var<storage, read> points: array<vec4f>;
@group(0) @binding(1) var<uniform> settings: Settings;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec3f,
  @location(2) strength: f32,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> VertexOutput {
  let corners = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
  let point = points[instance];
  let seed = point.w;
  let phase = seed * 6.283185;
  let time = settings.motion.x;
  var p = point.xyz;
  p += vec3f(sin(phase * 7.0), cos(phase * 11.0), sin(phase * 13.0)) * settings.mouse.w * 1.65;
  p += vec3f(sin(time * 0.8 + p.y * 3.0 + phase), cos(time * 0.6 + p.x * 2.0 + phase), sin(time * 0.5 + phase)) * 0.035;
  let angle = sin(time * 0.23) * 0.22;
  p = vec3f(cos(angle) * p.x + sin(angle) * p.z, p.y, -sin(angle) * p.x + cos(angle) * p.z);
  let away = p.xy - settings.mouse.xy;
  let influence = exp(-dot(away, away) * 2.2) * settings.mouse.z;
  p = vec3f(p.xy + away * influence * 1.25, p.z + influence * 0.65);
  let depth = 7.2 - p.z;
  let diameter = (3.2 + seed * 1.8) * settings.view.z * 7.2 / depth;
  let offset = corners[vertex] * diameter / settings.view.y;
  var output: VertexOutput;
  output.position = vec4f(p.x * 2.414214 / settings.view.x + offset.x * depth / settings.view.x, p.y * 2.414214 + offset.y * depth, 0.5 * depth, depth);
  output.uv = corners[vertex];
  output.color = mix(vec3f(0.08, 0.65, 0.86), vec3f(0.78, 0.92, 1.0), seed);
  if (seed > 0.94) { output.color = vec3f(1.0, 0.62, 0.28); }
  output.strength = 0.45 + 0.3 * sin(phase + time * 0.7);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let d = dot(input.uv, input.uv);
  if (d > 1.0) { discard; }
  let glow = exp(-d * 5.0) * 0.35 + exp(-d * 32.0) * 0.65;
  return vec4f(input.color, glow * input.strength);
}
