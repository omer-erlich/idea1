import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CampusRouter, TIP_BONUS_CAP_MIN } from '../js/engine/campus-router.js';
import { parseWhen } from '../js/engine/time.js';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const sheba = read('data/sheba.json');
const topo = read('data/topology.json');
const dest = sheba.destinations.find(d => d.id === 'mri');
const night = parseWhen('sun-22:00'), noon = parseWhen('sun-12:00');
const tipsFile = read('data/local-tips.json');

// find an official lot whose route to MRI uses a public door, and make a tip out of it
function fixture(mutate) {
  const T = structuredClone(topo);
  mutate?.(T);
  const R = new CampusRouter(T, sheba);
  for (const p of sheba.parkings.filter(x => x.official)) {
    const o = R.recommend(dest.topoNode, dest, night, { limit: 50 }).options.find(x => x.parking.id === p.id);
    const door = o?.path.nodeIds.map(id => R.nodes.get(id)).find(n => n.kind === 'entrance' && n.publicAccess === 'yes');
    if (door) return { T, p, door };
  }
  return null;
}
const tipFor = (p, door, extra = {}) => ({ id: 'tip-test', destinations: ['mri'], parking: p.id, entrance: door.id, when: [{ days: [0, 1, 2, 3, 4, 5, 6], from: '19:00', to: '06:00' }], bonusMin: 4, provenance: 'owner', confidence: 'low', status: 'unverified', noteHe: 'בדיקה', ...extra });
const score = (R, pid, when, tips) => R.recommend(dest.topoNode, dest, when, { limit: 50, tips }).options.find(o => o.parking.id === pid);

test('the shipped tips file parses and has no personal data', () => {
  assert.ok(Array.isArray(tipsFile.tips));
  for (const t of tipsFile.tips) {
    assert.ok(t.id && t.parking && Array.isArray(t.destinations) && Array.isArray(t.when) && t.when.length, `${t.id} is incomplete`);
    const { parking, entrance, ...text } = t;   // ids (e.g. OSM way numbers) are references, not phone numbers
    assert.ok(!/@|\d{2,3}[-\s]?\d{7}/.test(JSON.stringify(text)), `${t.id} looks like it holds contact details`);
    assert.ok(!/חוקי|מותר/.test(t.noteHe || ''), 'a tip never says a spot is legal/allowed');
  }
});

test('a tip inside its window with a public door that is open (or whose hours are unknown) lowers the score (capped); outside the window it does nothing', () => {
  const f = fixture(T => { for (const n of T.nodes) if (n.kind === 'entrance') n.hours = [{ days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '24:00' }]; });
  assert.ok(f, 'an official lot with a public door on its way to the MRI exists');
  const R = new CampusRouter(f.T, sheba);
  const tip = tipFor(f.p, R.nodes.get(f.door.id), { bonusMin: 99 });
  const base = score(R, f.p.id, night, []), withTip = score(R, f.p.id, night, [tip]);
  assert.ok(withTip.tipOption && withTip.tip.bonusMin === TIP_BONUS_CAP_MIN);
  assert.equal(Math.round((base.score - withTip.score) * 100) / 100, TIP_BONUS_CAP_MIN);
  const day = score(R, f.p.id, noon, [tip]);
  assert.ok(!day.tip && !day.tipOption, 'no tip at noon');
});

test('unknown door hours still get the bonus (with the hours warning); no bonus when the door is known closed now or not public', () => {
  const f = fixture(T => { for (const n of T.nodes) if (n.kind === 'entrance') n.hours = [{ days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '24:00' }]; });
  const un = (() => { const T = structuredClone(f.T); T.nodes.find(n => n.id === f.door.id).hours = null; const R = new CampusRouter(T, sheba); return score(R, f.p.id, night, [tipFor(f.p, f.door)]); })();
  assert.ok(un.tipOption && un.warnings.includes('entrance-hours-unknown'), 'unknown hours: bonus + warning');
  const mk = (patch) => { const T = structuredClone(f.T); Object.assign(T.nodes.find(n => n.id === f.door.id), patch); return new CampusRouter(T, sheba); };
  for (const [patch, reason] of [[{ hours: [{ days: [0, 1, 2, 3, 4, 5, 6], from: '07:00', to: '19:00' }] }, null], [{ publicAccess: 'no' }, null]]) {
    const R = mk(patch);
    const o = score(R, f.p.id, night, [tipFor(f.p, f.door)]);
    // a closed or non-public door is simply not routed through; either way there is never a bonus
    assert.ok(!o || !o.tipOption, JSON.stringify(patch));
    if (reason && o?.tip) assert.equal(o.tip.noBonusReason, reason);
  }
});

test('an unverified tip never removes the official main garage and always keeps the unofficial warning rule', () => {
  const f = fixture(T => { for (const n of T.nodes) if (n.kind === 'entrance') n.hours = [{ days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '24:00' }]; });
  const R = new CampusRouter(f.T, sheba);
  const r = R.recommend(dest.topoNode, dest, night, { tips: [tipFor(f.p, f.door, { bonusMin: 6 })] });
  const main = sheba.parkings.find(p => p.mainOfficial);
  assert.ok(r.options.some(o => o.parking.id === main.id), 'main official garage still offered');
  for (const o of r.options) if (o.tip) assert.equal(o.tip.status, 'unverified');
});
