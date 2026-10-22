@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var glow: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var<uniform> settings: vec4f;

fn linearToSrgb(color: vec3f) -> vec3f {
  return select(1.055 * pow(max(color, vec3f(0.0)), vec3f(1.0 / 2.4)) - 0.055, color * 12.92, color <= vec3f(0.0031308));
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;
  color += textureSampleLevel(glow, linearSampler, uv, 0.0).rgb * settings.y;
  let noise = fract(sin(dot(uv * settings.zw, vec2f(12.9898, 78.233))) * 43758.5453);
  color += (noise - 0.5) * 0.02 * sqrt(max(color, vec3f(0.0)));
  let vignette = 1.0 - smoothstep(0.32 * 0.799, 0.8, distance(uv, vec2f(0.5)) * (0.62 + 0.32));
  color *= vignette;
  return vec4f(linearToSrgb(max(color, vec3f(0.0))), 1.0);
}
