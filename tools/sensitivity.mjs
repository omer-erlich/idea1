#!/usr/bin/env node
// How much do the ESTIMATED edge weights matter?  Multiplies every est:true weight by a random 0.5–2x, many times,
// and counts how often the top recommended parking lot (or the shape of the route) changes. If it rarely changes,
// measuring seconds is low priority and the LINKS (which doors/passages exist and are open) matter more.
//   node tools/sensitivity.mjs [trials=40]
import fs from 'node:fs';
import { CampusRouter } from '../js/engine/campus-router.js';
import { parseWhen } from '../js/engine/time.js';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const sheba = read('data/sheba.json'), topo = read('data/topology.json');
const trials = +(process.argv[2] || 40);
const when = parseWhen('sun-10:00');
let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

const dests = sheba.destinations.filter(d => d.topoNode && d.id !== 'child-development');
const top = R => Object.fromEntries(dests.map(d => { const o = R.recommend(d.topoNode, d, when).options.filter(x => !x.fallback)[0]; return [d.id, { p: o?.parking.id, nodes: o?.path.nodeIds.join('>') }]; }));
const base = top(new CampusRouter(topo, sheba));
let lotChanged = 0, routeChanged = 0, n = 0; const perDest = {};
for (let i = 0; i < trials; i++) {
  const T = structuredClone(topo);
  for (const e of T.edges) if (e.est) e.sec = Math.max(1, Math.round(e.sec * Math.exp((rnd() * 2 - 1) * Math.log(2))));   // log-uniform 0.5–2x
  const cur = top(new CampusRouter(T, sheba));
  for (const d of dests) {
    n++;
    if (cur[d.id].p !== base[d.id].p) { lotChanged++; perDest[d.id] = (perDest[d.id] || 0) + 1; }
    if (cur[d.id].nodes !== base[d.id].nodes) routeChanged++;
  }
}
const pct = x => (100 * x / n).toFixed(1) + '%';
console.log(`${trials} trials × ${dests.length} destinations (all estimated weights scaled 0.5–2x)`);
console.log(`top parking lot changed: ${pct(lotChanged)}   walking route (node sequence) changed: ${pct(routeChanged)}`);
const worst = Object.entries(perDest).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} ${(100 * v / trials).toFixed(0)}%`);
console.log('most sensitive destinations:', worst.join(', ') || 'none');
