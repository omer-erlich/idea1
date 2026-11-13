#!/usr/bin/env node
// Validates data/sheba.json (or a file given as argument). Exit code 1 on errors.
// Also prints the TODO list (placeholders the owner should fill in on site).
import fs from 'node:fs';
import { parseHM } from '../js/engine/time.js';
import { parkingSafetyProblems } from '../js/engine/safety.js';

const file = process.argv[2] || new URL('../data/sheba.json', import.meta.url);
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [], warnings = [], todos = [];
const STATUSES = new Set(['ok', 'paid', 'risky', 'forbidden']);
const ACCESS = new Set(['yes', 'no', 'unknown']);

const uniq = (list, name) => { const s = new Set(); for (const r of list || []) { if (!r.id) errors.push(`${name}: record without id`); else if (s.has(r.id)) errors.push(`${name}: duplicate id ${r.id}`); s.add(r.id); } return s; };
const bIds = uniq(d.buildings, 'buildings');
uniq(d.destinations, 'destinations'); uniq(d.parkings, 'parkings'); uniq(d.entrances, 'entrances');
const nIds = uniq(d.graph?.nodes, 'graph.nodes'); uniq(d.graph?.edges, 'graph.edges');

const checkWindows = (ws, where) => { for (const w of ws || []) {
  if (parseHM(w.from) === null || parseHM(w.to) === null) errors.push(`${where}: bad time ${w.from}-${w.to}`);
  if (w.days && !w.days.every(x => Number.isInteger(x) && x >= 0 && x <= 6)) errors.push(`${where}: bad days`);
} };
const prov = (r, where) => { if (!r.prov) warnings.push(`${where}: no prov`); else if (r.prov.todo) todos.push(`${where}: ${r.prov.todo}`); };

for (const p of d.parkings || []) {
  const w = `parking ${p.id} (${p.name || ''})`;
  for (const r of p.rules || []) if (!STATUSES.has(r.status)) errors.push(`${w}: bad status ${r.status}`);
  checkWindows(p.rules, w); prov(p, w);
  if (p.lat == null && !p.prov?.todo) todos.push(`${w}: no coordinates`);
  const safety = parkingSafetyProblems(p, d.safetyZones);
  if (safety.length && (p.rules || []).some(r => r.status !== 'forbidden') && p.access !== 'private') warnings.push(`${w}: has allowed hours but ${safety.join('; ')} – engine will exclude it`);
}
for (const e of d.entrances || []) {
  const w = `entrance ${e.id} (${e.name || ''})`;
  if (!ACCESS.has(e.publicAccess)) errors.push(`${w}: publicAccess must be yes/no/unknown`);
  if (e.buildingId && !bIds.has(e.buildingId)) warnings.push(`${w}: unknown building ${e.buildingId}`);
  checkWindows(e.hours, w); prov(e, w);
}
for (const x of d.destinations || []) {
  const w = `destination ${x.id} (${x.name})`;
  if (x.buildingId && !bIds.has(x.buildingId)) warnings.push(`${w}: unknown building ${x.buildingId}`);
  if (x.nodeId && !nIds.has(x.nodeId)) warnings.push(`${w}: node ${x.nodeId} missing (run import to attach)`);
  prov(x, w);
}
for (const e of d.graph?.edges || []) {
  if (!nIds.has(e.from) || !nIds.has(e.to)) (e.prov?.source === 'osm' || e.prov?.source === 'generated' ? warnings : errors).push(`edge ${e.id}: dangling ${!nIds.has(e.from) ? e.from : e.to}`);
  checkWindows(e.hours, `edge ${e.id}`);
}
for (const r of d.routeNotes || []) prov(r, `routeNote ${r.id}`);
for (const g of d.gates || []) prov(g, `gate ${g.id}`);

console.log(`errors: ${errors.length}, warnings: ${warnings.length}, todos: ${todos.length}`);
for (const x of errors) console.log('ERROR  ', x);
for (const x of warnings) console.log('warn   ', x);
for (const x of todos) console.log('TODO   ', x);
process.exit(errors.length ? 1 : 0);
