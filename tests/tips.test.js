import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, at } from './fixture.js';
import { applyTips } from '../js/data.js';
import { Engine } from '../js/engine/recommend.js';
import { buildGraph, findPath } from '../js/engine/router.js';

test('an approved crowd shortcut (new door + passage) improves routes', () => {
  const base = makeFixture();
  const before = findPath(buildGraph(base), 'P_east', 'mri', at(10));
  // a tip: new public door on the east side, reached by a short path from the east lot's junction
  const tips = [
    { id: 't1', kind: 'entrance', payload: { id: 'ent_east_new', name: 'דלת אפורה משמאל לרמפה', buildingId: 'b1', publicAccess: 'yes', hours: null, lat: 32.04605, lon: 34.8445 }, approved_at: new Date().toISOString() },
    { id: 't2', kind: 'path', payload: { id: 'path_t2', wheelchair: true, points: [
      { lat: 32.04615, lon: 34.8448, nodeId: 'j_e' },
      { lat: 32.04605, lon: 34.8445, entranceId: 'ent_east_new' },
      { lat: 32.04615, lon: 34.8442, nodeId: 'mri', indoor: true },
    ] }, approved_at: new Date().toISOString() },
  ];
  const data = applyTips(base, tips);
  const after = findPath(buildGraph(data), 'P_east', 'mri', at(10));
  assert.ok(after.seconds < before.seconds, `${after.seconds} < ${before.seconds}`);
  assert.ok(after.nodeIds.includes('path_t2:pt1'));
});

test('a crowd parking inside a safety zone is still excluded', () => {
  const tips = [{ id: 't3', kind: 'parking', payload: { id: 'p_tip_bay', name: 'tip', type: 'street', lat: 32.0458, lon: 34.8439, rules: [{ days: [0,1,2,3,4,5,6], from: '00:00', to: '24:00', status: 'ok' }] }, approved_at: new Date().toISOString() }];
  const data = applyTips(makeFixture(), tips);
  const r = new Engine(data).recommend('mri', at(12), { limit: 20 });
  assert.ok(!r.options.some(o => o.parking.id === 'p_tip_bay'));
  assert.equal(r.excluded.find(x => x.parking.id === 'p_tip_bay').code, 'safety');
});
