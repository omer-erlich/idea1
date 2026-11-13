import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, at } from './fixture.js';
import { Engine } from '../js/engine/recommend.js';
import { buildGraph, findPath } from '../js/engine/router.js';
import { windowMatches, parkingStatusAt, parseWhen } from '../js/engine/time.js';

const ids = r => r.options.map(o => o.parking.id);

test('closed door at night: rear door used by day, avoided at night', () => {
  const G = buildGraph(makeFixture());
  // From the north junction the rear door is the obvious way in.
  const day = findPath(G, 'j_n', 'mri', at(10));
  assert.ok(day.nodeIds.includes('d_rear'), 'day path should use the rear door');
  const night = findPath(G, 'j_n', 'mri', at(22));
  assert.ok(night, 'a night path must still exist');
  assert.ok(!night.nodeIds.includes('d_rear'), 'night path must not pass the closed rear door');
  assert.ok(night.nodeIds.includes('d_main'));
  assert.ok(night.seconds > day.seconds);
});

test('accessible route avoids stairs and is longer', () => {
  const G = buildGraph(makeFixture());
  const normal = findPath(G, 'j1', 'mri', at(10));
  const acc = findPath(G, 'j1', 'mri', at(10), { accessible: true });
  assert.ok(normal.edges.some(u => u.edge.stairs), 'normal route takes the short stairs');
  assert.ok(acc.edges.every(u => !u.edge.stairs), 'accessible route has no stairs');
  assert.ok(acc.nodeIds.includes('j_ramp'));
  assert.ok(acc.seconds > normal.seconds);
});

test('night-only spot is excluded during the day and recommended at night', () => {
  const eng = new Engine(makeFixture());
  const day = eng.recommend('mri', at(10));
  assert.ok(!ids(day).includes('P_night'));
  assert.equal(day.excluded.find(x => x.parking.id === 'P_night').code, 'forbidden');
  const night = eng.recommend('mri', at(23), { limit: 10 });
  assert.ok(ids(night).includes('P_night'), 'night: the lot is allowed');
  // MRI-night scenario: if the rear corridor door is open at night, the small lot next to it wins.
  const data = makeFixture();
  data.entrances.find(x => x.id === 'ent_rear').hours = null;
  const night2 = new Engine(data).recommend('mri', at(23));
  assert.equal(ids(night2)[0], 'P_night');
  assert.equal(night2.options[0].entrance.id, 'ent_rear');
});

test('risky parking is penalised, and excluded with avoidRisky', () => {
  const eng = new Engine(makeFixture());
  const r = eng.recommend('mri', at(10), { limit: 10 });
  const order = ids(r);
  assert.ok(order.indexOf('P_ok') < order.indexOf('P_risky'), 'ok spot ranks above the (slightly closer) risky one');
  const r2 = eng.recommend('mri', at(10), { limit: 10, avoidRisky: true });
  assert.ok(!ids(r2).includes('P_risky'));
});

test('parking inside an ambulance bay is never recommended, at any hour', () => {
  const eng = new Engine(makeFixture());
  for (let h = 0; h < 24; h++) {
    const r = eng.recommend('mri', at(h), { limit: 10 });
    assert.ok(!ids(r).includes('P_bay'), `P_bay recommended at ${h}:00`);
  }
  assert.equal(eng.recommend('mri', at(12), { limit: 10 }).excluded.find(x => x.parking.id === 'P_bay').code, 'safety');
});

test('an entrance that is not known to be public is never used', () => {
  const G = buildGraph(makeFixture());
  const p = findPath(G, 'P_east', 'mri', at(10));
  assert.ok(p, 'there is a public way around');
  assert.ok(!p.nodeIds.includes('d_staff'));
});

test('the official main garage is always offered as a fallback', () => {
  const eng = new Engine(makeFixture());
  const r = eng.recommend('mri', at(10), { limit: 1 });
  assert.equal(r.options.length, 2);
  assert.equal(r.options[1].parking.id, 'P_main');
  assert.ok(r.options[1].fallback);
});

test('steps: generated directions, door names and human notes override', () => {
  const eng = new Engine(makeFixture());
  const r = eng.recommend('mri', at(10), { accessible: true, limit: 10 });
  const o = r.options.find(o => o.parking.id === 'P_ok');
  const texts = o.steps.map(s => s.text);
  assert.ok(texts.some(t => t.includes('עלו ברמפה המקורה')), 'edge note replaces generated text');
  assert.ok(texts.some(t => t.includes('היכנסו ל') && t.includes('הכניסה הראשית')), texts.join(' | '));
  assert.ok(texts[texts.length - 1].startsWith('הגעתם: MRI'));
  assert.ok(o.steps.some(s => s.indoor) && o.steps.some(s => !s.indoor));
});

test('time windows crossing midnight', () => {
  const w = { days: [4], from: '22:00', to: '06:00' }; // starts Thursday night
  assert.ok(windowMatches(w, { day: 4, minutes: 23 * 60 }));
  assert.ok(windowMatches(w, { day: 5, minutes: 5 * 60 }));   // Friday early morning
  assert.ok(!windowMatches(w, { day: 5, minutes: 23 * 60 }));
  assert.ok(!windowMatches(w, { day: 4, minutes: 5 * 60 }));
  const p = makeFixture().parkings.find(p => p.id === 'P_night');
  assert.equal(parkingStatusAt(p, at(6, 59)).status, 'ok');
  assert.equal(parkingStatusAt(p, at(7, 0)).status, 'forbidden');
  assert.deepEqual(parseWhen('thu-22:30'), { day: 4, minutes: 22 * 60 + 30 });
});
