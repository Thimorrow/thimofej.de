import assert from 'node:assert/strict';

const base = process.env.SITE_URL || 'http://localhost:3000';
const cases = [
  { path: '/de', locale: 'de', text: 'Ich entwickle Frontends', opposite: '/' },
  { path: '/', locale: 'en', text: 'I build frontends', opposite: '/de' },
  { path: '/de/projects/academy', locale: 'de', text: 'Mein Beitrag', opposite: '/projects/academy' },
  { path: '/projects/academy', locale: 'en', text: 'My contribution', opposite: '/de/projects/academy' },
];

for (const { path, locale, text, opposite } of cases) {
  const response = await fetch(new URL(path, base), { headers: { 'x-site-locale': locale === 'en' ? 'de' : 'en' } });
  assert.equal(response.status, 200, `${path} responds successfully`);
  const html = await response.text();
  for (const [attribute, name] of [['property', 'og:image'], ['name', 'twitter:image']]) {
    const imageUrl = html.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]+)"`))?.[1];
    assert.ok(imageUrl, `${path} declares ${name} for link previews`);
    const image = await fetch(new URL(new URL(imageUrl).pathname + new URL(imageUrl).search, base));
    assert.equal(image.status, 200, `${path} serves its ${name}`);
    assert.match(image.headers.get('content-type') || '', /^image\/png/, `${path} serves a PNG preview`);
  }
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${path} sets its document language from the URL`);
  assert.ok(html.includes(text), `${path} serves translated text before JavaScript runs`);
  assert.ok(html.includes(`href="${opposite}"`), `${path} links to its equivalent translation`);
  assert.ok(html.includes(`rel="canonical" href="https://thimofej.de${path === "/" ? "" : path}"`), `${path} has its own canonical URL`);
  for (const language of ['de', 'en', 'x-default']) {
    assert.ok(html.includes(`hrefLang="${language}"`), `${path} declares ${language} for search engines`);
  }
  if (locale === 'en') {
    assert.ok(html.includes('German product demo'), `${path} identifies the German product reference`);
  }
  console.log(`PASS ${path}`);
}

const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
for (const { path } of cases) assert.ok(sitemap.includes(`https://thimofej.de${path}<`), `${path} appears in sitemap`);
console.log('PASS multilingual sitemap');

for (const [oldPath, target] of [['/en', '/'], ['/en/projects/academy', '/projects/academy']]) {
  const response = await fetch(new URL(oldPath, base), { redirect: 'manual' });
  assert.equal(response.status, 308, `${oldPath} permanently redirects`);
  assert.equal(new URL(response.headers.get('location'), base).pathname, target);
  console.log(`PASS redirect ${oldPath} -> ${target}`);
}
