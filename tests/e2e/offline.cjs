const { chromium, devices } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 5'], locale: 'he-IL', serviceWorkers: 'allow' });
  const p = await ctx.newPage();
  const ok = (n, c, x = '') => console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? '  ' + x : ''));

  await p.goto('http://localhost:8080/?dest=mri', { waitUntil: 'load' });
  await p.waitForTimeout(5000);
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(1500);
  ok('service worker controls the page', await p.evaluate(() => !!navigator.serviceWorker.controller));
  const cached = await p.evaluate(async () => {
    const name = (await caches.keys()).find(k => k.startsWith('spg-shell'));
    return (await (await caches.open(name)).keys()).length;
  });
  ok('app shell precached', cached > 30, cached + ' files');

  await ctx.setOffline(true);
  await p.goto('http://localhost:8080/?dest=mri&time=sat-23:00', { waitUntil: 'load' });
  await p.waitForTimeout(2000);
  ok('offline: result screen works', (await p.isVisible('#sheet')) && (await p.$$('#route-chips .rchip')).length >= 2);
  await p.goto('http://localhost:8080/', { waitUntil: 'load' });
  await p.waitForTimeout(1000);
  ok('offline: picker lists destinations', (await p.$$('.dest-row')).length > 20);
  await p.goto('http://localhost:8080/?edit=1', { waitUntil: 'load' });
  await p.waitForTimeout(1000);
  ok('offline: editor opens', await p.isVisible('#ed-form'));
  await ctx.setOffline(false);
  const m = await (await fetch('http://localhost:8080/manifest.webmanifest')).json();
  ok('manifest valid', m.display === 'standalone' && m.icons.length >= 3 && m.lang === 'he');
  await b.close();
})();
