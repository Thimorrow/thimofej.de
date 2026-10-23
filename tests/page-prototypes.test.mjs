import test from 'node:test';
import assert from 'node:assert/strict';
import { printDefaults, printRows, validPrintConfig } from '../src/components/orbit-preview/print-config.ts';
import { unfoldProgress, unfoldTone } from '../src/components/type-lab/unfold-motion.ts';
import { portraitReveal } from '../src/components/orbit-preview/portrait-motion.ts';
import { readFileSync } from 'node:fs';
import { prepareShader } from '@vgpu/wgsl/prepare';

test('a saved print reproduces every row; different seeds create different compositions',()=>{
  const saved=JSON.parse(JSON.stringify(printDefaults));
  assert.deepEqual(printRows(saved.seed),printRows(printDefaults.seed));
  assert.notDeepEqual(printRows(0),printRows(1));
  for(const seed of [0,1,241023,4294967295]) {
    const rows=printRows(seed);
    assert.equal(rows.length,9);
    assert.ok(rows.every(row=>Number.isFinite(row.offset)&&Math.abs(row.offset)<=11&&row.stretch>=.8&&row.stretch<=1.25));
  }
});
test('saved layout config accepts control boundaries and rejects malformed or incomplete values',()=>{
  assert.ok(validPrintConfig(printDefaults));
  assert.ok(validPrintConfig({seed:0,typeScale:.8,space:.8,spread:0,motion:0}));
  assert.ok(validPrintConfig({seed:4294967295,typeScale:1.1,space:1.3,spread:1,motion:1.5}));
  for(const value of [null,{}, {...printDefaults,seed:-1},{...printDefaults,seed:.5},{...printDefaults,motion:NaN},{...printDefaults,typeScale:10},{...printDefaults,space:'1'},{...printDefaults,extra:true}]) assert.equal(validPrintConfig(value),false);
});

test('the scroll story has a stable reading interval and reverses without state',()=>{
  for(const viewport of [640,844,1080]) {
    assert.equal(unfoldProgress(-10,viewport),0);
    assert.equal(unfoldProgress(0,viewport),0);
    assert.equal(unfoldProgress(viewport*1.1,viewport),1);
    assert.equal(unfoldProgress(viewport*1.5,viewport),1);
    assert.equal(unfoldProgress(viewport*2.6,viewport),2);
    const forward=Array.from({length:301},(_,i)=>unfoldProgress(i*viewport/100,viewport));
    const reverse=Array.from({length:301},(_,i)=>unfoldProgress((300-i)*viewport/100,viewport)).reverse();
    assert.deepEqual(forward,reverse);
    assert.ok(forward.every((value,i)=>Number.isFinite(value)&&value>=0&&value<=2&&(!i||value>=forward[i-1])));
    assert.ok(forward.every((value,i)=>!i||Math.abs(value-forward[i-1])<.02));
  }
  assert.equal(unfoldTone(0),0);
  assert.equal(unfoldTone(1),1);
  assert.equal(unfoldTone(2),1);
});

test('the shared GPU shader exposes the separate identity texture and complete presentation controls',()=>{
  const shader=prepareShader(readFileSync(new URL('../src/components/type-lab/orbit.wgsl',import.meta.url),'utf8'));
  assert.ok(shader.reflection.entryPoints.some(entry=>entry.stage==='vertex'));
  assert.ok(shader.reflection.entryPoints.some(entry=>entry.stage==='fragment'));
  const names=shader.reflection.bindings.map(binding=>binding.name);
  assert.ok(names.includes('letters')&&names.includes('storyLetters')&&names.includes('edges'));
  const settings=shader.reflection.bindings.find(binding=>binding.name==='settings');
  assert.ok(settings.layout.members.some(member=>member.name==='storyStyle'));
});

test('section elements wait until visible and reverse consistently without hiding anchor visits',()=>{
  for(const viewport of [640,844,1080]) {
    assert.equal(portraitReveal(viewport,viewport),0);
    assert.equal(portraitReveal(viewport*.77,viewport),0);
    assert.ok(portraitReveal(viewport*.5,viewport)>0 && portraitReveal(viewport*.5,viewport)<1);
    assert.equal(portraitReveal(viewport*.25,viewport),1);
    assert.equal(portraitReveal(0,viewport),1);
    assert.equal(portraitReveal(-viewport,viewport),1);
    const tops=Array.from({length:101},(_,i)=>(100-i)*viewport/100);
    const values=tops.map(top=>portraitReveal(top,viewport));
    assert.ok(values.every((value,i)=>value>=0&&value<=1&&(!i||value>=values[i-1])));
    assert.deepEqual([...tops].reverse().map(top=>portraitReveal(top,viewport)).reverse(),values);
  }
});

test('personal composition settles by the reading position without moving its entry earlier',()=>{
  for(const viewport of [640,844,866,1080]) {
    const reveal=top=>portraitReveal(top,viewport,.55);
    assert.equal(reveal(viewport),0);
    assert.equal(reveal(viewport*.77),0);
    assert.ok(reveal(viewport*.66)>0 && reveal(viewport*.66)<1);
    for(const position of [.55,.50,.46,.28,0,-1]) assert.equal(reveal(viewport*position),1);
    // The Academy keeps its longer build while the personal composition is complete.
    assert.ok(portraitReveal(viewport*.46,viewport)<1);
    const tops=Array.from({length:101},(_,i)=>(100-i)*viewport/100);
    const values=tops.map(reveal);
    assert.ok(values.every((value,i)=>value>=0&&value<=1&&(!i||value>=values[i-1])));
    assert.deepEqual([...tops].reverse().map(reveal).reverse(),values);
  }
});
