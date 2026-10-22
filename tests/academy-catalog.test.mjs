import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const stylesheet = await readFile(new URL('../src/components/academy/catalog/catalog.css', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../src/components/academy/catalog/manifest.json', import.meta.url), 'utf8'));

test('catalog snapshot includes complete runtime tokens, both themes, and the required source modules', () => {
  // The source also mentions @theme in its opening comment; truncating there silently drops the runtime tokens.
  for (const token of ['ink', 'page', 'font-sans', 'radius-pill', 'touch-min-target']) assert.match(stylesheet, new RegExp(`--academy-${token}:`));
  assert.match(stylesheet, /&\[data-theme="dark"\]\s*\{/);
  assert.doesNotMatch(stylesheet, /^\s*@theme\s+inline/m);
  for (const name of ['mission-card', 'chat-view', 'chat-composer', 'step-rail', 'artifact-panel', 'button', 'mission-filter-dropdown']) {
    assert.ok(manifest.units.some(unit => unit.name === name), `Missing imported module: ${name}`);
    assert.ok(stylesheet.includes(`/* base/components/${name}.html */`));
  }
  assert.ok(!manifest.units.some(unit => unit.quality === 'slop'));
  assert.equal(createHash('sha256').update(stylesheet).digest('hex'), manifest.stylesheetSha256);
});

test('layout adapter references existing Academy tokens and declares no independent colour palette', async () => {
  const adapter = await readFile(new URL('../src/components/academy/academy-demo.css', import.meta.url), 'utf8');
  const declared = new Set([...stylesheet.matchAll(/(--academy-[\w-]+)\s*:/g)].map(match => match[1]));
  const used = [...adapter.matchAll(/var\((--academy-[\w-]+)/g)].map(match => match[1]);
  for (const token of used) assert.ok(declared.has(token), `Unknown design token: ${token}`);
  assert.doesNotMatch(adapter, /#[a-f\d]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i);
});
