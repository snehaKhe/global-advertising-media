const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/country-pages.json'), 'utf8'));
assert.equal(data.length, 195);
assert.equal(new Set(data.map(c => c.slug)).size, 195);
assert.equal(data.find(c => c.code === 'AF').areas.length, 34);
const ids = ['introduction', 'why-google-ads', 'investment-reasons', 'services', 'industries', 'benefits', 'process', 'scope', 'why-choose-us', 'service-areas', 'success-stories'];
for (const file of [...data.map(c => `countries/google-ads-${c.slug}.html`), 'countries/index.html']) {
  const absolute = path.join(root, file);
  const html = fs.readFileSync(absolute, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, file.endsWith('/index.html') ? 0 : 1, `${file}: heading count`);
  if (!file.endsWith('/index.html')) {
    for (const id of ids) assert.ok(html.includes(`id="${id}"`), `${file}: missing ${id}`);
    assert.ok(html.includes('illustrative project scenarios'), `${file}: example disclosure`);
    assert.ok(html.includes('Verified client reviews'), `${file}: review status`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(match[1])) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(absolute), match[1])), `${file}: missing ${match[1]}`);
  }
}
const seo = fs.readFileSync(path.join(root, 'Seo.html'), 'utf8');
const linkedFlags = [...seo.matchAll(/href="(countries\/google-ads-[^"]+)"/g)].map(m => m[1]);
assert.equal(linkedFlags.length, 195);
for (const file of linkedFlags) assert.ok(fs.existsSync(path.join(root, file)), file);
for (const c of data.filter(c => c.restricted)) {
  const html = fs.readFileSync(path.join(root, `countries/google-ads-${c.slug}.html`), 'utf8');
  assert.ok(html.includes('country-restricted'), `${c.name}: availability notice`);
  assert.ok(html.includes('Discuss Marketing Options'), `${c.name}: appropriate CTA`);
}
console.log('PASS: 195 country pages, 195 flag links, directory assets, required sections, Afghanistan provinces, and restricted-market notices.');
