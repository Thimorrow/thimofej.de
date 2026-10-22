import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareShader } from '@vgpu/wgsl/prepare';
import { createParticleWorld, packParticleWorld } from '../src/components/canvas/particle-world.ts';

function random() {
  let state = 8239;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const shader = name => prepareShader(readFileSync(new URL(`../src/components/canvas/${name}.wgsl`, import.meta.url), 'utf8'));

test('both quality levels retain every flight scene and only morph the hero particles', () => {
  for (const count of [34000, 170000]) {
    const world = createParticleWorld(count, random());
    assert.equal(world.heroCount, count * 0.24);
    const reveals = new Map();
    for (const value of world.reveal) {
      const scene = Math.round(value * 100);
      reveals.set(scene, (reveals.get(scene) ?? 0) + 1);
    }
    assert.deepEqual(reveals, new Map([[56, count * 0.24], [-100, count * 0.26], [28, count * 0.3], [50, count * 0.2]]));
    assert.ok(world.position.every(Number.isFinite));
    for (const form of world.forms) {
      assert.ok(form.every(Number.isFinite));
      assert.deepEqual(form.subarray(world.heroCount * 3), world.position.subarray(world.heroCount * 3));
    }
    assert.ok(world.seed.every(value => value >= 0 && value < 1));
    const hero = world.position.subarray(0, world.heroCount * 3);
    let front = false;
    let back = false;
    for (let i = 2; i < hero.length; i += 3) {
      front ||= hero[i] > 0.25;
      back ||= hero[i] < -0.25;
    }
    assert.ok(front && back, 'the orbit must retain real depth in the initials');
  }
});

test('uploaded positions, chapter shapes, scene timing and colors match the actual WGSL memory layout', () => {
  const world = createParticleWorld(1000, random());
  const packed = packParticleWorld(world);
  const layout = shader('world').reflection.bindings.find(binding => binding.name === 'particles').layout;
  assert.equal(packed.byteLength, world.count * layout.stride);
  const bytes = new DataView(packed.buffer);
  const member = name => layout.element.members.find(member => member.name === name).offset;
  for (const index of [0, world.heroCount - 1, world.heroCount, 500, world.count - 1]) {
    const offset = index * layout.stride;
    for (const [name, data] of [['home', world.position], ['work', world.forms[0]], ['elsewhere', world.forms[1]], ['contact', world.forms[2]], ['colorSeed', world.colors]]) {
      for (let axis = 0; axis < 3; axis++) {
        assert.equal(bytes.getFloat32(offset + member(name) + axis * 4, true), data[index * 3 + axis]);
      }
    }
    assert.equal(bytes.getFloat32(offset + member('home') + 12, true), world.reveal[index]);
    assert.equal(bytes.getFloat32(offset + member('colorSeed') + 12, true), world.seed[index]);
  }
});

test('the world and every post-processing pass prepare as WebGPU shaders', () => {
  for (const name of ['world', 'bloom', 'present']) {
    const prepared = shader(name);
    assert.ok(prepared.reflection.entryPoints.some(entry => entry.stage === 'fragment'));
    if (name === 'world') assert.ok(prepared.reflection.entryPoints.some(entry => entry.stage === 'vertex'));
  }
});
