import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CampusRouter } from '../js/engine/campus-router.js';
import { parseWhen, windowMatches } from '../js/engine/time.js';
import { scout, GENERATED_BONUS_MAX, BANDS, lotSafety, unsafeDoors, pathSafety, ownerVerifiedDoors } from '../tools/scout-routes.mjs';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const sheba = read('data/sheba.json');
const topo = read('data/topology.json');
const hand = read('data/local-tips.json').tips;
const gen = read('data/local-tips.generated.json').tips;
const report = read('data/route-scout.json');
const osmRaw = fs.existsSync(new URL('../tools/.cache/osm-raw.json', import.meta.url)) ? read('tools/.cache/osm-raw.json') : null;
const R = new CampusRouter(topo, sheba);
const UNSAFE = new Set(Object.keys(report.unsafeDoors));
const destById = new Map(sheba.destinations.map(d => [d.id, d]));
const UNOFFICIAL = 'טיפ לא רשמי – על אחריותך, בדוק שילוט במקום';

test('scout covers every destination × every band', () => {
  assert.equal(report.destinations.length, sheba.destinations.length);
  for (const d of report.destinations) for (const b of BANDS) assert.ok(d.bands?.[b.id], `${d.destination}/${b.id} missing`);
});

test('generated tips use the hand-tips schema, provenance osm-scout, bonus ≤ cap, no personal data, never "legal"', () => {
  for (const t of gen) {
    assert.ok(t.id && t.parking && t.entrance && Array.isArray(t.destinations) && t.destinations.length && Array.isArray(t.when) && t.when.length, `${t.id} incomplete`);
    assert.equal(t.provenance, 'osm-scout');
    assert.equal(t.status, 'unverified');
    assert.ok(['low', 'medium'].includes(t.confidence));
    assert.ok(t.bonusMin >= 1 && t.bonusMin <= GENERATED_BONUS_MAX, `${t.id} bonus ${t.bonusMin}`);
    const { parking, entrance, scout: _s, ...text } = t;
    assert.ok(!/@|\d{2,3}[-\s]?\d{7}/.test(JSON.stringify(text)), `${t.id} looks like it holds contact details`);
    assert.ok(!/חוקי|מותר/.test(t.noteHe), `${t.id} must not call a spot legal/allowed`);
    const p = sheba.parkings.find(x => x.id === t.parking);
    if (!p.official) assert.ok(t.noteHe.includes(UNOFFICIAL), `${t.id} unofficial lot without the warning`);
  }
});

test('every generated tip references real graph nodes, a public safe door and a safe lot', () => {
  for (const t of gen) {
    assert.ok(R.nodes.has(`park:${t.parking}`), `${t.id}: lot not in graph`);
    const door = R.nodes.get(t.entrance);
    assert.ok(door && door.kind === 'entrance', `${t.id}: door not in graph`);
    assert.equal(door.publicAccess, 'yes', `${t.id}: door not known public`);
    assert.ok(!UNSAFE.has(t.entrance), `${t.id}: unsafe door`);
    for (const id of t.destinations) assert.ok(destById.has(id) && R.nodes.has(destById.get(id).topoNode), `${t.id}: unknown destination ${id}`);
    const p = sheba.parkings.find(x => x.id === t.parking);
    assert.deepEqual(lotSafety(p, sheba), [], `${t.id}: lot has safety problems`);
  }
});

test('no option or candidate touches an emergency / ambulance door, a disabled zone lot or a helipad', () => {
  const badLots = new Set(sheba.parkings.filter(p => lotSafety(p, sheba).length).map(p => p.id));
  assert.ok(badLots.has('p-osm-295696976'), 'the lot overlapping the disabled zone is flagged');
  for (const d of report.destinations) for (const b of BANDS) {
    const c = d.bands[b.id];
    for (const o of [...c.options, ...c.candidates]) {
      assert.ok(!badLots.has(o.parking), `${d.destination}/${b.id}: unsafe lot ${o.parking}`);
      for (const door of [o.entrance, ...(o.doors || [])]) assert.ok(!door || !UNSAFE.has(door), `${d.destination}/${b.id}: unsafe door ${door}`);
      assert.ok(!o.warnings.some(w => /ambulance|helipad|fire/.test(w)), `${d.destination}/${b.id}: ${o.warnings}`);
    }
  }
});

