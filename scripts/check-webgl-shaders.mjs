import assert from 'node:assert/strict';
import { orbitVertex, orbitFragment, fullscreenVertex, backdropFragment, fieldFragment } from '../src/components/type-lab/orbit-shaders.ts';
import { WORLD_VERTEX, WORLD_FRAGMENT, FULLSCREEN_VERTEX, BLOOM_FRAGMENT, PRESENT_FRAGMENT } from '../src/components/canvas/particle-shaders.ts';

export async function checkWebGLShaders(page) {
  const programs = [
    {name: 'Orbit', vertex: orbitVertex, fragment: orbitFragment},
    {name: 'Character field', vertex: fullscreenVertex, fragment: fieldFragment},
    {name: 'Backdrop', vertex: fullscreenVertex, fragment: backdropFragment},
    {name: 'Filmflight particles', vertex: WORLD_VERTEX, fragment: WORLD_FRAGMENT},
    {name: 'Bloom', vertex: FULLSCREEN_VERTEX, fragment: BLOOM_FRAGMENT},
    {name: 'Filmflight composite', vertex: FULLSCREEN_VERTEX, fragment: PRESENT_FRAGMENT},
  ];
  const results = await page.evaluate(programs => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) throw new Error('WebGL 2 is unavailable');
    return programs.map(({name, vertex, fragment}) => {
      const program = gl.createProgram();
      const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((stage, i) => {
        const shader = gl.createShader(stage);
        gl.shaderSource(shader, '#version 300 es\n' + [vertex, fragment][i]);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        return shader;
      });
      gl.linkProgram(program);
      const errors = shaders.flatMap(shader => gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? [] : [gl.getShaderInfoLog(shader)]);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) errors.push(gl.getProgramInfoLog(program));
      for (const shader of shaders) gl.deleteShader(shader);
      gl.deleteProgram(program);
      return {name, errors};
    });
  }, programs);
  for (const result of results) assert.deepEqual(result.errors, [], result.name);
  return results.map(result => result.name);
}
