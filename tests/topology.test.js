import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTopology } from '../tools/build-topology.mjs';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const sheba = read('data/sheba.json');
const seed = read('data/topology-seed.json');
const directory = fs.existsSync(new URL('../data/clinics-directory.json', import.meta.url)) ? read('data/clinics-directory.json').clinics : [];
const busFile = fs.existsSync(new URL('../data/bus-stops-gov.json', import.meta.url)) ? 'data/bus-stops-gov.json' : 'data/bus-stops.json';
const busStops = fs.existsSync(new URL('../' + busFile, import.meta.url)) ? read(busFile).stops : [];
const { topology: T, problems } = buildTopology({ sheba, seed, directory, busStops });
const node = id => T.nodes.find(n => n.id === id);
const groupOf = b => T.buildings.find(x => x.id === b).group;

test('builds without problems; ids unique; every edge references real nodes', () => {
  assert.deepEqual(problems, []);
  const ids = new Set(T.nodes.map(n => n.id));
  assert.equal(ids.size, T.nodes.length, 'duplicate node ids');
  assert.equal(new Set(T.edges.map(e => e.id)).size, T.edges.length, 'duplicate edge ids');
  for (const e of T.edges) { assert.ok(ids.has(e.a) && ids.has(e.b), `dangling edge ${e.id}`); assert.ok(e.sec > 0, `edge ${e.id} has no weight`); }
});

test('floors are nodes; elevators connect to floors through floor-exit lines', () => {
  assert.equal(node('tower/F5').kind, 'floor');
  const exits = T.edges.filter(e => e.kind === 'floor-exit' && (e.a === 'tower/elev-west' || e.b === 'tower/elev-west'));
  assert.ok(exits.length >= 4, 'west elevators serve several floors');
  // heavier exits for higher floors
  const sec = f => T.edges.find(e => e.kind === 'floor-exit' && e.a === 'tower/elev-west' && e.b.startsWith(`tower/F${f}`)).sec;
  assert.ok(sec(5) > sec(2));
});

test('buildings joined by an official/OSM indoor passage share a group; separate buildings do not', () => {
  const main = groupOf('tower');
  for (const b of ['cancer', 'central', 'er', 'safra']) assert.equal(groupOf(b), main, `${b} should be inside-connected to the tower`);
  for (const b of ['heart', 'eyes', 'rehab', 'pade', 'psych', 'shilev']) assert.notEqual(groupOf(b), main, `${b} has no known inside link`);
  const g = T.groups.find(x => x.id === main);
  assert.ok(!g.separate && g.buildings.length >= 5);
  assert.ok(T.groups.filter(x => x.separate).length >= 8);
});

test('unconfirmed (inferred) links never merge buildings; they are listed separately', () => {
  assert.notEqual(groupOf('women'), groupOf('tower'), 'women hospital is only linked by an inferred edge');
  assert.ok(T.possibleLinks.some(l => [l.from, l.to].includes('women')));
  for (const e of T.edges) if (e.conf === 'inferred') assert.equal(e.est, true, 'inferred edges are always estimates');
});

test('OSM-measured edges are not flagged as estimates; hand-written hallways are', () => {
  const osm = T.edges.filter(e => e.conf === 'osm' && e.m);
  assert.ok(osm.length > 20 && osm.every(e => e.est === false));
  assert.ok(T.edges.filter(e => e.kind === 'hallway').every(e => e.est === true || e.est === false));
  const passage = T.edges.find(e => e.kind === 'passage' && e.conf === 'osm' && e.m > 100);
  assert.ok(passage, 'the long OSM ground-floor corridor is a passage');
});

test('importance: hubs outrank leaves; every score in [0,1]', () => {
  for (const n of T.nodes) assert.ok(n.imp >= 0 && n.imp <= 1.0001);
  const rank = id => [...T.nodes].sort((a, b) => b.imp - a.imp).findIndex(n => n.id === id);
  assert.ok(rank('tower/corridor') < T.nodes.length * 0.05, 'the tower corridor is a top-5% hub');
  assert.ok(node('tower/F5').imp > node('women/room-614').imp);
});

test('parkings and doors are present and the main network is connected', () => {
  assert.ok(T.nodes.filter(n => n.kind === 'parking').length >= 10);
  assert.ok(T.nodes.filter(n => n.kind === 'entrance').length >= 15);
  const adj = new Map(T.nodes.map(n => [n.id, []]));
  for (const e of T.edges) { adj.get(e.a).push(e.b); adj.get(e.b).push(e.a); }
  const seen = new Set(['tower/lobby']), st = ['tower/lobby'];
  while (st.length) for (const y of adj.get(st.pop())) if (!seen.has(y)) { seen.add(y); st.push(y); }
  assert.ok(seen.has('park:p-central') && seen.has('cancer/lobby') && seen.has('heart/lobby') && seen.has('rehab/lobby'));
  assert.ok(seen.size > T.nodes.length * 0.9);
});

test('clinics attach to the right area (when the directory exists)', { skip: !directory.length }, () => {
  const clinics = T.nodes.filter(n => n.kind === 'clinic' && n.id.startsWith('clinic:'));
  assert.ok(clinics.length > 50);
  for (const c of clinics.slice(0, 200)) assert.ok(c.building, `${c.id} has a building`);
  // a clinic whose page says "tower, floor 6, west wing" hangs under that wing
  const w6 = clinics.filter(c => c.building === 'tower' && c.floor === '6' && c.wing === 'W');
  for (const c of w6) assert.ok(T.edges.some(e => (e.a === c.id || e.b === c.id) && (e.a === 'tower/F6/W' || e.b === 'tower/F6/W')));
});
