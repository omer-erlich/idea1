// node tests/e2e/navigate.cjs   (needs `npm run serve` on :8080 and Playwright)
// Covers: clinic search, bus mode, "I'm already here" + where-am-I picker, indoor view, walking-mode confirmations, re-routing.
const { chromium, devices } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], locale: 'he-IL', geolocation: { latitude: 32.0458, longitude: 34.8434 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/404|net::|vibrate/.test(m.text())) errs.push('console: ' + m.text()); });
  const ok = (name, cond, extra = '') => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  const wait = ms => p.waitForTimeout(ms);
  const base = 'http://localhost:8080/';

  // --- a clinic that is NOT one of the 28 main destinations
  await p.goto(base, { waitUntil: 'load' }); await wait(1500);
  await p.fill('#search', 'כתף'); await wait(400);
  const rows = await p.$$eval('.dest-row b', els => els.map(e => e.textContent));
  ok('search finds clinics beyond the 28 main places', rows.some(r => /כתף/.test(r)), rows.slice(0, 2).join(' | '));
  await p.click('.dest-row'); await wait(1500);
  const url1 = await p.evaluate(() => location.search);
  ok('clinic destination opens a route with real options', /dest=c:/.test(url1) && (await p.isVisible('#btn-alts')), url1);
  const steps = await p.$$eval('#sheet-more .steps-list li', els => els.map(e => e.textContent));
  ok('steps end with the arrival at the clinic', /הגעתם/.test(steps[steps.length - 1] || ''), (steps[steps.length - 1] || '').slice(0, 60));

  // --- a clinic with no known position: honest message, official link, no fake route
  await p.goto(base + '?dest=c:cancer__oncology__adults-preventive-oncology-clinic', { waitUntil: 'load' }); await wait(1500);
  const txt0 = await p.textContent('#sheet-main');
  ok('clinic without a position says so (no invented route)', /אין עדיין מסלול ממופה|הוראות/.test(txt0) || (await p.$('#sheet-main .sm-name')) !== null, txt0.slice(0, 60));

  // --- bus mode
  await p.goto(base + '?dest=mri&time=sun-10:00', { waitUntil: 'load' }); await wait(1500);
  await p.click('#chip-mode'); await wait(300); await p.click('#mode-row [data-mode="bus"]'); await wait(800);
  await p.click('#btn-alts'); await wait(300);
  const busTags = await p.$$eval('#alt-list .rc-tag', els => els.map(e => e.textContent));
  await p.click('#opts-close'); await wait(200);
  ok('bus mode lists bus stops', busTags.length >= 2 && busTags.every(t => t === 'תחנה'), busTags.join(','));
  ok('bus mode is in the URL', (await p.evaluate(() => location.search)).includes('mode=bus'));
  ok('first step starts at the stop', /מהתחנה/.test(await p.textContent('#sheet-more .steps-list li')));

  // --- "I'm already here": where-am-I picker
  await p.click('#chip-mode'); await wait(300); await p.click('#mode-row [data-mode="here"]'); await wait(600);
  ok('"I\'m already here" opens the where-are-you picker', await p.isVisible('#here-modal'));
  await wait(1500);
  const guesses = await p.$$eval('#here-gps .here-guess', els => els.map(e => e.textContent));
  ok('picker asks GPS by itself and proposes "are you here?" guesses', guesses.length >= 1 && /בתוך|ליד/.test(guesses.join(' ')), guesses.join(' | ').slice(0, 90));
  await p.fill('#here-q', 'מעליות מערביות'); await wait(300);
  ok('picker searches places', (await p.$$('#here-results .here-row')).length >= 1);
  await p.click('#here-results .here-row'); await wait(1000);
  ok('route is computed from the chosen place', !(await p.isVisible('#here-modal')) && /📍/.test(await p.textContent('#sheet-main .sm-name')));
  ok('"from" is a deep link', /mode=here/.test(await p.evaluate(() => location.search)) && /from=tower\/elev-west/.test(await p.evaluate(() => location.search)), await p.evaluate(() => location.search));
  const allIndoor = await p.$$eval('#sheet-more .steps-list li', els => els.every(e => /בפנים|הגעתם/.test(e.textContent)));
  ok('all steps are indoor (GPS not needed)', allIndoor);

  // --- GPS-assisted picker: fix inside the tower offers the building, then floors
  await p.click('#btn-change-here'); await wait(500);
  await p.click('#here-modal [data-act="gps"]'); await wait(1500);
  const gpsRows = await p.$$eval('#here-gps .here-row', els => els.map(e => e.textContent));
  ok('GPS fix suggests the building (and the outdoor spot)', gpsRows.some(r => /בתוך/.test(r)), gpsRows.join(' | ').slice(0, 80));
  await p.click('#here-gps [data-gpsb]'); await wait(300);
  ok('then asks which floor', (await p.$$('#here-modal .seg button')).length >= 3);
  await p.click('#here-modal .seg button:nth-child(2)'); await wait(300);
  ok('then which place on that floor', (await p.$$('#here-modal .here-row')).length >= 2);
  await p.keyboard.press('Escape'); await wait(300);

  // --- indoor view
  await p.click('#btn-indoor'); await wait(400);
  ok('indoor view lists floors and places', await p.isVisible('#indoor-overlay') && /קומה/.test(await p.textContent('#indoor-body')));
  await p.click('#indoor-close');

  // --- walking mode: live-view style confirmations + re-localise
  await p.goto(base + '?dest=mri&time=sun-10:00&mode=here&from=tower/F5/W', { waitUntil: 'load' }); await wait(1500);
  await p.click('#btn-walk'); await wait(1200);
  ok('walking mode starts indoors with a confirmation prompt', await p.isVisible('#walk-confirm') && /רואים|באיזו קומה|נכנסתם/.test(await p.textContent('#walk-confirm')), (await p.textContent('#walk-confirm')).slice(0, 60));
  const t1 = await p.textContent('#walk-text');
  ok('first step rides the elevator down', /רדו/.test(t1), t1);
  ok('elevator step asks which floor you are on', /באיזו קומה/.test(await p.textContent('#walk-confirm')));
  // confirm the expected floor
  await p.click('#walk-confirm .wc-floors [aria-pressed="true"]'); await wait(500);
  ok('confirming the expected floor advances', (await p.textContent('#walk-text')) !== t1);
  // say "I'm not sure where I am" → picker → new route
  await p.click('#walk-lost'); await wait(600);
  ok('"not sure where I am" opens the picker', await p.isVisible('#here-modal'));
  await p.click('#here-modal [data-act="main"]'); await wait(300);
  await p.fill('#here-q', 'מסדרון ראשי'); await wait(300);
  await p.click('#here-results .here-row'); await wait(1500);
  ok('route is recalculated from the new place and walking continues', await p.isVisible('#screen-walk') && !(await p.isVisible('#here-modal')) && /מסדרון ראשי|אגף דימות|הגעתם|אל:/.test(await p.textContent('#walk-text')), (await p.textContent('#walk-text')).slice(0, 60));
  // wrong floor reported
  await p.goto(base + '?dest=mri&time=sun-10:00&mode=here&from=tower/F5/W&walk=1', { waitUntil: 'load' }); await wait(1500);
  await p.click('#walk-confirm .wc-floors button:not([aria-pressed="true"])'); await wait(700);
  ok('reporting a different floor asks where you are on that floor', await p.isVisible('#here-modal'));
  await p.keyboard.press('Escape'); await wait(800);
  ok('cancelling resumes the walk', await p.isVisible('#screen-walk'));

  console.log(errs.length ? errs.join('\n') : 'no page errors');
  await b.close();
})();
