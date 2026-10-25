import assert from 'node:assert/strict';

const base = process.env.SITE_URL || 'http://localhost:3000';
const cases = [
  { path: '/writing', locale: 'en', label: 'Page not found.', home: '/' },
  { path: '/a-missing-page', locale: 'en', label: 'Page not found.', home: '/' },
  { path: '/projects/a-missing-page', locale: 'en', label: 'Page not found.', home: '/' },
  { path: '/de/a-missing-page', locale: 'de', label: 'Seite nicht gefunden.', home: '/de' },
  { path: '/de/projects/a-missing-page', locale: 'de', label: 'Seite nicht gefunden.', home: '/de' },
];

for (const { path, locale, label, home } of cases) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 404, `${path} returns an actual 404`);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${path} has the expected document language`);
  assert.ok(html.includes(label), `${path} serves its localized error before JavaScript runs`);
  assert.match(html, /<meta name="robots" content="[^"]*noindex/, `${path} is excluded from search indexing`);
  assert.ok(html.includes(`href="${home}"`), `${path} links to the matching homepage`);
  assert.ok(!html.includes('No articles published yet.'), `${path} does not serve the removed Writing placeholder`);
  console.log(`PASS 404 ${path}`);
}
