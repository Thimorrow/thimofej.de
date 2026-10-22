@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> blurParams: vec4f;

fn sampleBright(uv: vec2f) -> vec3f {
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;
  let brightness = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  let threshold = select(1.0, smoothstep(0.7, 0.88, brightness), blurParams.z > 0.5);
  return color * threshold;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var color = sampleBright(uv) * 0.227027;
  color += sampleBright(uv + blurParams.xy * 1.384615) * 0.316216;
  color += sampleBright(uv - blurParams.xy * 1.384615) * 0.316216;
  color += sampleBright(uv + blurParams.xy * 3.230769) * 0.070270;
  color += sampleBright(uv - blurParams.xy * 3.230769) * 0.070270;
  return vec4f(color, 1.0);
}
