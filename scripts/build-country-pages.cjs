const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const countries = JSON.parse(read('data/countries-source.json'));
const states = JSON.parse(read('data/states-source.json'));
let seo = read('Seo.html');
const flags = [...seo.matchAll(/<li class="country-flag" title="([^"]+)">(?:<a[^>]*>)?<img src="https:\/\/flagcdn.com\/w40\/([a-z]+)\.png"[^>]*>(?:<\/a>)?<\/li>/g)];
if (flags.length !== 195) throw Error(`Expected 195 SEO flags; found ${flags.length}`);
const unrestricted = code => !['CU', 'IR', 'KP', 'RU'].includes(code);
const data = flags.map(([, name, code]) => {
  const country = countries.find(c => c.iso2 === code.toUpperCase());
  if (!country) throw Error(`Missing country ${code}`);
  const display = name.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
  const divisions = states.filter(s => s.country_code === country.iso2 && (!s.parent_id || s.level === '1'));
  return {code: country.iso2, name: display, slug: slug(display), capital: country.capital, region: country.region,
    areas: [...new Set(divisions.map(s => s.name.trim()))].sort((a,b) => a.localeCompare(b)),
    areaType: country.iso2 === 'AF' ? 'Provinces' : 'States, Provinces & Regions',
    restricted: !unrestricted(country.iso2), caseStudies: [], reviews: []};
});
// This derived geography dataset is distributed under ODbL; see accompanying license.
write('data/country-pages.json', JSON.stringify(data, null, 2) + '\n');
const prefixLinks = html => html.replace(/(href|src)="([^"\s]+)"/g, (_, attr, value) => `${attr}="${/^(https?:|mailto:|tel:|data:|#)/.test(value) ? value.replace(/^#seo$/, '#country-main') : '../' + value}"`);
const header = prefixLinks(seo.match(/<header\b[\s\S]*?<\/header>/)[0]);
const footer = prefixLinks(seo.match(/<footer\b[\s\S]*?<\/footer>/)[0]);
const policyLink = 'https://support.google.com/google-ads/answer/6163740?hl=en';
const geoLink = 'https://support.google.com/google-ads/answer/10835274?hl=en';
const sourceLink = 'https://github.com/dr5hn/countries-states-cities-database';
function shell(title, description, content) {
 return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Global Advertising Media</title><meta name="description" content="${escape(description)}">
<link rel="stylesheet" href="../assets/vendor/bootstrap/bootstrap.min.css"><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="../digital-advertising.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;750;800&display=swap">
<link rel="stylesheet" href="../responsive.css"><link rel="stylesheet" href="../theme.css"><link rel="stylesheet" href="../country-pages.css"></head>
<body>${header}<main id="country-main" class="country-page">${content}</main>${footer}
<script src="../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script><script src="../script.js"></script><script src="../responsive.js"></script><script src="../country-pages.js"></script></body></html>`;
}
const cards = items => `<div class="country-card-grid">${items.map(([title, copy], i) => `<article class="country-card"><span class="country-card-number">${String(i+1).padStart(2,'0')}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;
const heading = (eyebrow, title, copy = '') => `<div class="country-section-heading"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${copy ? `<p>${copy}</p>` : ''}</div>`;
const section = (id, content, alt = false) => `<section id="${id}" class="country-section${alt ? ' country-section-alt' : ''}"><div class="container">${content}</div></section>`;
for (const c of data) {
 const name = escape(c.name);
 const capital = escape(c.capital || c.name);
 const firstAreas = c.areas.slice(0, 5).map(escape).join(', ');
 const availability = c.restricted ? (c.code === 'RU' ? 'Google currently pauses ads serving to users in Russia and ads from Russia-based advertisers. We do not offer campaign launch in this market while that pause applies.' : `Google Ads is not available to advertisers in ${name} under Google's current country restrictions. We do not offer account creation or campaign launch that bypasses these restrictions.`) : `Campaign types, billing, verification, and geographic targeting must be confirmed for your account and target market before launch.`;
 const policyUrl = c.code === 'RU' ? 'https://support.google.com/authorizedbuyers/answer/1325008?hl=en' : policyLink;
 const content = `
<section class="country-hero"><div class="container"><nav class="country-breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="index.html">Countries</a><span aria-hidden="true">/</span><span aria-current="page">${name}</span></nav>
<div class="country-hero-grid"><div><div class="country-label"><img src="https://flagcdn.com/w80/${c.code.toLowerCase()}.png" alt="${name} flag" width="40" height="28"><span>GOOGLE ADS · ${name.toUpperCase()}</span></div>
<h1>${c.restricted ? 'Google Ads Availability in' : 'Google Ads Services in'} <span>${name}.</span></h1><p>${c.restricted ? `Understand advertising availability and discuss permitted digital marketing alternatives for your business.` : `Reach the people who are looking for what you offer. Build a focused advertising plan for ${name}, with clear objectives, considered creative, and practical reporting.`}</p>
<div class="country-hero-actions"><a class="btn" href="../index.html#contact">${c.restricted ? 'Discuss Marketing Options' : 'Plan Your Google Ads Campaign'} ↗</a><a class="country-secondary-link" href="#service-areas">Explore service areas ↓</a></div><div class="country-proof"><span>Clear scope</span><span>Agreed budgets</span><span>Transparent reporting</span></div></div>
<figure><img src="../images/seo-search-illustration.jpg" alt="Conceptual illustration of search advertising and campaign analytics" width="1536" height="1024" fetchpriority="high"><figcaption>Strategy shaped around your audience.</figcaption></figure></div></div></section>
<div class="country-jump"><div class="container"><a href="#introduction">Overview</a><a href="#services">Services</a><a href="#industries">Industries</a><a href="#process">Our process</a><a href="#scope">Scope of work</a><a href="#service-areas">Service areas</a><a href="#success-stories">Client stories</a></div></div>
<div class="container"><aside class="country-availability${c.restricted ? ' country-restricted' : ''}" aria-label="Google Ads availability"><strong>${c.restricted ? 'Advertising availability' : 'Before campaign launch'}</strong><p>${availability} <a href="${policyUrl}" target="_blank" rel="noopener">Google's country guidance ↗</a></p></aside></div>
${section('introduction', heading('INTRODUCTION TO GOOGLE ADS', `Make Your Business Easier to Discover in <span>${name}.</span>`) + `<div class="country-copy-columns"><p>Google Ads is Google's advertising platform for placing paid campaigns across eligible search, video, display, and other advertising placements. A campaign brings together an objective, an audience, creative assets, a budget, and a way to measure the actions that matter to your business.</p><p>For a business exploring ${name}, our starting point is the customer journey: what people need, which locations you can serve, which languages your team can support, and what happens after someone clicks. We agree these foundations before recommending a campaign structure.</p></div>`)}
${section('why-google-ads', heading('WHY BUSINESSES NEED GOOGLE ADS', 'Turn Relevant Interest Into <span>A Clear Next Step.</span>', `For eligible campaigns in ${name}, paid search can complement your organic presence and support a specific promotion, product, or service. The right fit depends on your offer, audience, budget, and account eligibility.`) + cards([
['Reach relevant searches', 'Help people discover your offer when they search for related products or services. We research intent rather than build a plan around traffic alone.'],
['Control campaign priorities', 'Agree spending limits, locations, schedules, and messages around your operational capacity and business objectives.'],
['Learn from customer actions', 'Review enquiries, purchases, or other agreed actions when suitable measurement and consent arrangements are in place.']
]), true)}
${section('investment-reasons', heading('KEY REASONS BUSINESSES INVEST', `Advertising With a Purpose in <span>${name}.</span>`) + cards([
['Support a launch', 'Introduce an eligible new service or product with a campaign that has a defined audience, message, and landing page.'],
['Focus on serviceable areas', `Start with locations you can actually serve, such as ${capital}, then evaluate expansion based on demand and delivery capacity.`],
['Test an offer', 'Compare relevant messages and landing-page approaches within an agreed budget, then use the findings to refine the campaign.']
]))}
${section('services', heading('OUR GOOGLE ADS SERVICES', `Campaign Planning and Management for <span>${name}.</span>`, c.restricted ? 'The capabilities below describe our general service offering. Campaign activation is unavailable in this market while the restrictions noted above apply.' : 'We recommend only the campaign types that fit your objectives and are supported for your account and target market.') + cards([
['Search advertising', 'Keyword and intent research, account structure, responsive search ad copy, relevant assets, and negative keyword planning.'],
['Display & video planning', 'Audience and creative planning for eligible Display and YouTube campaigns, with clear roles for awareness and consideration.'],
['Shopping & Performance Max', 'Suitability checks, feed coordination, and asset planning where the campaign type and required merchant services are supported.'],
['Conversion measurement', 'An agreed measurement plan, tag coordination, event checks, and review of consent requirements with your team.'],
['Landing-page recommendations', 'Review message consistency, page clarity, mobile usability, contact journeys, and the next step after an ad click.'],
['Ongoing optimization', 'Search-term review, budget allocation, creative tests, and performance reporting against agreed business objectives.']
]), true)}
${section('industries', heading('INDUSTRIES WE SERVE', 'A Plan Shaped Around <span>Your Business Model.</span>', 'Examples of sectors we can discuss include the following. Campaign eligibility and any industry-specific requirements are reviewed before a proposal is finalized.') + `<ul class="country-industry-list">${['Retail & e-commerce','Professional services','Education & training','Home & repair services','Manufacturing & B2B','Property & real estate','Travel & hospitality','Technology & software'].map(x=>`<li>${x}</li>`).join('')}</ul>`)}
${section('benefits', heading('BENEFITS OF GOOGLE ADS', 'Build a More <span>Measurable Marketing Plan.</span>') + `<div class="country-feature-split"><img src="../images/seo-content-planning.jpg" alt="Illustrative marketing planning session with campaign charts" loading="lazy" width="1536" height="1024"><div><h3>Clarity before scale</h3><p>A well-structured campaign gives your team a clearer way to compare messages, audience choices, and customer actions. It also makes spending decisions easier to explain.</p><ul class="country-check-list"><li>Align campaign objectives with your enquiry or sales journey.</li><li>Adapt messages to the products and locations you support.</li><li>Review performance using agreed definitions of success.</li><li>Adjust or pause campaigns as your business priorities change.</li></ul><p>These are planning benefits, not a promise of sales, rankings, or a fixed return.</p></div></div>`, true)}
${section('process', heading('OUR PROCESS', 'From First Conversation to <span>Ongoing Improvement.</span>') + `<ol class="country-process">${[
['Discover', `Understand your offer, audience in ${name}, service coverage, language needs, and current marketing activity.`],
['Review eligibility', 'Check account access, platform availability, advertiser requirements, and the suitability of your offer.'],
['Plan', 'Agree objectives, campaign structure, keyword themes, creative responsibilities, measurement, and budgets.'],
['Build & approve', 'Prepare campaigns and assets, check landing pages and tracking, and obtain approval before activation.'],
['Launch & monitor', c.restricted ? 'Campaign launch is not offered while current restrictions apply. Discuss permitted alternatives instead.' : 'Activate eligible approved campaigns, check early delivery, and address any review or measurement issues.'],
['Review & refine', 'Explain performance, document changes, and recommend the next round of tests and improvements.']
].map(([t,p])=>`<li><h3>${t}</h3><p>${p}</p></li>`).join('')}</ol>`)}
${section('scope', heading('SCOPE OF WORK', 'Know What Is Included <span>Before We Begin.</span>') + `<div class="country-scope"><article><h3>Agreed campaign deliverables</h3><ul><li>Discovery, account review, and an initial campaign plan.</li><li>Keyword, location, and audience recommendations.</li><li>Ad copy and asset requirements within the agreed scope.</li><li>Campaign setup, approval coordination, and eligible launch.</li><li>Scheduled optimization and performance reporting.</li></ul></article><article><h3>Confirmed separately</h3><ul><li>Media spend, separate from agency service fees.</li><li>Website development or landing-page production.</li><li>Product feed repairs, photography, or video production.</li><li>Translation, sector-specific reviews, and specialist integrations.</li><li>Reporting frequency, account access, and approval responsibilities.</li></ul></article></div>`, true)}
${section('why-choose-us', heading('WHY CHOOSE US', 'A Practical Partner for <span>Your Next Campaign.</span>') + cards([
['Business-first planning', 'We discuss your offer, operational capacity, and priorities before recommending where to spend.'],
['Connected creative & strategy', 'Your ad message, content, and website journey are planned together rather than treated as isolated tasks.'],
['Clear communication', 'You receive an agreed scope, defined approval steps, and explanations of the work and the decisions behind it.']
]))}
${section('service-areas', heading(`AREAS WE SERVE IN ${name.toUpperCase()}`, `Plan Your Reach Across <span>${name}.</span>`, `Discuss ${capital}${firstAreas ? ` and areas such as ${firstAreas}` : ''} with our team. We plan remote campaign support around your service coverage; this list does not imply a local office in every location.`) + `<p>Country and regional coverage is agreed for each project. Available Google Ads location targets vary, and geographic names below do not guarantee that every place can be targeted individually. <a class="country-text-link" href="${geoLink}" target="_blank" rel="noopener">How Google location targeting works ↗</a></p>` + heading('REGIONAL COVERAGE', `${c.areaType} We Serve in <span>${name}.</span>`, c.code === 'AF' ? 'Afghanistan has provinces rather than states. Explore the 34 provinces below when discussing your service area.' : 'Use this regional list to discuss your preferred service areas and geographic exclusions.') + `<div class="country-area-tools"><label for="area-search">Find an area in ${name}</label><input id="area-search" class="form-control" type="search" placeholder="Search ${c.areaType.toLowerCase()}…" aria-controls="country-areas"><p class="country-area-count" aria-live="polite">${c.areas.length} areas listed</p></div><ul id="country-areas" class="country-area-list">${(c.areas.length ? c.areas : [c.capital || c.name]).map(area=>`<li>${escape(area)}</li>`).join('')}</ul><p class="country-no-results" hidden>No matching area. Try another name or contact us to discuss your location.</p><p class="country-data-credit">Geography: <a href="${sourceLink}" target="_blank" rel="noopener">Countries States Cities Database</a>, ODbL v1.0. <a href="../data/country-pages.json">Download regional data</a>. Regional names can change; final campaign targets are confirmed during planning.</p>`, true)}
${section('success-stories', heading('CLIENT SUCCESS STORIES', 'What a Focused Campaign <span>Could Look Like.</span>', `The examples below are illustrative project scenarios for a business exploring ${name}. They are not completed client projects or claims of results.`) + cards([
['Example brief: local services', 'Goal: attract relevant service enquiries. Proposed work: focused search themes, service-area settings, a clear enquiry page, and agreed lead tracking. Results would be reported after implementation.'],
['Example brief: retail', 'Goal: promote an eligible product range. Proposed work: product and landing-page review, campaign suitability checks, creative testing, and budget reviews. No sales or return figures are assumed.']
]) + `<div class="country-review-panel"><h3>Client Reviews</h3><p>Verified client reviews and approved success stories for ${name} have not been published on this page yet. Contact our team to discuss relevant experience and available references.</p><a class="country-text-link" href="../index.html#contact">Ask About Relevant Experience ↗</a></div>`)}
${section('country-contact', `<div class="country-final-cta"><div><span class="eyebrow">LET'S DISCUSS YOUR MARKET</span><h2>${c.restricted ? `Explore Marketing Options for ${name}.` : `Ready to Reach Your Audience in ${name}?`}</h2><p>Share your website, industry, target areas, and business goals. We will discuss eligibility and prepare a relevant scope before any campaign commitment.</p></div><a class="btn" href="../index.html#contact">Start a Conversation ↗</a></div><p class="country-return"><a href="index.html">Browse all countries</a> · <a href="../Seo.html#countries-heading">Return to the SEO page</a></p>`, true)}
`;
 write(`countries/google-ads-${c.slug}.html`, shell(`Google Ads ${c.restricted ? 'Availability' : 'Services'} in ${c.name}`, `Explore Google Ads ${c.restricted ? 'availability' : 'services'}, campaign planning, industries, scope of work, and service areas in ${c.name}.`, content));
}
seo = seo.replace(/<li class="country-flag" title="([^"]+)">(?:<a[^>]*>)?(<img src="https:\/\/flagcdn.com\/w40\/([a-z]+)\.png"[^>]*>)(?:<\/a>)?<\/li>/g, (_, name, img, code) => {
 const c = data.find(c => c.code.toLowerCase() === code);
 return `<li class="country-flag" title="${name}"><a href="countries/google-ads-${c.slug}.html" aria-label="Google Ads in ${name}">${img}</a></li>`;
});
write('Seo.html', seo);
write('countries/index.html', shell('Google Ads Country Directory', 'Explore country-specific Google Ads services, availability, and regional campaign planning.', `<section class="country-directory country-section"><div class="container"><a class="country-text-link" href="../Seo.html#countries-heading">← Back to SEO services</a>${heading('EXPLORE YOUR MARKET', 'Google Ads <span>Country Directory.</span>', 'Choose a country to explore campaign services, availability, and regional coverage.')}<label for="country-search">Find a country</label><input id="country-search" type="search" class="form-control" placeholder="Search countries…" aria-controls="country-directory"><p class="directory-count" aria-live="polite">${data.length} countries</p><ul id="country-directory" class="country-directory-grid">${data.map(c=>`<li><a href="google-ads-${c.slug}.html"><img src="https://flagcdn.com/w40/${c.code.toLowerCase()}.png" alt="" width="32" height="22" loading="lazy"><span>${escape(c.name)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul><p class="directory-no-results" hidden>No matching country. Try another name.</p></div></section>`));
console.log(`Built ${data.length} country pages and a searchable directory. Afghanistan: ${data.find(c=>c.code==='AF').areas.length} provinces.`);
require('./build-state-pages.cjs');
