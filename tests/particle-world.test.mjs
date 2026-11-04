import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticleGeometry } from '../src/components/canvas/particle-renderer.ts';
import { createParticleWorld, packParticleWorld } from '../src/components/canvas/particle-world.ts';

function random() {
  let state = 8239;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

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

test('instanced quads upload every chapter, reveal time and color without changing particle data', () => {
  const world = createParticleWorld(1000, random());
  const geometry = createParticleGeometry(world);
  const packed = packParticleWorld(world);
  assert.equal(geometry.instanceCount, world.count);
  assert.equal(geometry.getAttribute('position').count, 6);
  assert.equal(geometry.getAttribute('position').itemSize, 2);
  assert.equal(packed.byteLength, world.count * 80);
  for (const [name, data] of [['home', world.position], ['work', world.forms[0]], ['elsewhere', world.forms[1]], ['contact', world.forms[2]], ['colorSeed', world.colors]]) {
    const attribute = geometry.getAttribute(name);
    assert.equal(attribute.count, world.count);
    assert.equal(attribute.itemSize, 4);
    for (const index of [0, world.heroCount - 1, world.heroCount, 500, world.count - 1]) {
      assert.deepEqual([attribute.getX(index), attribute.getY(index), attribute.getZ(index)], Array.from(data.subarray(index * 3, index * 3 + 3)));
    }
  }
  for (const index of [0, world.heroCount, world.count - 1]) {
    assert.equal(geometry.getAttribute('home').getW(index), world.reveal[index]);
    assert.equal(geometry.getAttribute('colorSeed').getW(index), world.seed[index]);
  }
  geometry.instanceCount = world.heroCount;
  assert.equal(geometry.getAttribute('home').count, world.count, 'cutting to the hero keeps the complete replay world available');
  geometry.dispose();
});
