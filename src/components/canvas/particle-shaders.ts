export const WORLD_VERTEX = /* glsl */ `
precision highp float;
in vec2 position;
in vec4 home;
in vec4 work;
in vec4 elsewhere;
in vec4 contact;
in vec4 colorSeed;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec4 animation;
uniform vec4 mouse;
uniform vec4 style;
uniform vec4 colorA;
uniform vec4 colorB;
out vec2 vUv;
out vec3 vColor;
out float vAlpha;
float weight(float morph, float chapter) {
  return max(0.0, 1.0 - abs(morph - chapter));
}
void main() {
  float time = animation.x;
  float morph = animation.y;
  float intro = animation.z;
  float flight = animation.w;
  float seed = colorSeed.w;
  float reveal = home.w;
  vec3 scroll = home.xyz * weight(morph, 0.0)
    + work.xyz * weight(morph, 1.0)
    + elsewhere.xyz * weight(morph, 2.0)
    + contact.xyz * (weight(morph, 3.0) + weight(morph, 4.0) + weight(morph, 5.0));
  vec3 p = mix(scroll, home.xyz, intro);
  float crisp = 1.0 - smoothstep(0.06, 0.34, abs(morph - floor(morph + 0.5)));
  float drift = (1.0 - crisp) * (1.0 - intro);
  p += drift * 0.06 * vec3(sin(time * 0.5 + seed * 6.2831), cos(time * 0.43 + seed * 4.7), sin(time * 0.31 + seed * 3.3));
  vec4 world = uModel * vec4(p, 1.0);
  vec2 away = world.xy - mouse.xy;
  float influence = mouse.w * (1.0 - smoothstep(0.0, 0.5, length(away))) * (1.0 - intro);
  world.xy += normalize(away + vec2(0.0001)) * influence * 0.16;
  vec4 viewPosition = uView * world;
  vec4 clip = uProjection * viewPosition;
  float diameter = style.x / max(0.1, -viewPosition.z);
  clip.xy += position * diameter * 2.0 / style.zw * clip.w;
  float visible = smoothstep(reveal, reveal + 0.18, flight);
  if (reveal < 0.4) visible *= 1.0 - smoothstep(0.74, 0.82, flight);
  else if (reveal < 0.55) visible *= 1.0 - smoothstep(0.94, 1.0, flight);
  visible = mix(1.0, visible, intro);
  gl_Position = clip;
  vUv = position;
  vec3 heroColor = mix(colorA.rgb, colorB.rgb, smoothstep(0.45, 1.0, seed));
  vColor = mix(heroColor, colorSeed.rgb, intro);
  vAlpha = (0.5 + 0.5 * sin(time * 1.5 + seed * 6.2831)) * visible;
}
`;

export const WORLD_FRAGMENT = /* glsl */ `
precision highp float;
in vec2 vUv;
in vec3 vColor;
in float vAlpha;
uniform vec4 style;
out vec4 outColor;
void main() {
  float d = length(vUv);
  if (d > 0.5) discard;
  float alpha = (1.0 - smoothstep(0.16, 0.5, d)) * style.y * vAlpha;
  outColor = vec4(vColor, alpha);
}
`;

export const FULLSCREEN_VERTEX = /* glsl */ `
precision highp float;
in vec2 position;
out vec2 vUv;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vUv = position * 0.5 + 0.5;
}
`;

export const BLOOM_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D source;
uniform vec4 blurParams;
in vec2 vUv;
out vec4 outColor;
vec3 sampleBright(vec2 uv) {
  vec3 color = texture(source, uv).rgb;
  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float threshold = blurParams.z > 0.5 ? smoothstep(0.7, 0.88, brightness) : 1.0;
  return color * threshold;
}
void main() {
  vec3 color = sampleBright(vUv) * 0.227027;
  color += sampleBright(vUv + blurParams.xy * 1.384615) * 0.316216;
  color += sampleBright(vUv - blurParams.xy * 1.384615) * 0.316216;
  color += sampleBright(vUv + blurParams.xy * 3.230769) * 0.070270;
  color += sampleBright(vUv - blurParams.xy * 3.230769) * 0.070270;
  outColor = vec4(color, 1.0);
}
`;

export const PRESENT_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D source;
uniform sampler2D glow;
uniform vec4 settings;
in vec2 vUv;
out vec4 outColor;
vec3 linearToSrgb(vec3 color) {
  return mix(1.055 * pow(max(color, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, color * 12.92, lessThanEqual(color, vec3(0.0031308)));
}
void main() {
  vec3 color = texture(source, vUv).rgb;
  color += texture(glow, vUv).rgb * settings.y;
  float noise = fract(sin(dot(vUv * settings.zw, vec2(12.9898, 78.233))) * 43758.5453);
  color += (noise - 0.5) * 0.02 * sqrt(max(color, vec3(0.0)));
  float vignette = 1.0 - smoothstep(0.32 * 0.799, 0.8, distance(vUv, vec2(0.5)) * (0.62 + 0.32));
  color *= vignette;
  outColor = vec4(linearToSrgb(max(color, vec3(0.0))), 1.0);
}
`;
