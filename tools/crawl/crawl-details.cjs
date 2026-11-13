// Needs Playwright (npm i -D playwright). Run after crawl-lobby.cjs.  ~500 pages, 3 at a time, ~30 min.
// For each clinic in web/lobby.json: load its public page like a visitor and keep ONLY the "מיקום" (location) text.
// Resumable: tools/.cache/clinics/<slug>.json files that exist are skipped.  Options: --reverse (walk the list from the end, to run a 2nd worker). Contact details are not stored.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CACHE = path.join(__dirname, '..', '.cache');
const OUT = path.join(CACHE, 'clinics');
fs.mkdirSync(OUT, { recursive: true });
let items = JSON.parse(fs.readFileSync(path.join(CACHE, 'lobby.json'), 'utf8')).filter(x => x.href);
if (process.argv.includes('--reverse')) items = items.reverse();
const CONC = process.argv.includes('--reverse') ? 2 : 3;

const STOP = /^(קצת על|הרופא|עוד קצת|שעות|הצוות|שאלות|תמונות|קביעת תור|יצירת קשר|טלפון|דוא|פרטים|מידע|המכון מציע|שירותים|בדיקות|פעולות מהירות|עוד אודות|מניעת)/;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (sheba-parking-guide research; low volume)', locale: 'he-IL' });
  await ctx.route('**/*', r => {
    const t = r.request().resourceType(), u = r.request().url();
    if (['image', 'media', 'font', 'stylesheet'].includes(t) || !u.includes('sheba.co.il')) return r.abort();
    return r.continue();
  });
  let i = 0, done = 0, withLoc = 0;
  const slugOf = h => h.replace(/^\/+|\/+$/g, '').replace(/\//g, '__');

  async function worker() {
    while (i < items.length) {
      const it = items[i++];
      const file = path.join(OUT, slugOf(it.href) + '.json');
      if (fs.existsSync(file)) { done++; continue; }
      const p = await ctx.newPage();
      let rec = { name: it.name, href: it.href, ok: false };
      try {
        await p.goto('https://www.sheba.co.il/' + it.href.replace(/^\/+/, ''), { waitUntil: 'domcontentloaded', timeout: 45000 });
        let last = -1, stable = 0, text = '';
        for (let k = 0; k < 18; k++) {
          await p.waitForTimeout(500);
          text = await p.evaluate(() => document.body.innerText);
          if (/(^|\n)\s*מיקום\s*(\n|$)/.test(text)) break;
          if (text.length === last && text.length > 2000) { if (++stable >= 3) break; } else stable = 0;
          last = text.length;
        }
        const links = await p.evaluate(() => [...document.querySelectorAll('a')]
          .filter(a => /waze\.com|דרכי הגעה/i.test(a.href + ' ' + a.textContent))
          .map(a => ({ text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), href: a.getAttribute('href') })));
        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
        const idx = lines.findIndex(l => l === 'מיקום');
        const title = lines.find((l, n) => n > 8 && l.length > 2 && !/^SHARED|^עב$/.test(l)) || null;
        let loc = [];
        if (idx >= 0) for (const l of lines.slice(idx + 1, idx + 9)) { if (STOP.test(l)) break; loc.push(l); }
        rec = { name: it.name, href: it.href, ok: true, hasLocationField: idx >= 0, location: loc.join(' ').slice(0, 600) || null, links, chars: text.length };
        if (rec.location) withLoc++;
      } catch (e) { rec.error = String(e.message).slice(0, 120); }
      fs.writeFileSync(file, JSON.stringify(rec));
      await p.close();
      done++;
      if (done % 10 === 0) console.log(`done ${done}/${items.length}  withLocation ${withLoc}`);
      await new Promise(r => setTimeout(r, 800));
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  console.log('DONE', done, 'withLocation', withLoc);
  await b.close();
})();
