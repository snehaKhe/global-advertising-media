const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, text) => fs.writeFileSync(path.join(root, file), text);
const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replaceAll('&','and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const countries = JSON.parse(read('data/country-pages.json'));
const source = JSON.parse(read('data/states-source.json'));
fs.mkdirSync(path.join(root, 'states'), { recursive: true });
const used = new Set();
const regions = countries.flatMap(country => country.areas.map(name => {
  const record = source.find(s => s.country_code === country.code && s.name.trim() === name);
  const base = `google-ads-${country.slug}-${slug(name) || 'region'}`;
  let pageSlug = base;
  if (used.has(pageSlug)) pageSlug += '-' + (record?.id || used.size);
  if (used.has(pageSlug)) throw Error('Duplicate region page: '+pageSlug);
  used.add(pageSlug);
  return { name, country: country.name, countryCode: country.code, countrySlug: country.slug, slug: pageSlug,
    type: record?.type || 'region', native: record?.native || '', timezone: record?.timezone || '', sourceId: record?.id || null };
}));
write('data/state-pages.json', JSON.stringify(regions, null, 2)+'\n');
const localLink = (region, label = region.name) => `<a href="${region.slug}.html">${esc(label)}</a>`;
const sectionPattern = /<section id="service-areas"[\s\S]*?<\/section>/;
for (const country of countries) {
  const countryFile = `countries/google-ads-${country.slug}.html`;
  let original = read(countryFile);
  const members = regions.filter(s => s.countryCode === country.code);
  // Make each region in the existing searchable country list a real link.
  const linkedAreas = members.length ? members.map(s=>`<li><a href="../states/${s.slug}.html">${esc(s.name)} <span aria-hidden="true">↗</span></a></li>`).join('') : `<li>${esc(country.capital || country.name)}</li>`;
  original = original.replace(/(<ul id="country-areas"[^>]*>)[\s\S]*?(<\/ul>)/, '$1'+linkedAreas+'$2');
  if (!original.includes('Browse all state and region pages')) original = original.replace('<p class="country-data-credit">', '<p class="state-directory-return"><a class="country-text-link" href="../states/index.html">Browse all state and region pages ↗</a></p><p class="country-data-credit">');
  write(countryFile, original);
  for (const region of members) {
    const n = esc(region.name), c = esc(country.name), place = `${n}, ${c}`;
    let page = original;
    const main = page.match(/<main\b[\s\S]*?<\/main>/)[0];
    // Shared service content stays consistent; the location context is localized.
    let body = main.replaceAll(c, place);
    const breadcrumb = `<nav class="country-breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="../countries/index.html">Countries</a><span aria-hidden="true">/</span><a href="../${countryFile}">${c}</a><span aria-hidden="true">/</span><span aria-current="page">${n}</span></nav>`;
    body = body.replace(/<nav class="country-breadcrumb"[\s\S]*?<\/nav>/, breadcrumb);
    body = body.replace(/<div class="country-label">[\s\S]*?<\/div>/, `<div class="country-label"><img src="https://flagcdn.com/w80/${country.code.toLowerCase()}.png" alt="${c} flag" width="40" height="28"><span>${esc(region.type.toUpperCase())} · ${n.toUpperCase()}</span></div>`);
    body = body.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>Google Ads ${country.restricted ? 'Availability' : 'Services'} in <span>${n}.</span></h1><p class="state-country-context">${c} · ${esc(region.type.charAt(0).toUpperCase()+region.type.slice(1))} service page</p>`);
    body = body.replace(`Start with locations you can actually serve, such as ${esc(country.capital || country.name)}, then evaluate expansion based on demand and delivery capacity.`, `Start with the areas you can actually serve within ${n}, then evaluate expansion based on demand and delivery capacity.`);
    const geography = `<section id="local-information" class="country-section"><div class="container"><div class="country-section-heading"><span class="eyebrow">LOCAL CONTEXT</span><h2>About <span>${n}.</span></h2><p>${n} is listed as a ${esc(region.type)} in ${c}. Our campaign planning starts with the areas your business can serve and the customers you want to reach, rather than assuming the same approach works everywhere.</p></div><dl class="state-location-facts"><div><dt>Country</dt><dd><a href="../${countryFile}">${c}</a></dd></div><div><dt>Administrative area</dt><dd>${n}</dd></div><div><dt>Division type</dt><dd>${esc(region.type)}</dd></div>${region.native ? `<div><dt>Local name</dt><dd dir="auto">${esc(region.native)}</dd></div>` : ''}${region.timezone ? `<div><dt>Time zone reference</dt><dd>${esc(region.timezone)}</dd></div>` : ''}</dl></div></section>`;
    body = body.replace('<section id="introduction"', geography+'<section id="introduction"');
    const areas = `<section id="service-areas" class="country-section country-section-alt"><div class="container"><div class="country-section-heading"><span class="eyebrow">AREA COVERAGE IN ${n.toUpperCase()}</span><h2>A Focused Plan for <span>${place}.</span></h2><p>Tell us which towns, neighbourhoods, delivery areas, or customer locations within ${n} matter to your business. We use that brief to check available Google Ads location targets and agree where a campaign should run.</p></div><div class="country-scope"><article><h3>Define your service area</h3><ul><li>Confirm the locations your business can serve.</li><li>Agree customer language and creative requirements.</li><li>Discuss local schedules and the enquiry process.</li><li>Exclude locations outside your operational coverage.</li></ul></article><article><h3>Confirm campaign availability</h3><p>${country.restricted ? 'This region follows the country restrictions or pause described above. Campaign activation is not offered while those limitations apply.' : 'Campaign formats and geographic target options are reviewed before launch. A region name in this directory does not guarantee that it can be selected as an individual Google Ads target.'}</p><p>Our remote support does not imply a physical office in ${n}.</p><a class="country-text-link" href="../index.html#contact">Discuss Your Locations ↗</a></article></div><p class="country-data-credit">Administrative information: <a href="https://github.com/dr5hn/countries-states-cities-database" target="_blank" rel="noopener">Countries States Cities Database</a>, ODbL v1.0. <a href="../data/state-pages.json">Download regional data</a>. Names and boundaries may change.</p><div class="country-section-heading state-other-heading"><span class="eyebrow">EXPLORE ${c.toUpperCase()}</span><h2>Other Areas in <span>${c}.</span></h2></div><ul class="country-area-list state-neighbours">${members.filter(s=>s.slug!==region.slug).slice(0,12).map(s=>`<li>${localLink(s)}</li>`).join('')}</ul><a class="country-text-link" href="../${countryFile}#service-areas">View all ${members.length} areas in ${c} ↗</a></div></section>`;
    body = body.replace(sectionPattern, areas);
    // Location policies belong to the country; keep notices accurate and unmodified.
    body = body.replace(/<aside class="country-availability[\s\S]*?<\/aside>/, original.match(/<aside class="country-availability[\s\S]*?<\/aside>/)[0]);
    body = body.replace(/<p class="country-return">[\s\S]*?<\/p>/, `<p class="country-return"><a href="../${countryFile}">Back to ${c}</a> · <a href="index.html">Browse all states and regions</a> · <a href="../Seo.html#countries-heading">SEO services</a></p>`);
    body = body.replace(/href="index.html"/g, 'href="../countries/index.html"');
    body = body.replace('href="../countries/index.html">Browse all states and regions', 'href="index.html">Browse all states and regions');
    page = page.replace(main, body);
    page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>Google Ads ${country.restricted ? 'Availability' : 'Services'} in ${place} | Global Advertising Media</title>`);
    page = page.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="Explore Google Ads ${country.restricted ? 'availability' : 'services'} in ${place}: campaign strategy, services, industries, benefits, process, scope of work, and local service coverage.">`);
    write(`states/${region.slug}.html`, page);
  }
}
const template = read('countries/index.html');
const content = `<main id="country-main" class="country-page"><section class="country-directory country-section"><div class="container"><a class="country-text-link" href="../countries/index.html">← Browse countries</a><div class="country-section-heading"><span class="eyebrow">EXPLORE YOUR LOCAL MARKET</span><h1>States, Provinces <span>&amp; Regions.</span></h1><p>Find a dedicated Google Ads service page for an area listed in our country directory. Search by region name or country.</p></div><label for="state-search">Find a state, province, region, or country</label><input id="state-search" type="search" class="form-control" placeholder="Try Kabul, California, or Türkiye…" aria-controls="state-directory"><p class="state-count" aria-live="polite">${regions.length} regions listed</p><ul id="state-directory" class="country-directory-grid">${regions.map(s=>`<li><a href="${s.slug}.html"><span>${esc(s.name)}<small class="state-directory-country">${esc(s.country)}</small></span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul><p class="state-no-results" hidden>No matching region. Try a different name or country.</p></div></section></main>`;
write('states/index.html', template.replace(/<main\b[\s\S]*?<\/main>/, content).replace(/<title>[\s\S]*?<\/title>/, '<title>State &amp; Region Google Ads Directory | Global Advertising Media</title>').replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Find local Google Ads service pages by state, province, region, or country.">'));
console.log(`Built ${regions.length} regional pages, linked country lists, and states/index.html.`);
require('./prepare-state-directory.cjs');
