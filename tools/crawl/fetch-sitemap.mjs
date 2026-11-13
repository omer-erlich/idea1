// Downloads https://www.sheba.co.il/sitemap (public) – used to list the "tests" pages.
//   NODE_USE_ENV_PROXY=1 node tools/crawl/fetch-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.cache');
fs.mkdirSync(dir, { recursive: true });
const r = await fetch('https://www.sheba.co.il/sitemap', { headers: { 'User-Agent': 'sheba-parking-guide-research/1.0 (low volume)' } });
if (!r.ok) throw new Error('sitemap ' + r.status);
fs.writeFileSync(path.join(dir, 'sitemap.xml'), await r.text());
console.log('saved tools/.cache/sitemap.xml');
