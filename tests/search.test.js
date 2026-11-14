import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareAliases, rankDests, expandQuery, unitType } from '../js/engine/search.js';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const A = prepareAliases(read('data/search-aliases.json'));
const sheba = read('data/sheba.json');
const clinics = read('data/clinics-directory.json').clinics;
const tests = read('data/tests-directory.json').tests;
// the same candidate list the app builds: main places, clinics not already main places, tests with a title
const list = [
  ...sheba.destinations.map(d => ({ id: d.id, name: d.name, aliases: d.aliases || [], kind: 'dest' })),
  ...clinics.filter(c => !c.inApp).map(c => ({ id: 'c:' + c.id, name: c.name, aliases: [], kind: 'clinic' })),
  ...tests.filter(t => t.title).map(t => ({ id: 't:' + t.slug, name: t.title, aliases: [], kind: 'test' })),
];
const top = (q, n = 5) => rankDests(list, q, A).slice(0, n);

test('"אורתופדיה" lists outpatient clinics before the ward and before the generic outpatient place', () => {
  const r = top('אורתופדיה', 8).map(d => d.name);
  assert.ok(r.length >= 3);
  assert.equal(unitType(r[0]), 'clinic', r[0]);
  const ward = r.findIndex(n => unitType(n) === 'ward'), clinic = r.findIndex(n => unitType(n) === 'clinic');
  assert.ok(ward === -1 || clinic < ward, r.join(' | '));
  assert.ok(r.indexOf('מרפאות אורתופדיה') !== -1 && r.indexOf('מרפאות אורתופדיה') < 3, r.join(' | '));
});

test('asking for the ward ("מחלקה אורתופדית") ranks wards first', () => {
  const r = rankDests(list, 'מחלקת אורתופדיה', A);
  const w = r.findIndex(d => unitType(d.name) === 'ward');
  if (w !== -1) assert.ok(w <= 2, 'ward in the top 3');
});

test('Hebrew transliterations find Latin names: פט סיטי / אם אר איי / סי טי', () => {
  assert.ok(expandQuery('פט סיטי', A).some(e => e.includes('petct')));
  const pet = top('פט סיטי', 6).map(d => d.name).join(' | ');
  assert.match(pet, /PET/i, pet);
  const mri = top('אם אר איי', 3).map(d => d.name).join(' | ');
  assert.match(mri, /MRI/i, mri);
  const ct = top('סי טי', 6).map(d => d.name).join(' | ');
  assert.match(ct, /CT/i, ct);
});

test('Latin queries and plain Hebrew names still work; nothing matches gibberish', () => {
  assert.match(top('mri', 3).map(d => d.name).join(' '), /MRI/i);
  assert.match(top('כתף', 5).map(d => d.name).join(' '), /כתף/);
  assert.equal(rankDests(list, 'zzzzqqq', A).length, 0);
});
