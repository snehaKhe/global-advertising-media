const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'data/country-pages.json'), 'utf8'));
const states = JSON.parse(fs.readFileSync(path.join(root, 'data/state-pages.json'), 'utf8'));
assert.equal(states.length, countries.reduce((n,c)=>n+c.areas.length,0));
assert.equal(new Set(states.map(s=>s.slug)).size, states.length);
const required = ['local-information','introduction','why-google-ads','investment-reasons','services','industries','benefits','process','scope','why-choose-us','service-areas','success-stories'];
// Cache referenced files to avoid repeated disk calls for shared assets.
const cache = new Map();
for (const s of states) {
 const file = path.join(root, 'states', s.slug+'.html');
 const html = fs.readFileSync(file, 'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,s.slug+': H1');
 for (const id of required) assert.ok(html.includes(`id="${id}"`), s.slug+': '+id);
 assert.ok(html.includes('illustrative project scenarios'),s.slug+': client scenario label');
 for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
  if (/^(https?:|mailto:|tel:|data:)/.test(match[1])) continue;
  const ref = path.resolve(path.dirname(file), match[1]);
  if (!cache.has(ref)) cache.set(ref, fs.existsSync(ref));
  assert.ok(cache.get(ref), s.slug+': missing '+match[1]);
 }
}
let links = 0;
for (const c of countries) {
 const html = fs.readFileSync(path.join(root, `countries/google-ads-${c.slug}.html`),'utf8');
 const list = html.match(/<ul id="country-areas"[^>]*>([\s\S]*?)<\/ul>/)[1];
 const linked = [...list.matchAll(/href="..\/states\/([^"]+)"/g)];
 assert.equal(linked.length,c.areas.length,c.name+': linked areas');
 links += linked.length;
}
assert.equal(links,states.length);
const directory = fs.readFileSync(path.join(root,'states/index.html'),'utf8');
const directoryList = directory.match(/<ul id="state-directory"[^>]*>([\s\S]*?)<\/ul>/)[1];
assert.equal((directoryList.match(/<li(?: hidden)?>/g)||[]).length, states.length);
console.log(`PASS: ${states.length} regional pages, ${links} country-to-region links, required sections, scenario labels, local assets, and sibling navigation.`);
