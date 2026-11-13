// Needs Playwright (npm i -D playwright). Polite by design: one browser, ~1 s between pages, Sheba's robots.txt disallows only /api/.
// Pages through https://www.sheba.co.il/lobbies/clinics-lobby with the "Next" button (like a visitor).
// Output: tools/.cache/lobby.json  [{name, href}]  — contact details (phones / e-mails) are deliberately NOT stored.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CACHE = path.join(__dirname, '..', '.cache');
fs.mkdirSync(CACHE, { recursive: true });
const OUT = path.join(CACHE, 'lobby.json');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (sheba-parking-guide research; low volume)', locale: 'he-IL' });
  await ctx.route('**/*', r => {
    const t = r.request().resourceType(), u = r.request().url();
    if (['image', 'media', 'font'].includes(t) || !u.includes('sheba.co.il')) return r.abort();
    return r.continue();
  });
  const p = await ctx.newPage();
  await p.goto('https://www.sheba.co.il/lobbies/clinics-lobby', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('sheba-c41_1-clinics-on-department-item', { timeout: 30000 });
  await p.waitForTimeout(2000);

  const read = () => p.evaluate(() => [...document.querySelectorAll('sheba-c41_1-clinics-on-department-item')].map(el => {
    const a = el.querySelector('a');
    const span = el.querySelector('span');
    return { name: (span ? span.textContent : '').replace(/\s+/g, ' ').trim(), href: a ? a.getAttribute('href') : null };
  }));

  const all = [];
  const seen = new Set();
  let page = 1;
  while (true) {
    const items = await read();
    for (const it of items) { const k = it.href + '|' + it.name; if (!seen.has(k)) { seen.add(k); all.push({ ...it, page }); } }
    console.log('page', page, 'items', items.length, 'total', all.length);
    fs.writeFileSync(OUT, JSON.stringify(all, null, 1));
    const canNext = await p.evaluate(() => {
      const bs = [...document.querySelectorAll('button')].filter(b => /Next/.test(b.textContent));
      const b = bs.find(x => x.offsetParent) || bs[0];
      return !!b && !b.disabled && !/bg-\[#F3F0F4\]/.test(b.className);
    });
    if (!canNext) break;
    const firstBefore = items[0]?.name;
    await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => /Next/.test(b.textContent)); (bs.find(x => x.offsetParent) || bs[0]).click(); });
    try { await p.waitForFunction(prev => { const s = document.querySelector('sheba-c41_1-clinics-on-department-item span'); return s && s.textContent.replace(/\s+/g, ' ').trim() !== prev; }, firstBefore, { timeout: 10000 }); }
    catch { console.log('no change after click; stopping'); break; }
    await p.waitForTimeout(1200);
    page++;
    if (page > 120) break;
  }
  console.log('DONE', all.length);
  await b.close();
})();