const ER = 'door:ent-osm-4983837917';
const fakeOsm = extra => ({ nodes: new Map([[4983837917, { id: 4983837917, tags: { entrance: 'emergency', emergency: 'emergency_ward_entrance' } }], ...extra]), ways: new Map() });
test('owner-verified ER door is allowed; other emergency-tagged doors and the ambulance bay itself stay blocked', () => {
  // (1) owner 2026-11-14: the ER entrance is public – allowed even though OSM tags it as an emergency-ward entrance
  assert.ok(ownerVerifiedDoors(sheba).has(ER), 'ER door is owner-verified in sheba.json');
  assert.ok(!UNSAFE.has(ER), 'owner-verified ER door is not on the unsafe list');
  assert.ok(!unsafeDoors(R, sheba, fakeOsm([])).has(ER), 'OSM emergency tag does not block the owner-verified door');
  // without the owner verification the same door is blocked again
  const unverified = structuredClone(sheba);
  unverified.entrances.find(e => e.nodeId === ER).prov.verified = false;
  assert.ok(unsafeDoors(new CampusRouter(topo, unverified), unverified, fakeOsm([])).has(ER), 'not owner-verified → blocked');
  // (2) any OTHER door carrying an emergency / ambulance tag is still blocked
  const other = [...R.nodes.values()].find(n => n.kind === 'entrance' && n.id !== ER && /node\/\d+/.test(n.src || ''));
  const oid = +/node\/(\d+)/.exec(other.src)[1];
  for (const tags of [{ emergency: 'emergency_ward_entrance' }, { entrance: 'emergency' }, { emergency: 'ambulance_station' }]) {
    assert.ok(unsafeDoors(R, sheba, fakeOsm([[oid, { id: oid, tags }]])).has(other.id), `${other.id} with ${JSON.stringify(tags)} must be blocked`);
  }
  // (3) the ambulance bay zone is still excluded: a route through it that does not use the owner-verified door is rejected,
  //     and a lot overlapping an ambulance bay is rejected
  const bay = sheba.safetyZones.find(z => z.kind === 'ambulance_bay');
  assert.ok(bay, 'ambulance bay zone still present');
  const fakeOpt = ids => ({ path: { nodeIds: ids }, coords: [[bay.center[0] - 0.0003, bay.center[1]], [bay.center[0] + 0.0003, bay.center[1]]] });
  assert.ok(pathSafety(R, fakeOpt(['x', 'y']), new Map(), sheba.safetyZones, ownerVerifiedDoors(sheba)).rej.some(r => r.includes(bay.prov.osm)), 'walk across the bay without the ER door is rejected');
  assert.equal(pathSafety(R, fakeOpt(['x', ER]), new Map(), sheba.safetyZones, ownerVerifiedDoors(sheba)).rej.length, 0, 'final approach to the owner-verified door is allowed');
  const [la, lo] = bay.center, sq = [[la - 1e-4, lo - 1e-4], [la - 1e-4, lo + 1e-4], [la + 1e-4, lo + 1e-4], [la + 1e-4, lo - 1e-4], [la - 1e-4, lo - 1e-4]];
  const withPoly = { ...sheba, safetyZones: [...sheba.safetyZones, { id: 'test-bay', kind: 'ambulance_bay', polygon: sq, prov: { osm: 'test' } }] };
  assert.ok(lotSafety({ id: 'p-test', lat: la, lon: lo, outline: sq }, withPoly).length > 0, 'lot on an ambulance bay is rejected');
  // generated report: no option carries an ambulance warning
  for (const d of report.destinations) for (const b of BANDS) for (const o of d.bands[b.id].options) assert.ok(!o.warnings.some(w => /ambulance/.test(w)), `${d.destination}/${b.id}`);
});

test('the official main garage is always offered where it can be reached', () => {
  const main = sheba.parkings.find(p => p.mainOfficial);
  for (const d of report.destinations) for (const b of BANDS) {
    const c = d.bands[b.id];
    if (!c.default) continue;
    assert.ok(c.options.some(o => o.parking === main.id), `${d.destination}/${b.id}: main garage missing`);
  }
});

test('hand tips win: no generated tip where a hand tip covers the destination and band; app order keeps the hand tip first', () => {
  for (const t of gen) {
    const band = BANDS.find(b => t.id.endsWith('-' + b.id));
    for (const h of hand) {
      if (!t.destinations.some(x => h.destinations.includes(x))) continue;
      const covered = band.samples.some(s => h.when.some(w => windowMatches(w, parseWhen(s))));
      assert.ok(!covered, `${t.id} overlaps hand tip ${h.id}`);
    }
  }
  const mri = destById.get('mri');
  const top = R.recommend(mri.topoNode, mri, parseWhen('sun-23:00'), { tips: [...hand, ...gen] }).options[0];
  assert.equal(top.tip?.id, 'tip-mri-night');
});

test('each generated tip is really applied by the router (bonus given) and keeps the unofficial warning', () => {
  for (const t of gen) {
    const d = destById.get(t.destinations[0]);
    const band = BANDS.find(b => t.id.endsWith('-' + b.id));
    const o = R.recommend(d.topoNode, d, parseWhen(band.samples[1]), { limit: 50, tips: [...hand, ...gen] }).options.find(x => x.parking.id === t.parking);
    assert.ok(o?.tipOption, `${t.id} not applied`);
    assert.ok(o.path.nodeIds.includes(t.entrance));
    if (!o.parking.official) assert.ok(o.warnings.includes('unofficial'));
  }
});

test('router: an unofficial lot without hour rules is used only when a tip names it, and safety still wins over a tip', () => {
  const d = destById.get('sourasky'), when = parseWhen('sun-12:00');
  const lot = 'p-osm-295809986';
  const plain = R.recommend(d.topoNode, d, when, { limit: 50 });
  assert.ok(plain.excluded.some(x => x.parking.id === lot && x.code === 'unknown'));
  const tip = { id: 't', destinations: ['sourasky'], parking: lot, entrance: 'door:ent-osm-4993016092', when: [{ days: [0, 1, 2, 3, 4, 5, 6], from: '07:00', to: '17:00' }], bonusMin: 3, provenance: 'osm-scout', status: 'unverified' };
  const withTip = R.recommend(d.topoNode, d, when, { limit: 50, tips: [tip] }).options.find(x => x.parking.id === lot);
  assert.ok(withTip && withTip.warnings.includes('parking-hours-unknown'));
  const badTip = { ...tip, parking: 'p-osm-295696976', destinations: ['mri'] };
  const mri = destById.get('mri');
  const r = R.recommend(mri.topoNode, mri, when, { limit: 50, tips: [badTip] });
  assert.ok(!r.options.some(o => o.parking.id === 'p-osm-295696976'), 'a tip never revives a lot in a safety zone');
});

test('the committed outputs match a fresh scout run (re-run tools/scout-routes.mjs after data changes)', () => {
  const { tips } = scout({ sheba, topo, handTips: hand, osmRaw });
  assert.deepEqual(tips.map(t => `${t.id}|${t.parking}|${t.entrance}|${t.bonusMin}`), gen.map(t => `${t.id}|${t.parking}|${t.entrance}|${t.bonusMin}`));
});
