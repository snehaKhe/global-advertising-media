const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'index.html');
let home = fs.readFileSync(sourcePath, 'utf8');
const footerPattern = /<footer\b[\s\S]*?<\/footer>/;
let footer = home.match(footerPattern)?.[0];
if (!footer) throw new Error('Homepage footer not found');
// The added links have dedicated service pages, rather than homepage sections.
footer = footer.replaceAll('index.html#website-designing', 'website-designing.html')
  .replaceAll('index.html#digital-advertising', 'digital-advertising.html')
  .replaceAll('Digital Advertisiment', 'Digital Advertisement');
let updated = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const original = fs.readFileSync(file, 'utf8');
    if (!footerPattern.test(original)) continue;
    const prefix = path.relative(path.dirname(file), root).split(path.sep).join('/');
    let target = footer.replace(/(href|src)="([^"\s]+)"/g, (match, attribute, value) => {
      if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(value)) return match;
      return `${attribute}="${prefix ? prefix + '/' : ''}${value}"`;
    });
    const oldFooter = original.match(footerPattern)[0];
    const oldTop = oldFooter.match(/href="(#[^"]+)" class="footer-back-top"/);
    const main = original.match(/<main\b[^>]*\bid="([^"]+)"/);
    let top = file === sourcePath ? '#home' : main ? '#' + main[1] : null;
    if (oldTop && original.includes(`id="${oldTop[1].slice(1)}"`)) top = oldTop[1];
    if (top) target = target.replace('href="#home" class="footer-back-top"', `href="${top}" class="footer-back-top"`);
    else target = target.replace('href="#home" class="footer-back-top"', `href="${prefix ? prefix + '/' : ''}index.html#home" class="footer-back-top"`);
    const next = original.replace(footerPattern, () => target);
    if (next !== original) { fs.writeFileSync(file, next); updated++; }
  }
}
walk(root);
console.log(`Synchronized homepage footer: ${updated} pages updated.`);
