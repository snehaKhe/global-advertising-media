# Global Advertising Media website

Static HTML website updated to Bootstrap **5.3.8**. Open `index.html` directly, or run `node preview.cjs` and visit http://localhost:8080 for local preview.

## Files

- `assets/vendor/bootstrap/`: local Bootstrap CSS and JavaScript bundle, including Popper.
- `responsive.css`: shared Bootstrap integration and responsive overrides. Load after the original page CSS.
- `responsive.js`: shared mobile menu closing and keyboard behavior.
- `theme.css`: shared DM Sans typography, navy/orange palette, buttons, cards, and form styling. Load this last on every page.
- `script.js`: existing counters, portfolio, FAQ, scrolling, and other interactions.

All 35 HTML pages include Bootstrap and the shared responsive files. Navigation collapses below 1200px to accommodate the full set of links. Content uses Bootstrap columns with phone, tablet, and desktop breakpoints. Parent navigation links remain clickable; adjacent arrow buttons open submenus.

All pages use DM Sans with consistent heading and text weights. The shared palette uses navy `#14243b`, burnt orange `#c84d18`, peach highlights `#ffac73`, and light surfaces `#f5f7fb`. Edit `theme.css` to change the design across the site. Font Awesome icons retain their original icon font.

## Validation

- Browser layout checks across all 35 pages at 320, 768, and 1440px: no document horizontal overflow.
- Additional representative-page checks at 1024px, and desktop navigation at 1200px.
- Phone navigation and long advertising submenu verified interactively.
- JavaScript syntax checks passed for `script.js` and `responsive.js`.

These are browser viewport checks, not exhaustive tests on every physical device. Fonts, Font Awesome icons, and existing remote images still require internet access. The existing contact form remains a demo until connected to a backend.

Deploy the HTML files, CSS files, JavaScript files, logo, `images/`, and `assets/` together. No build step is required. Bootstrap is distributed under the MIT license; see its source headers and https://github.com/twbs/bootstrap/blob/v5.3.8/LICENSE.

## Country Google Ads pages

The 195 flags on `Seo.html` link to individual static pages in `countries/`. `countries/index.html` provides a searchable directory. Each country page includes campaign introduction, business reasons, services, industries, benefits, process, scope, agency approach, searchable regional coverage, illustrative client briefs, review status, and enquiry links. Afghanistan includes its 34 provinces.

Run `node scripts/build-country-pages.cjs` to regenerate country pages and flag links from the SEO header/footer and the local geography dataset. Edit the shared generator to change country-page copy, `country-pages.css` for styling, and `country-pages.js` for area/directory filtering. The generated pages work without a runtime build or server-side routing. Deploy the `countries/`, `data/`, and `country-pages.*` files along with the rest of the site.

Run `node scripts/check-country-pages.cjs` to validate all generated pages, flag destinations, required sections, and local assets. Representative country pages were checked at 320, 768, and 1440px; directory filtering, province filtering, empty results, and mobile dropdowns were verified in the browser.

Geography attribution, license, and Google Ads policy sources are documented in `data/README.md`. Restricted markets have availability wording rather than campaign-launch promises. Success story examples are illustrative; add genuine, approved client stories and reviews before presenting them as completed work. The 195 pages share a service structure; country-specific language, offers, and approved evidence can be expanded in the generator as needed.

## State, province, and region pages

All 3,793 areas listed across the country pages have dedicated static pages in `states/`. Country-area chips link to these pages. Each page includes local administrative information, Google Ads introduction, reasons to invest, services, industries, benefits, process, scope, agency approach, area planning, illustrative client briefs, and review status. Parent-country links and related-region links support navigation. `states/index.html` searches by area or country name.

The regional directory initially shows 60 entries. Show More reveals additional entries, while search checks all 3,793 areas. This keeps the visible list manageable on mobile. The directory retains the same content and links when opened directly from the filesystem.

`node scripts/build-country-pages.cjs` now regenerates both country and region pages. To rebuild only regional pages and country-area links, run `node scripts/build-state-pages.cjs`. Run `node scripts/check-state-pages.cjs` to validate every region page and country-area destination. Deploy `states/` and `data/state-pages.json` with the rest of the site. Vatican City has no subdivisions listed in the dataset, so it retains country-level coverage without invented region pages.

Region pages describe remote campaign planning and do not claim local offices, specific targeting availability, or unverified client performance. Geographic facts are drawn from the bundled source data and retain its ODbL attribution. Actual account and market restrictions remain inherited from the country page.

Country and regional pages share entrance animations, one-time scroll reveals, and desktop hover effects through `country-pages.js` and `country-pages.css`. Reduced-motion preferences disable these effects. Content remains visible if JavaScript or animation support is unavailable.

## Compact card styling

The shared theme uses warmer neutral surfaces, lighter shadows, and tighter card typography. Standard cards use 22px internal padding on desktop and 18px on mobile; country and regional cards follow the same spacing. Icon and paragraph gaps are reduced, while navigation and action links retain comfortable touch targets. Portfolio details expand within their cards instead of sitting in a fixed overlay. The homepage introduction uses more conversational copy.

The compact update was checked on all 35 original pages plus representative country, state, and directory pages at 320px, 768px, and 1440px (114 viewport checks), with no horizontal overflow. Expanded portfolio details and mobile dropdown navigation were checked interactively.
