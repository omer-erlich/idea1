import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocation, parseFloor } from '../tools/lib/parse-location.mjs';

test('floor parsing, including the RTL "1-" quirk', () => {
  assert.equal(parseFloor('קומה 1-'), '-1');
  assert.equal(parseFloor('קומה -2'), '-2');
  assert.equal(parseFloor('קומה 6'), '6');
  assert.equal(parseFloor('קומת כניסה'), '0');
  assert.equal(parseFloor('קומת הקרקע'), '0');
  assert.equal(parseFloor('קומה ראשונה'), '1');
  assert.equal(parseFloor('בלי קומה'), null);
});

test('building + floor + wing from real location texts', () => {
  let r = parseLocation('מגדל האשפוז, אגף מערבי, קומה 6 פירוט דרכי הגעה Waze');
  assert.deepEqual([r.building, r.floor, r.wing, r.quality], ['tower', '6', 'W', 'building+floor']);
  r = parseLocation('בית חולים לנשים ויולדות, קומת כניסה, בהמשך למיון יולדות פירוט דרכי הגעה Waze');
  assert.deepEqual([r.building, r.floor], ['women', '0']);
  r = parseLocation('בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 3');
  assert.equal(r.building, 'safra', 'earliest mention wins over "מרפאות חוץ"');
  r = parseLocation('בניין השיקום, קומה 1- פירוט דרכי הגעה Waze');
  assert.deepEqual([r.building, r.floor], ['rehab', '-1']);
  r = parseLocation('בניין פסיכיאטריה, מול בניין שיקום המבוגר במקרה חירום ניתן לפנות למיון הפסיכיאטרי');
  assert.equal(r.building, 'psych');
  r = parseLocation('מרכז הסרטן, קומה 3');
  assert.deepEqual([r.building, r.floor], ['cancer', '3']);
});

test('falls back to the directions link, then to the Waze text; otherwise unknown', () => {
  let r = parseLocation('', { links: [{ text: 'דרכי הגעה', href: '/general/directions-clinics/directions-cancer-center' }] });
  assert.deepEqual([r.building, r.via, r.quality], ['cancer', 'directions-link', 'building']);
  r = parseLocation(null, { links: [{ text: 'Waze', href: 'https://waze.com/ul?q=שיבא מרכז הלב' }] });
  assert.deepEqual([r.building, r.via], ['heart', 'waze-query']);
  r = parseLocation('', {});
  assert.deepEqual([r.building, r.quality], [null, 'none']);
});

test('real-world phrasings: single-yod "בנין", "חניון הצומת", adjacency is not containment', () => {
  assert.equal(parseLocation('בנין מעבדות, קומה ראשונה מעל מרפאות המופיליה').building, 'labs');
  let r = parseLocation('לחונים בחניון הצומת: קומה 4, פרוזדור מכונים ומרפאות, פנייה ראשונה שמאלה');
  assert.deepEqual([r.building, r.floor], ['central', '4']);
  assert.equal(parseLocation('מכון נפרולוגיה, בצמוד למרפאות החוץ (כניסה נפרדת)').building, null, 'adjacent to the outpatient clinics ≠ inside the tower');
  assert.equal(parseLocation('מגדל אשפוז, אגף שימות. מהלובי הראשי ממשיכים ישר.').building, 'tower');
  assert.equal(parseLocation('בניין פסיכיאטריה, מול בניין שיקום המבוגר').building, 'psych');
  assert.equal(parseLocation('מרכז מירב').building, 'tower');
});

test('an unidentified location sentence is not overridden by a fallback page', () => {
  const links = [{ text: 'דרכי הגעה', href: '/general/directions-clinics/directions-tissue-typing-lab' }];
  const r = parseLocation('בניין וואהל (צמוד לבניין המעבדות), קומת כניסה', { links });
  assert.equal(r.building, null);
  assert.equal(r.floor, '0');
  assert.equal(parseLocation('', { links }).building, 'tower');
});
