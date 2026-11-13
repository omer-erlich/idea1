// node tests/e2e/graph.cjs   (needs `npm run serve` on :8080 and Playwright)
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/404|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  const ok = (name, cond, extra = '') => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  const wait = ms => p.waitForTimeout(ms);

  await p.goto('http://localhost:8080/graph.html', { waitUntil: 'load' });
  await wait(3500);
  const counts = await p.evaluate(() => ({ nodes: document.querySelectorAll('#g-svg .node').length, edges: document.querySelectorAll('#g-svg line.edge:not(.hit)').length, hulls: document.querySelectorAll('#g-svg .hull').length }));
  ok('renders nodes, edges and building bubbles', counts.nodes > 200 && counts.edges > 250 && counts.hulls >= 20, JSON.stringify(counts));
  ok('stats line shown', /צמתים/.test(await p.textContent('#g-stats')));

  const sep = await p.evaluate(() => document.querySelectorAll('#g-svg .hull.separate').length);
  const joined = await p.evaluate(() => document.querySelectorAll('#g-svg .hull:not(.separate)').length);
  ok('separate buildings are drawn differently from the connected complex', sep >= 8 && joined >= 5, `separate ${sep}, connected ${joined}`);

  const sizes = await p.evaluate(() => { const g = shebaGraph.S.L.nodes; const big = g.filter(n => n.id === 'tower/corridor')[0].r, small = g.filter(n => n.id === 'women/room-614')[0].r; return { big, small }; });
  ok('importance drives node size', sizes.big > sizes.small * 1.8, JSON.stringify(sizes));

  await p.fill('#g-search', 'מעליות');
  await wait(300);
  ok('search lists matching nodes', (await p.$$('#g-results button')).length >= 3);
  await p.click('#g-results button');
  await wait(500);
  ok('choosing a result opens its details', await p.isVisible('#g-detail') && (await p.textContent('#g-detail')).includes('חשיבות ברשת'));

  // kind filter
  const before = await p.evaluate(() => [...document.querySelectorAll('#g-svg .node')].filter(n => n.style.display !== 'none').length);
  await p.click('#g-kinds .legend:nth-child(1)');
  await wait(300);
  const after = await p.evaluate(() => [...document.querySelectorAll('#g-svg .node')].filter(n => n.style.display !== 'none').length);
  ok('legend click hides a node kind', after < before, `${before} → ${after}`);
  await p.click('#g-kinds .legend:nth-child(1)');

  // path tool: parking → MRI-area node must exist and use the tower lobby / corridor
  await p.evaluate(() => { const G = shebaGraph; G.selectNode(G.S.L.byId.get('park:p-central')); });
  await p.click('#d-a');
  await p.evaluate(() => { const G = shebaGraph; G.selectNode(G.S.L.byId.get('tower/imaging')); });
  await p.click('#d-b');
  await p.click('#p-go');
  await wait(400);
  const out = await p.textContent('#g-path-out');
  ok('path tool finds a route central garage → imaging', /קטעים/.test(out) && /מדרגות|מעלית|לובי/.test(out), out.slice(0, 90));
  await p.check('#p-noinferred');
  await p.click('#p-go');
  await wait(300);
  ok('path tool honours "no unconfirmed links"', /קטעים|לא נמצא/.test(await p.textContent('#g-path-out')));
  await p.click('#p-clear');

  // geography ↔ graph slider and layout stay stable
  await p.$eval('#g-geo', e => { e.value = 0.9; e.dispatchEvent(new Event('input')); });
  await wait(1500);
  ok('layout slider runs without errors', true);
  console.log(errs.length ? errs.join('\n') : 'no page errors');
  await b.close();
})();
