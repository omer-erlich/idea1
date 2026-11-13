// Quick CLI: node tools/try.mjs mri 22:00 [accessible]
import fs from 'node:fs';
import { Engine } from '../js/engine/recommend.js';
import { parseWhen } from '../js/engine/time.js';
const [dest = 'mri', time = '10:00', acc] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(new URL('../data/sheba.json', import.meta.url)));
const eng = new Engine(data);
const r = eng.recommend(dest, parseWhen(time), { accessible: acc === 'accessible' });
console.log('==', r.destination?.name, time, acc || '');
for (const o of r.options) {
  console.log(`* ${o.parking.name} | ${o.walkMinutes ?? '?'} min, ${o.meters ?? '?'} m | ${o.status} | entrance: ${o.entrance?.name || '-'} | ${o.warnings?.join(',')}${o.fallback ? ' | FALLBACK' : ''}`);
  for (const s of o.steps || []) console.log('     ', s.indoor ? '[in] ' : '[out]', s.text);
}
console.log('excluded:', r.excluded.map(x => `${x.parking.name}:${x.code}`).join(' | '));
