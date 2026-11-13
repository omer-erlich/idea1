// Renders icons/icon.svg to the PNG sizes needed by the manifest (uses the pre-installed Playwright).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const dir = path.join(__dirname, '..', 'icons'); const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name, size, pad] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 0.14]]) {
    await p.setViewportSize({ width: size, height: size });
    const inner = pad ? `<div style="position:absolute;inset:${pad * 100}%">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>` : svg.replace('<svg ', '<svg width="100%" height="100%" ');
    await p.setContent(`<body style="margin:0;background:#0b5cab;position:relative;width:${size}px;height:${size}px;overflow:hidden">${inner}</body>`);
    await p.screenshot({ path: path.join(dir, name) });
  }
  await b.close();
})();
