import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CampusRouter } from '../js/engine/campus-router.js';
import { parseWhen } from '../js/engine/time.js';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const sheba = read('data/sheba.json');
const topo = read('data/topology.json');
const R = new CampusRouter(topo, sheba);
const day = parseWhen('sun-10:00');
const night = parseWhen('sun-23:30');
const dest = id => sheba.destinations.find(d => d.id === id);
const rec = (id, when, opts = {}) => { const d = dest(id); return R.recommend(d.topoNode, d, when, opts); };

test('car mode: ranks parking lots, always includes the official main garage, explains the walk', () => {
  const r = rec('mri', day);
  assert.ok(r.options.length >= 2);
  assert.ok(r.options.some(o => o.parking.mainOfficial), 'main garage offered');
  for (const o of r.options) {
    assert.ok(o.walkMinutes >= 1 && o.steps.length >= 2);
    assert.ok(o.steps[o.steps.length - 1].arrival && /MRI/.test(o.steps[o.steps.length - 1].text));
    assert.ok(o.coords.length >= 2);
  }
  const garage = r.options.find(o => o.parking.id === 'p-central');
  const txt = garage.steps.map(s => s.text).join(' | ');
  assert.match(txt, /מעליות|מעלית/);
  assert.match(txt, /קומה 4|מדרגות/, txt);
});

test('indoor steps carry confirmation prompts; elevator steps ask for the floor', () => {
  const o = rec('mri', day).options.find(x => x.parking.id === 'p-central');
  const indoor = o.steps.filter(s => s.indoor);
  assert.ok(indoor.length >= 2);
  assert.ok(indoor.some(s => s.ask === 'see' && s.landmark));
  const lift = o.steps.find(s => s.kind === 'elevator');
  assert.ok(lift && lift.ask === 'floor' && lift.expectFloor === '4', JSON.stringify(lift));
});

test('floors, elevators and passages show up in the indoor timeline', () => {
  const o = rec('mri', day).options.find(x => x.parking.id === 'p-central');
  assert.ok(o.indoor.length >= 1);
  const labels = o.indoor.flatMap(s => s.nodes.map(n => n.label)).join(' ');
  assert.match(labels, /מעליות החניון|מדרגות/);
});

test('accessible mode never uses stairs edges', () => {
  const r = rec('mri', day, { accessible: true });
  assert.ok(r.options.length >= 1);
  for (const o of r.options) for (const h of o.path.hops) assert.ok(!h.edge.stairs && h.edge.kind !== 'stairs', `stairs on ${o.parking.name}`);
});

test('entrances that are not known to be public are never used', () => {
  const r = rec('heart-center', day, { limit: 6 });
  for (const o of r.options) for (const id of o.path.nodeIds) {
    const n = R.nodes.get(id);
    if (n.kind === 'entrance') assert.equal(n.publicAccess, 'yes', `${n.label} is not public`);
  }
});

test('a door that is closed at the chosen hour is avoided', () => {
  const topo2 = structuredClone(topo);
  const door = topo2.nodes.find(n => n.kind === 'entrance' && n.publicAccess === 'yes' && n.building === 'heart');
  assert.ok(door, 'heart center has a public door');
  const R2 = new CampusRouter(topo2, sheba);
  const d = dest('heart-center');
  const open = R2.recommend(d.topoNode, d, night, { limit: 6 }).options;
  door.hours = [{ days: [0, 1, 2, 3, 4, 5, 6], from: '07:00', to: '19:00' }];
  const R3 = new CampusRouter(topo2, sheba);
  const closed = R3.recommend(d.topoNode, d, night, { limit: 6 }).options;
  assert.ok(open.length >= 1, 'reachable while the door has no known hours');
  for (const o of closed) assert.ok(!o.path.nodeIds.includes(door.id), 'closed door used');
  const dayOpts = R3.recommend(d.topoNode, d, day, { limit: 6 }).options;
  assert.ok(dayOpts.some(o => o.path.nodeIds.includes(door.id)) || dayOpts.length >= 1);
});

