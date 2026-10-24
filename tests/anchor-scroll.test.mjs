import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../src/components/AnchorScrollControl.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ reduce = false, targetTop = 2340, viewTransition = false } = {}) {
  const document = new EventTarget(), window = new EventTarget(), media = new EventTarget();
  media.matches = reduce;
  Object.assign(window, { scrollY: 340, innerHeight: 2000 });
  const calls = [], frames = new Map(), location = new URL('https://thimofej.de/projects/academy');
  let id = 0, cleanup, focused = false;
  window.scrollTo = options => { calls.push(options); window.scrollY = options.top; };
  class Element {}
  class Anchor extends Element {
    constructor(href, inScope = true) { super(); this.href = href; this.inScope = inScope; this.target = ''; }
    closest(selector) { return selector === 'a[href]' || this.inScope ? this : null; }
    hasAttribute() { return false; }
  }
  const attributes = new Map();
  const target = {
    getBoundingClientRect: () => ({ top: targetTop - window.scrollY }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value),
    addEventListener() {}, focus: options => { assert.equal(options.preventScroll, true); focused = true; },
  };
  document.getElementById = name => name === 'beitrag' ? target : null;
  document.documentElement = { scrollHeight: 5000 };
  let transitionCallback, skipped = 0;
  if (viewTransition) document.startViewTransition = callback => {
    transitionCallback = callback;
    return { finished: Promise.resolve(), skipTransition: () => skipped++ };
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: () => ({ useEffect: effect => { cleanup = effect(); } }),
    document, window, Event, Element, HTMLAnchorElement: Anchor, URL, location,
    matchMedia: () => media, getComputedStyle: () => ({ scrollMarginTop: '24px' }),
    history: { pushState: (_, __, hash) => { location.hash = hash; } },
    HashChangeEvent: class extends Event {}, performance: { now: () => 0 },
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: id => frames.delete(id),
  });
  exports.default();
  const click = (href = 'https://thimofej.de/projects/academy#beitrag', options = {}) => {
    const event = new Event('click', { cancelable: true });
    Object.defineProperties(event, { target: { value: new Anchor(href) }, button: { value: 0 } });
    Object.assign(event, options); document.dispatchEvent(event); return event;
  };
  const step = now => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); };
  return { window, calls, click, cleanup, step, frames, location, focused: () => focused, runTransition: () => transitionCallback(), skipped: () => skipped };
}

test('anchor journey has intermediate positions and finishes exactly at the offset destination', () => {
  const s = setup(); assert.equal(s.click().defaultPrevented, true);
  s.step(150); const early = s.window.scrollY;
  s.step(300); assert.ok(s.window.scrollY > early && s.window.scrollY < 2316);
  s.step(1500); assert.equal(s.window.scrollY, 2316);
  assert.equal(s.frames.size, 0); assert.equal(s.location.hash, '#beitrag'); assert.equal(s.focused(), true);
});

test('wheel, touch and navigation keys cancel without snapping or stealing focus', () => {
  for (const type of ['wheel', 'touchstart', 'keydown']) {
    const s = setup(); s.click(); s.step(250); const position = s.window.scrollY;
    const event = new Event(type); event.key = 'Escape'; s.window.dispatchEvent(event); s.step(1200);
    assert.equal(s.window.scrollY, position); assert.equal(s.frames.size, 0); assert.equal(s.focused(), false);
  }
});

test('a second anchor click replaces the journey from the current position and cleanup cancels it', () => {
  const s = setup(); s.click(); s.step(250); const position = s.window.scrollY;
  s.click(); s.step(0); assert.equal(s.window.scrollY, position); assert.equal(s.frames.size, 1);
  s.cleanup(); assert.equal(s.frames.size, 0);
});

test('modified, cross-page and missing destinations retain native navigation', () => {
  const s = setup();
  assert.equal(s.click(undefined, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(s.click('https://thimofej.de/#beitrag').defaultPrevented, false);
  assert.equal(s.click('https://thimofej.de/projects/academy#missing').defaultPrevented, false);
  assert.equal(s.frames.size, 0);
});

test('reduced motion jumps directly and destinations near the page end clamp to the scroll limit', () => {
  const s = setup({ reduce: true, targetTop: 4900 }); s.click();
  assert.equal(s.window.scrollY, 3000); assert.equal(s.frames.size, 0); assert.equal(s.focused(), true);
});

test('a delayed first browser frame starts at the current position instead of skipping the journey', () => {
  const s = setup(); s.click(); s.step(2000);
  assert.equal(s.window.scrollY, 340);
  s.step(2250); assert.ok(s.window.scrollY > 340 && s.window.scrollY < 2316);
  s.step(3500); assert.equal(s.window.scrollY, 2316);
});


test('long navigation crossfades straight to its destination without scrubbing intervening animations', () => {
  const s = setup({ targetTop: 4900, viewTransition: true }); s.click();
  assert.equal(s.calls.length, 0);
  let settledAt;
  s.window.addEventListener('anchor-arrive', () => { settledAt = s.window.scrollY; });
  assert.equal(s.runTransition(), undefined);
  assert.equal(settledAt, 3000);
  assert.equal(s.calls.length, 1); assert.equal(s.window.scrollY, 3000);
  assert.equal(s.focused(), true);
});

test('input before a pending long transition prevents the later jump', () => {
  const s = setup({ targetTop: 4900, viewTransition: true }); s.click();
  s.window.dispatchEvent(new Event('wheel')); s.runTransition();
  assert.equal(s.calls.length, 0); assert.equal(s.focused(), false); assert.equal(s.skipped(), 1);
});
