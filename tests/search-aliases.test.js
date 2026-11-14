import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../data/search-aliases.json', import.meta.url), 'utf8'));
const HEBREW = /[֐-׿]/;
const LATIN = /[A-Za-z]/;

test('search-aliases.json loads with the expected shape', () => {
  assert.ok(data.meta && data.meta.source && data.meta.generated);
  assert.ok(Array.isArray(data.latin) && data.latin.length > 0);
  assert.ok(Array.isArray(data.words) && data.words.length > 0);
  assert.ok(Array.isArray(data.intent.outpatientWords));
  assert.ok(Array.isArray(data.intent.inpatientWords));
  assert.ok(Array.isArray(data.intent.specialties));
});

test('every latin he variant is non-empty Hebrew without Latin letters', () => {
  for (const entry of data.latin) {
    assert.ok(Array.isArray(entry.he) && entry.he.length > 0, `${entry.canonical} has no he variants`);
    for (const v of entry.he) {
      assert.equal(typeof v, 'string', `${entry.canonical}: variant not a string`);
      assert.ok(v.trim().length > 0, `${entry.canonical}: empty variant`);
      assert.ok(HEBREW.test(v), `${entry.canonical}: "${v}" has no Hebrew letters`);
      assert.ok(!LATIN.test(v), `${entry.canonical}: "${v}" contains Latin letters`);
    }
  }
});

test('word entries are non-empty Hebrew and have equals', () => {
  for (const w of data.words) {
    assert.ok(typeof w.he === 'string' && HEBREW.test(w.he) && !LATIN.test(w.he), `word "${w.he}" is not pure Hebrew`);
    assert.ok(Array.isArray(w.equals) && w.equals.length > 0, `word "${w.he}" has no equals`);
  }
});

test('no duplicate canonical forms', () => {
  const seen = new Set();
  for (const entry of data.latin) {
    const key = entry.canonical.toLowerCase();
    assert.ok(!seen.has(key), `duplicate canonical: ${entry.canonical}`);
    seen.add(key);
  }
});

test('MRI and PET CT are present', () => {
  const canon = data.latin.map(e => e.canonical);
  assert.ok(canon.includes('MRI'), 'MRI missing');
  assert.ok(canon.includes('PET CT'), 'PET CT missing');
  const pet = data.latin.find(e => e.canonical === 'PET CT');
  assert.ok(pet.he.includes('פט סי טי'), 'PET CT should match פט סי טי');
  const mri = data.latin.find(e => e.canonical === 'MRI');
  assert.ok(mri.he.includes('אם אר איי'), 'MRI should match אם אר איי');
});
