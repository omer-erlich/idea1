import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = f => JSON.parse(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const tests = read('data/tests-directory.json').tests;
const clinics = new Map(read('data/clinics-directory.json').clinics.map(c => [c.id, c]));

test('tests carry a title and only real clinic links', () => {
  assert.ok(tests.length >= 200);
  assert.ok(tests.filter(t => t.title).length >= 200, 'most tests have a Hebrew title');
  for (const t of tests) {
    assert.ok(Array.isArray(t.clinicIds));
    for (const id of t.clinicIds) assert.ok(clinics.has(id), `${t.slug} links to unknown clinic ${id}`);
  }
});

test('site-wide banner links are not treated as "where the test is performed"', () => {
  const n = new Map();
  for (const t of tests) for (const id of t.clinicIds) n.set(id, (n.get(id) || 0) + 1);
  for (const [id, c] of n) assert.ok(c <= Math.max(30, tests.length * 0.3), `${id} is linked from ${c} tests – looks like navigation, not a location`);
  assert.ok(tests.some(t => t.clinicIds.length), 'some tests are linked');
  assert.ok(tests.some(t => !t.clinicIds.length), 'unlinked tests stay unlinked (nothing invented)');
});
