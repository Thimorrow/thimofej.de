import test from 'node:test';
import assert from 'node:assert/strict';
import { coast, follow } from '../src/components/type-lab/orbit-motion.ts';
import { glyphEdges } from '../src/components/type-lab/orbit-geometry.ts';
import { defaults, validConfig, seedPhase } from '../src/components/type-lab/config.ts';

test('inertial release travels the same distance at 30, 60 and 144 Hz',()=>{
  const run=hz=>{let velocity=1.5,distance=0;for(let i=0;i<hz;i++){const step=coast(velocity,1/hz);velocity=step.velocity;distance+=step.distance;}return distance;};
  assert.ok(Math.abs(run(30)-run(144))<1e-9);
  assert.ok(Math.abs(run(60)-run(144))<1e-9);
  assert.equal(coast(0,1).distance,0);
  assert.ok(coast(-1,1).distance<0);
  assert.equal(follow(1,2,0),1);
  assert.ok(follow(1,2,0.1)>1 && follow(1,2,0.1)<2);
});
test('extruded contours are empty for empty masks and close around a single glyph pixel',()=>{
  const blank=new Uint8ClampedArray(3*3*4);
  assert.equal(glyphEdges(blank,3,3).length,0);
  blank[(1*3+1)*4]=255;
  const edges=glyphEdges(blank,3,3);
  assert.equal(edges.length,4*6*4);
  for(let i=0;i<edges.length;i+=4){assert.ok(edges[i]>=0 && edges[i]<=1);assert.ok(edges[i+1]>=0 && edges[i+1]<=1);assert.ok(Math.abs(edges[i+2])===1);assert.ok(Number.isFinite(edges[i+3]));}
});
test('saved material settings are bounded and older snapshots remain readable',()=>{
  const config=defaults(1);assert.ok(validConfig(config));
  for(const key of ['roughness','light','thickness']) {assert.equal(validConfig({...config,[key]:Infinity}),false);assert.equal(validConfig({...config,[key]:100}),false);}
  const legacy={...config};delete legacy.roughness;delete legacy.light;delete legacy.thickness;assert.ok(validConfig(legacy));
});

test('seed transition starts at the visible phase and survives a saved config round trip',()=>{
 const before=defaults(1), start=seedPhase(before);
 const next={...before,seed:7,seedPhaseFrom:start,seedAt:4,time:4};
 assert.ok(Math.abs(seedPhase(next)-start)<1e-9);
 next.time=4.35;
 assert.equal(seedPhase(JSON.parse(JSON.stringify(next))),seedPhase(next));
 next.time=5;
 assert.ok(Math.abs(seedPhase(next)-seedPhase({...next,seedAt:undefined,seedPhaseFrom:undefined}))<1e-9);
});

const { createWave, advanceWaves, insideSculpture } = await import('../src/components/type-lab/background-wave.ts');
test('background impulses vary deterministically and expire without retained state',()=>{
 const waves=Array.from({length:4},(_,i)=>createWave(-0.8,0.2,i));
 assert.equal(new Set(waves.map(w=>w.variation)).size,4);
 assert.deepEqual(createWave(-0.8,0.2,3),waves[3]);
 assert.ok(waves.every(w=>w.variation>=0 && w.variation<1));
 assert.equal(advanceWaves(waves,4.5).length,0);
 assert.equal(advanceWaves(waves,1)[0].age,1);
 assert.equal(waves[0].age,0);
});
test('background clicks are separated from the sculpture on wide and narrow stages',()=>{
 for(const aspect of [0.6,1,2]){
  assert.equal(insideSculpture(0,0,aspect,defaults(1)),true);
  assert.equal(insideSculpture(0.95,0.95,aspect,defaults(1)),false);
 }
 assert.ok(validConfig({...defaults(1),backgroundStrength:2.2}));
 assert.equal(validConfig({...defaults(1),backgroundStrength:3.1}),false);
});

test('background controls reject malformed imports and support adjustable impulse duration',async()=>{
 const { backgroundDefaults, validBackgroundTuning }=await import('../src/components/type-lab/background-tuning.ts');
 assert.ok(validBackgroundTuning(backgroundDefaults));
 assert.ok(validConfig({...defaults(1),tuning:backgroundDefaults}));
 for(const tuning of [{rasterOpacity:NaN},{clickLifetime:0},{blur:-1},{unknown:1}]) assert.equal(validBackgroundTuning(tuning),false);
 assert.equal(advanceWaves([createWave(0,0,0)],5,8).length,1);
 assert.equal(advanceWaves([createWave(0,0,0)],5,2).length,0);
});

test('random tuning stays in valid slider ranges including boundary samples',async()=>{
 const { randomBackgroundTuning,validBackgroundTuning,backgroundControls }=await import('../src/components/type-lab/background-tuning.ts');
 for(const sample of [0,0.25,0.5,0.999999,1]){
  const values=randomBackgroundTuning(()=>sample);
  assert.ok(validBackgroundTuning(values));
  assert.equal(Object.keys(values).length,Object.keys(backgroundControls).length);
 }
 assert.notDeepEqual(randomBackgroundTuning(()=>0),randomBackgroundTuning(()=>1));
});

test('random buttons preserve the other wave and raster settings',async()=>{
 const {backgroundDefaults,backgroundControls,randomizeBackgroundGroup}=await import('../src/components/type-lab/background-tuning.ts');
 for(const group of ['ambient','click']){
  const result=randomizeBackgroundGroup(backgroundDefaults,group,()=>0.81);
  let changed=0;
  for(const [key,c] of Object.entries(backgroundControls)){
   const selected=group==='ambient' ? c.group==='Ruhige Welle' : ['Klickwelle','Gerichteter Nachimpuls'].includes(c.group);
   if(!selected) assert.equal(result[key],backgroundDefaults[key]);
   else if(result[key]!==backgroundDefaults[key]) changed++;
  }
  assert.ok(changed>0);
 }
});
