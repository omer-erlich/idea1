const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], locale: 'he-IL', geolocation: { latitude: 32.0477, longitude: 34.8425 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/404|tile|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  const ok = (name, cond, extra = '') => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  const base = 'http://localhost:8080/';
  await p.goto(base, { waitUntil: 'load' }); await p.waitForTimeout(800);

  // search
  await p.fill('#search', 'מכון הלב'); await p.waitForTimeout(200);
  ok('search finds heart center by alias', (await p.$$eval('.dest-row b', els => els.map(e => e.textContent))).some(t => /לב/.test(t)));
  await p.fill('#search', 'אם אר איי'); await p.waitForTimeout(200);
  ok('search finds MRI by Hebrew spelling of MRI', (await p.$$eval('.dest-row b', els => els.map(e => e.textContent))).some(t => /MRI/.test(t)));
  await p.click('.dest-row'); await p.waitForTimeout(1500);
  ok('tap destination → result screen + URL', (await p.evaluate(() => location.search)).includes('dest=mri') && await p.isVisible('#sheet'));
  const lastDest = await p.evaluate(() => localStorage.getItem('spg.lastDest'));
  ok('last destination remembered', lastDest === '"mri"', lastDest);

  // sheet drag
  const box = await p.locator('#sheet-grab').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const state0 = await p.getAttribute('#sheet', 'data-state');
  await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 12; i++) await p.mouse.move(x, y - i * 40, { steps: 2 }); await p.mouse.up();
  await p.waitForTimeout(500);
  const state1 = await p.getAttribute('#sheet', 'data-state');
  ok('drag handle up expands sheet', state0 === 'peek' && state1 === 'full', `${state0} → ${state1}`);
  const box2 = await p.locator('#sheet-grab').boundingBox();
  const y2 = box2.y + box2.height / 2;
  await p.mouse.move(x, y2); await p.mouse.down(); for (let i = 1; i <= 14; i++) await p.mouse.move(x, y2 + i * 45, { steps: 2 }); await p.mouse.up();
  await p.waitForTimeout(500);
  ok('drag handle down collapses sheet', (await p.getAttribute('#sheet', 'data-state')) === 'peek', await p.getAttribute('#sheet', 'data-state'));
  await p.click('#sheet-grab'); await p.waitForTimeout(500);
  ok('tap handle toggles to full', (await p.getAttribute('#sheet', 'data-state')) === 'full');
  const scrollable = await p.$eval('#sheet-more', el => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto');
  ok('details scroll inside full sheet', scrollable);
  await p.click('#sheet-grab'); await p.waitForTimeout(400);

  // switch option via chip
  const first = await p.$eval('#sheet-main .sm-name', e => e.textContent);
  await p.click('#btn-alts'); await p.waitForTimeout(300); ok('alternatives open in the options sheet', await p.isVisible('#alt-list .rchip'));
  await p.click('#alt-list .rchip:nth-child(2)'); await p.waitForTimeout(600);
  const second = await p.$eval('#sheet-main .sm-name', e => e.textContent);
  ok('chip switches option', first !== second, `${first.trim()} → ${second.trim()}`);
  ok('URL records opt=1', (await p.evaluate(() => location.search)).includes('opt=1'));

  // time change via options sheet
  await p.click('#chip-opts'); await p.waitForTimeout(300);
  ok('options modal opens', await p.isVisible('#opts-modal'));
  await p.click('#opts-modal [data-time="23:00"]'); await p.waitForTimeout(500);
  ok('time change updates URL + title', /time=\w{3}-23:00/.test(await p.evaluate(() => location.search)) && /23:00/.test(await p.textContent('#result-when')), await p.textContent('#result-when'));
  await p.click('#opts-modal #opt-accessible'); await p.waitForTimeout(500);
  ok('accessible toggle updates URL', (await p.evaluate(() => location.search)).includes('acc=1'));
  await p.click('#opts-close'); await p.waitForTimeout(300);
  ok('options modal closes; chip shows active options', !(await p.isVisible('#opts-modal')) && (await p.$eval('#chip-opts', e => e.classList.contains('on-dot'))));

  // walking mode
  await p.click('#btn-walk'); await p.waitForTimeout(1200);
  ok('walk screen shows', await p.isVisible('#screen-walk') && (await p.textContent('#walk-text')).length > 3);
  const t1 = await p.textContent('#walk-text');
  await p.click((await p.isVisible('#walk-next')) ? '#walk-next' : '#walk-confirm .btn-primary, #walk-confirm [aria-pressed="true"]'); await p.waitForTimeout(300);
  ok('next advances step', (await p.textContent('#walk-text')) !== t1);
  await p.click('#walk-prev'); await p.waitForTimeout(200);
  ok('prev goes back', (await p.textContent('#walk-text')) === t1);
  await p.click('#walk-exit'); await p.click('#walk-exit'); await p.waitForTimeout(800);
  ok('exit returns to result', await p.isVisible('#sheet') && !(await p.isVisible('#screen-walk')));

  // back button → picker
  await p.click('#res-back'); await p.waitForTimeout(300);
  ok('back returns to search', await p.isVisible('#search') && (await p.evaluate(() => location.search)) === '');

  // deep links
  await p.goto(base + '?dest=er&time=sat-03:00&opt=1', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  ok('deep link opens result with time + opt', await p.isVisible('#sheet') && /03:00/.test(await p.textContent('#result-when')) && (await p.evaluate(() => location.search)).includes('opt=1'));
  await p.goto(base + '?dest=mri&walk=1', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  ok('deep link opens walking mode', await p.isVisible('#screen-walk'));

  // editor + admin load without errors
  await p.goto(base + '?edit=1', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  ok('editor renders', await p.isVisible('#ed-form'));
  await p.goto(base + '?edit=1&kind=parking', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.click('#ed-draft'); await p.waitForTimeout(300);
  ok('editor validation blocks empty parking', /מיקום|שם|כלל|בטיחות/.test(await p.textContent('#ed-errors')), (await p.textContent('#ed-errors')).slice(0, 80));
  await p.goto(base + '?admin=1', { waitUntil: 'load' }); await p.waitForTimeout(800);
  ok('admin page renders (no backend configured)', /Supabase|השרת/.test(await p.textContent('#screen-admin')));
  console.log(errs.length ? errs.join('\n') : 'no page errors');
  await b.close();
})();
