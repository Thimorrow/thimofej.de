export type Backend = "vgpu" | "three";

export type ParticleFrame = {
  time: number;
  spread: number;
  pointer: [number, number];
  pointerActive: number;
};

export type ParticleRenderer = {
  resize(width: number, height: number, dpr: number): void;
  render(frame: ParticleFrame): void;
  dispose(): void;
};

/** Both renderers get exactly the same seeded cloud, including depth and color. */
export function createParticleData(count: number) {
  const data = new Float32Array(count * 4);
  let seed = 260123;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const part = random();
    let x: number;
    let y: number;
    if (part < 0.25) {
      x = -0.9 + (random() - 0.5) * 0.32;
      y = (random() - 0.5) * 2.1;
    } else if (part < 0.43) {
      x = -0.9 + (random() - 0.5) * 1.5;
      y = 0.92 + (random() - 0.5) * 0.28;
    } else if (part < 0.59) {
      x = 0.9 + (random() - 0.5) * 1.5;
      y = 0.92 + (random() - 0.5) * 0.28;
    } else if (part < 0.75) {
      x = 0.9 + (random() - 0.5) * 1.5;
      y = -0.92 + (random() - 0.5) * 0.28;
    } else {
      const diagonal = random();
      x = 1.58 - diagonal * 1.36 + (random() - 0.5) * 0.27;
      y = 0.92 - diagonal * 1.84 + (random() - 0.5) * 0.15;
    }
    data.set([x * 1.2, y * 1.2, (random() - 0.5) * 0.55, random()], i * 4);
  }
  return data;
}

// Same motion and palette as the WGSL shader; this is a small comparison
// scene, not the homepage's flight, bloom chain, or a full-site benchmark.
export const VERTEX_SHADER = /* glsl */ `
attribute float seed;
uniform float uTime;
uniform float uSpread;
uniform vec3 uPointer;
uniform float uDpr;
uniform float uAspect;
varying vec3 vColor;
varying float vStrength;
void main() {
  vec3 p = position;
  float phase = seed * 6.283185;
  p += vec3(sin(phase * 7.0), cos(phase * 11.0), sin(phase * 13.0)) * uSpread * 1.65;
  p += vec3(sin(uTime * 0.8 + p.y * 3.0 + phase), cos(uTime * 0.6 + p.x * 2.0 + phase), sin(uTime * 0.5 + phase)) * 0.035;
  float angle = sin(uTime * 0.23) * 0.22;
  p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
  vec2 away = p.xy - uPointer.xy;
  float influence = exp(-dot(away, away) * 2.2) * uPointer.z;
  p.xy += away * influence * 1.25;
  p.z += influence * 0.65;
  float depth = 7.2 - p.z;
  gl_Position = vec4(p.x * 2.414214 / uAspect, p.y * 2.414214, 0.0, depth);
  gl_PointSize = (3.2 + seed * 1.8) * uDpr * 7.2 / depth;
  vColor = mix(vec3(0.08, 0.65, 0.86), vec3(0.78, 0.92, 1.0), seed);
  if (seed > 0.94) vColor = vec3(1.0, 0.62, 0.28);
  vStrength = 0.45 + 0.3 * sin(phase + uTime * 0.7);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vStrength;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = dot(uv, uv);
  if (d > 1.0) discard;
  float glow = exp(-d * 5.0) * 0.35 + exp(-d * 32.0) * 0.65;
  gl_FragColor = vec4(vColor, glow * vStrength);
}
`;