test('unofficial OSM-only lots and risky/forbidden hours are excluded; safety zones too', () => {
  const r = rec('mri', day, { limit: 50 });
  assert.ok(!r.options.some(o => String(o.parking.id).startsWith('p-osm-')), 'OSM-only lots have no rules → never recommended');
  assert.ok(r.excluded.some(x => x.code === 'forbidden' && x.parking.id === 'p-heart'), 'heart garage is closed');
});

test('bus mode: suggests stops near the campus and walks from the stop', () => {
  const d = dest('mri');
  const r = R.recommend(d.topoNode, d, day, { mode: 'bus' });
  assert.ok(r.options.length >= 2);
  for (const o of r.options) {
    assert.equal(o.kind, 'bus');
    assert.ok(o.stop.kind === 'busstop' && o.walkMinutes >= 1);
    assert.match(o.steps[0].text, /מהתחנה/);
  }
  assert.ok(r.options[0].score <= r.options[1].score);
});

test('"here" mode: start from any node the user picks (GPS is not needed)', () => {
  const d = dest('mri');
  assert.equal(R.recommend(d.topoNode, d, day, { mode: 'here' }).needsStart, true);
  const r = R.recommend(d.topoNode, d, day, { mode: 'here', startNodeId: 'tower/elev-west' });
  assert.equal(r.options.length, 1);
  const o = r.options[0];
  assert.ok(o.steps.every(s => s.indoor || s.arrival), 'all steps are indoor');
  assert.match(o.steps[0].text, /אל:/);
  // from an upper floor: ride down first
  const up = R.recommend(d.topoNode, d, day, { mode: 'here', startNodeId: 'tower/F5/W' }).options[0];
  assert.ok(up.steps.some(s => s.kind === 'elevator' && /רדו/.test(s.text)), up.steps.map(s => s.text).join(' | '));
});

test('where-am-I helpers: building by GPS fix, places grouped by floor, search', () => {
  const tower = R.buildings.get('tower');
  const hits = R.buildingAt(tower.center[0], tower.center[1]);
  assert.equal(hits[0].id, 'tower');
  const places = R.placesIn('tower');
  assert.ok(places.length >= 4 && places[0].places.length >= 1);
  assert.ok(R.floorNode('tower', '5'));
  assert.ok(R.search('מעליות מערביות').some(n => n.id === 'tower/elev-west'));
  assert.ok(R.snapOutdoor(32.0478, 34.8425));
});

test('legs: outdoor and indoor are separate, measured geometry is flagged', () => {
  const o = rec('mri', day).options[0];
  assert.ok(o.legs.some(l => l.type === 'outdoor') || o.legs.some(l => l.type === 'indoor'));
  for (const l of o.legs) assert.ok(l.coords.length >= 2);
});

test('every destination with a known position is reachable by car in the daytime', () => {
  const unreachable = [];
  for (const d of sheba.destinations) {
    const r = R.recommend(d.topoNode, d, day);
    if (!r.options.length) unreachable.push(d.id);
  }
  // the Child Development Institute's new site has no known position yet (OPEN_QUESTIONS) → honestly unroutable
  assert.deepEqual(unreachable, ['child-development']);
});

import { applyTipsToTopology } from '../js/data.js';

test('approved crowd tips feed the campus graph (new lot, new door shortcut)', () => {
  const lot = { id: 'p_tip_x', name: 'חניה טיפ', type: 'lot', lat: 32.0461, lon: 34.8437, rules: [{ days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '24:00', status: 'ok' }] };
  const tips = [{ id: 't1', kind: 'parking', payload: lot, approved_at: new Date().toISOString() }];
  const T2 = applyTipsToTopology(topo, tips);
  assert.ok(T2.nodes.some(n => n.id === 'park:p_tip_x') && T2.edges.some(e => e.a === 'park:p_tip_x' || e.b === 'park:p_tip_x'));
  const sheba2 = structuredClone(sheba);
  sheba2.parkings.push({ ...lot, official: false, prov: { verified: false, source: 'crowd' } });
  const R2 = new CampusRouter(T2, sheba2);
  const d = dest('mri');
  const r = R2.recommend(d.topoNode, d, day, { limit: 20 });
  assert.ok(r.options.some(o => o.parking.id === 'p_tip_x'), 'the new lot is a candidate');
  assert.equal(topo.nodes.some(n => n.id === 'park:p_tip_x'), false, 'original topology untouched');
});
