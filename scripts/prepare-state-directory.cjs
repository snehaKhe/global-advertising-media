const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '../states/index.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/(<ul id="state-directory"[^>]*>)([\s\S]*?)(<\/ul>)/, (_, start, items, end) => {
  let count = 0;
  return start + items.replace(/<li(?: hidden)?>/g, () => count++ < 60 ? '<li>' : '<li hidden>') + end;
});
if (!html.includes('id="state-more"')) html = html.replace('<p class="state-no-results"', '<button class="btn mt-4" type="button" id="state-more">Show More Regions</button><p class="state-no-results"');
fs.writeFileSync(file, html);
console.log('Prepared regional directory: 60 entries initially, full search, and Show More.');
