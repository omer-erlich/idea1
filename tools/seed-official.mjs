#!/usr/bin/env node
// Seeds facts published on the official Sheba website into data/sheba.json (upsert by id).
// Every record cites its page. Text is paraphrased (short factual directions), not copied.
// Locations inside buildings are NOT published, so destination points are building centres
// (confidence "low") until someone verifies them on site.
//
//   node tools/seed-official.mjs && node tools/import-osm.mjs --from-file tools/.cache/osm-raw.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatData } from './import-osm.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data/sheba.json');
const CHECKED = '2026-11-13';
const ALL = [0, 1, 2, 3, 4, 5, 6];
const D = 'https://www.sheba.co.il/general/directions-clinics/';
const LOC = 'https://www.sheba.co.il/locations';

const site = (url, confidence = 'medium', extra = {}) => ({ verified: false, lastVerified: null, source: 'sheba-site', url, retrieved: CHECKED, confidence, ...extra });
const owner = (todo, extra = {}) => ({ verified: false, lastVerified: null, source: 'owner', confidence: 'placeholder', todo, ...extra });

// ---- buildings (OSM ids) used by destinations
const B = {
  tower: 'b-osm-295696974', cancer: 'b-osm-506825482', heart: 'b-osm-295736233', eyes: 'b-osm-284604143',
  oral: 'b-osm-284604141', safra: 'b-osm-295751889', women: 'b-osm-295693055', er: 'b-osm-295735379',
  ent: 'b-osm-295980683', rehab: 'b-osm-295847809', pade: 'b-osm-295902945', labs: 'b-osm-295751898',
  tzomet: 'b-osm-295696981', shilev: 'b-osm-295849278', bloodbank: 'b-osm-295743535', sourasky: 'b-osm-295831663',
};

// [id, name, aliases, building, floor, hint (paraphrased official in-building directions), source page]
const DESTS = [
  ['mri', 'MRI (תהודה מגנטית)', ['MRI', 'אם אר איי', 'אמ אר איי', 'תהודה מגנטית', 'דימות', 'הדמיה'], 'tower', '0',
    'בכניסה למגדל האשפוז ממשיכים ישר במסדרון, ואז שמאלה לפי השילוט לאגף הדימות. בתוך האגף – עד סוף המסדרון.', 'how-to-reach-mri-test'],
  ['imaging', 'אגף דימות (CT, רנטגן, אולטרסאונד)', ['CT', 'סי טי', 'רנטגן', 'צילום', 'אולטרסאונד', 'US', 'דימות', 'הדמיה'], 'tower', '0',
    'אגף הדימות בקומת הכניסה של מגדל האשפוז: מהלובי הראשי ישר עד שהאגף משמאלכם.', 'directions-imaging-division'],
  ['nuclear-medicine', 'רפואה גרעינית (מיפוי)', ['מיפוי', 'מיפוי עצמות', 'רפואה גרעינית', 'PET', 'פט סיטי'], 'tower', '0',
    'בכניסה למגדל האשפוז ממשיכים ישר במסדרון ואז שמאלה לפי השילוט.', 'directions-nuclear-medicine'],
  ['outpatient', 'מרפאות החוץ (מגדל האשפוז)', ['מרפאות חוץ', 'מרפאות', 'מרפאה פנימית', 'עור', 'אורתופדיה'], 'tower', '0',
    'בכניסה הראשית למגדל האשפוז – שמאלה מיד אחרי עמדת המודיעין.', 'directions-internal-clinics'],
  ['gastro', 'המכון לגסטרואנטרולוגיה', ['גסטרו', 'קולונוסקופיה', 'גסטרוסקופיה', 'עיכול'], 'tower', '0',
    'מרפאות החוץ: שמאלה אחרי המודיעין, ימינה ליד עגלת הקפה, עד אגף 9 ואז שמאלה.', 'directions-gastro-institute'],
  ['neurology-clinics', 'מרפאות נוירולוגיה', ['נוירולוגיה', 'נוירולוג', 'מדעי המוח'], 'tower', '1',
    'מעל מרפאות החוץ, קומה 1 (המרכז למדעי המוח).', 'directions-neurology-clinics'],
  ['autoimmune', 'המרכז למחלות אוטואימוניות', ['אוטואימוני', 'קנביס', 'ראומטולוגיה'], 'tower', '1',
    'מעל מרפאות החוץ, קומה 1: שמאלה אחרי המודיעין, ימינה ליד עגלת הקפה, מעליות משמאל.', 'directions-autoimmune-diseases-center'],
  ['kidney-transplant', 'המרכז להשתלות כליה', ['השתלות', 'השתלת כליה'], 'tower', '-1', null, 'directions-kidney-transplant-center'],
  ['er', 'מיון (רפואה דחופה)', ['מיון', 'חדר מיון', 'רפואה דחופה', 'ER', 'טראומה'], 'er', '0',
    'במצב חירום חייגו 101. אל תחנו בנתיב האמבולנסים.', 'directions-er'],
  ['heart-center', 'מרכז הלב, חזה וכלי דם (מכון הלב)', ['מכון הלב', 'מרכז הלב', 'לב', 'קרדיולוגיה', 'אקו', 'אקו לב', 'צנתור', 'הולטר', 'מיפוי לב'], 'heart', '0', null, 'directions-heart-center'],
  ['vascular', 'מכון כלי דם', ['כלי דם', 'וסקולרי'], 'heart', '2', null, 'directions-vascular-institute'],
  ['cardiac-rehab', 'שיקום לב', ['שיקום לב'], 'heart', '2', null, 'directions-heart-cardiac-rehabilitation'],
  ['cancer-center', 'מרכז הסרטן (אונקולוגיה)', ['סרטן', 'אונקולוגיה', 'המטולוגיה', 'מכון אלה', 'כימותרפיה'], 'cancer', '0',
    'מהלובי הראשי של מגדל האשפוז – ישר עד קצה המסדרון.', 'directions-cancer-center'],
  ['radiotherapy', 'המכון לרדיותרפיה (קרינה)', ['קרינה', 'הקרנות', 'רדיותרפיה'], 'cancer', '0', null, 'directions-radiotherapy-institute'],
  ['eyes', 'מכון עיניים', ['עיניים', 'עיני', 'אופטלמולוגיה', 'מיון עיניים'], 'eyes', '0', null, 'directions-ophthalmology-institute-eyes'],
  ['oral', 'מכון פה ולסת', ['פה ולסת', 'שיניים', 'לסת'], 'oral', '0', 'מול חניון מרכז הסרטן.', 'directions-oral-and-maxillofacial-institute'],
  ['ent', 'אף אוזן גרון (אא"ג)', ['אאג', 'אא"ג', 'אף אוזן גרון', 'שמיעה', 'בדיקת שמיעה'], 'ent', '0', null, 'directions-otolaryngology-clinics-ent'],
  ['safra-children', 'בית החולים לילדים ספרא', ['ילדים', 'ספרא', 'מיון ילדים', 'רפואת ילדים'], 'safra', '0', null, 'directions-safra-childrens-hospital'],
  ['women', 'בית החולים לנשים ויולדות', ['נשים', 'יולדות', 'לידה', 'חדר לידה', 'גינקולוגיה', 'מרפאות נשים'], 'women', '0', null, 'directions-women-maternity-hospital'],
  ['rehab', 'בניין השיקום', ['שיקום', 'בית החולים השיקומי', 'מרפאות שיקום'], 'rehab', '0', null, 'directions-rehab'],
  ['pade', 'בניין פדה לשיקום המבוגר', ['פדה', 'גריאטריה', 'תא לחץ', 'רפואה היפרברית', 'פנימית ב'], 'pade', '0', null, 'directions-pade-building'],
  ['labs', 'אגף המעבדות (מעבדת המטולוגיה)', ['מעבדה', 'מעבדות', 'בדיקות דם', 'המטולוגיה'], 'labs', '0', null, 'directions-hematology-lab'],
  ['blood-bank', 'בנק הדם (מד"א)', ['בנק הדם', 'תרומת דם', 'מדא'], 'bloodbank', '0', null, null],
  ['shilev', 'מלון רפואי שי-לב', ['שי לב', 'מלון החלמה'], 'shilev', '0', null, 'how-to-reach-shilev-hotel'],
  ['sourasky', 'בית סוראסקי', ['סוראסקי'], 'sourasky', '0', null, 'directions-sourasky-house'],
];

const destinations = DESTS.map(([id, name, aliases, b, floor, hint, page]) => ({
  id, name, aliases, buildingId: B[b], floor, hint: hint || null,
  lat: null, lon: null, // filled from the building centre below
  officialUrl: page ? D + page : null,
  prov: site(page ? D + page : 'https://www.openstreetmap.org/', 'low', { note: 'בניין וקומה מאתר שיבא; הנקודה היא מרכז הבניין, המיקום המדויק בפנים לא פורסם' }),
}));
// Each app destination is also a node of the campus graph (data/topology-seed.json) – that is where routing ends.
const TOPO = { mri: 'tower/imaging', imaging: 'tower/imaging', 'nuclear-medicine': 'tower/nuclear', outpatient: 'tower/outpatient', gastro: 'tower/wing-9', 'neurology-clinics': 'tower/F1/L',
  autoimmune: 'tower/F1/L', 'kidney-transplant': 'tower/F-1', er: 'er/lobby', 'heart-center': 'heart/lobby', vascular: 'heart/F2', 'cardiac-rehab': 'heart/F2', 'cancer-center': 'cancer/lobby',
  radiotherapy: 'cancer/lobby', eyes: 'eyes/lobby', oral: 'oral/lobby', ent: 'ent/lobby', 'safra-children': 'safra/lobby', women: 'women/lobby', rehab: 'rehab/lobby', pade: 'pade/lobby',
  labs: 'labs/lobby', 'blood-bank': 'bloodbank/lobby', shilev: 'shilev/lobby', sourasky: 'sourasky/lobby', psychiatry: 'psych/lobby', endocrine: 'endo/F2', 'child-development': 'childdev/lobby' };

// Official sources mention these but OSM has no matching building — coordinates left for the owner.
destinations.push(
  { id: 'psychiatry', name: 'האגף לרפואת הנפש (פסיכיאטריה)', aliases: ['פסיכיאטריה', 'רפואת הנפש', 'מרכז חוה'], buildingId: null, floor: '0', hint: 'בניין חד-קומתי סמוך לבניין השיקום (לפי אתר שיבא).', lat: null, lon: null, officialUrl: D + 'directions-psychiatry', prov: owner('אין בניין מתאים ב-OSM – לסמן מיקום בעורך') },
  { id: 'endocrine', name: 'המכון האנדוקריני (בניין שמוק)', aliases: ['סוכרת', 'אנדוקרינולוגיה', 'עודף משקל', 'שמוק'], buildingId: null, floor: '2', hint: 'בניין סוכרת ואנדוקרינולוגיה, סמוך לחניון המרכזי (לפי אתר שיבא).', lat: null, lon: null, officialUrl: D + 'directions-endocrinology-institute', prov: owner('אין בניין מתאים ב-OSM – לסמן מיקום בעורך') },
  { id: 'child-development', name: 'המכון להתפתחות הילד', aliases: ['התפתחות הילד'], buildingId: null, floor: '0', hint: 'לפי אתר שיבא המכון עבר למיקום חדש ליד מסוף האוטובוסים בכניסה המזרחית (בקו"ם).', lat: null, lon: null, officialUrl: D + 'directions-child-development-institute', prov: owner('OSM מציג את המיקום הישן – לסמן את המיקום החדש בעורך') },
);

// ---- official parking lots (names from sheba.co.il/locations, "איפה חונים?")
// Every lot on the campus costs the same (flat rate for the whole campus) → no per-lot price text; see meta.parkingFlatRate.
const PAID = { days: ALL, from: '00:00', to: '24:00', status: 'paid' };
const parkings = [
  { id: 'p-central', name: 'החניון המרכזי (חניון הצומת)', type: 'garage', official: true, mainOfficial: true, osmRef: 'way/414835764',
    lat: null, lon: null, rules: [PAID], note: 'מקומה 11 ומעלה – למטופלים בלבד. משרד החניה בקומה 4. יש עמדות טעינה בקומת הקרקע.', prov: site(LOC, 'high') },
  { id: 'p-cancer', name: 'חניון מרכז הסרטן', type: 'garage', official: true, osmRef: 'way/295751881', coordsFromOfficial: true,
    lat: 32.046325, lon: 34.845521, rules: [PAID], note: 'מקומה 3 ומעלה – למטופלי אונקולוגיה בלבד.', prov: site(LOC, 'high', { note: 'נקודה מקישור ה-Waze הרשמי באתר שיבא' }) },
  { id: 'p-eyes', name: 'חניון מכון עיניים', type: 'lot', official: true, coordsFromOfficial: true,
    lat: 32.044866, lon: 34.845693, rules: [PAID], note: null, prov: site(LOC, 'high', { note: 'נקודה מקישור ה-Waze הרשמי באתר שיבא' }) },
  { id: 'p-heart', name: 'חניון מרכז הלב', type: 'garage', official: true, osmRef: 'way/295736774',
    lat: null, lon: null, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'forbidden', note: 'סגור זמנית (לפי אתר שיבא, נבדק ' + CHECKED + ')' }], note: null,
    prov: site(LOC, 'low', { note: 'ההתאמה לשטח ב-OSM משוערת' }) },
  { id: 'p-women', name: 'חניון מרכז נשים ויולדות', type: 'lot', official: true, osmRef: 'way/295694762', lat: null, lon: null, rules: [PAID], note: null, prov: site(LOC, 'low', { note: 'ההתאמה לשטח ב-OSM משוערת' }) },
  { id: 'p-shilev', name: 'חניון מלון שי-לב', type: 'lot', official: true, osmRef: 'way/295849257', lat: null, lon: null, rules: [PAID], note: null, prov: site(LOC, 'low', { note: 'ההתאמה לשטח ב-OSM משוערת' }) },
  { id: 'p-rehab', name: 'חניון מרכז השיקום', type: 'garage', official: true, osmRef: 'way/1445706667', lat: null, lon: null, rules: [PAID], note: 'יש עמדות טעינה ליד הכניסה לחניון התת-קרקעי.', prov: site(LOC, 'low', { note: 'ההתאמה לשטח ב-OSM משוערת' }) },
  { id: 'p-south-west', name: 'ריכוז חניות ממערב לשער דרום ולמנחת', type: 'lot', official: true, osmRef: 'way/1092807977', lat: null, lon: null, rules: [PAID], note: 'שער דרום סגור מ-17:30 ובסופי שבוע (לפי אתר שיבא).', prov: site(LOC, 'low', { note: 'ההתאמה לשטח ב-OSM משוערת' }) },
  // official names without a confident location → the owner fills them in
  ...[['p-mda', 'חניון מד"א'], ['p-water', 'חניון מאגר המים (אימהות ואבות)'], ['p-outpatient', 'חניון מרפאות חוץ'], ['p-ent', 'חניון אא"ג'],
    ['p-psych', 'חניון פסיכיאטריה'], ['p-sourasky', 'חניון בית סוראסקי'], ['p-er-lot', 'מגרש החניה הצמוד למיון']]
    .map(([id, name]) => ({ id, name, type: 'lot', official: true, lat: null, lon: null, rules: [PAID], note: null, prov: site(LOC, 'low', { todo: 'מופיע ברשימה הרשמית; המיקום לא ודאי – לסמן בעורך' }) })),
  // ---- the first insider tip (from the owner). Coordinates/hours are TODO on purpose.
  { id: 'p-mri-night', name: 'חניה קטנה ליד מסדרון ה-MRI האחורי', type: 'lot', official: false, lat: null, lon: null,
    rules: [
      { days: ALL, from: '20:00', to: '06:00', status: 'ok', note: 'בלילה – לפי ניסיון (שעות משוערות, לאמת)' },
      { days: ALL, from: '06:00', to: '20:00', status: 'risky', note: 'ביום – עלול להיות דו"ח' },
    ],
    note: 'טיפ לא רשמי', prov: owner('לסמן מיקום מדויק ושעות בעורך (?edit=1)') },
];

const entrances = [
  // Owner tip, best guess (2026-11-14): "back entrance of the MRI building" = OSM node/6925716764 (entrance=service, east wall of the tower,
  // 1 m from the outline, ~197 m from the ER door). The owner says it is public; hours unknown (null). Not confirmed on site.
  { id: 'ent-mri-rear', name: 'כניסה אחורית (קיר מזרחי) – ניחוש לפי טיפ', buildingId: B.tower, nodeId: null, lat: 32.0457421, lon: 34.8438692,
    publicAccess: 'yes', hours: null, wheelchair: true, floor: '0', noLobbyLink: true,
    note: 'ניחוש: צומת OSM 6925716764 (כניסת שירות בקיר המזרחי). לפי הבעלים פתוחה לקהל. לאמת שעות, שילוט והאם מובילה למסדרון הדימות.',
    prov: { verified: false, lastVerified: null, source: 'owner', osm: 'node/6925716764', retrieved: '2026-11-14', confidence: 'low', todo: 'לאמת בשטח שזו הדלת האחורית, שעות ושילוט' } },
];

const gates = [
  { id: 'gate-main', name: 'השער הראשי (שער יולדות / אלוף שדה)', hours: null, note: 'הכניסה הראשית שמופיעה בכל הוראות ההגעה הרשמיות.', prov: site(LOC, 'medium') },
  { id: 'gate-east', name: 'השער המזרחי (בקו"ם)', hours: [{ days: [0, 1, 2, 3, 4], from: '05:00', to: '21:00' }, { days: [5], from: '05:00', to: '13:00' }],
    note: 'סגור מ-21:00 ובסופי שבוע מיום שישי בצהריים (לפי אתר שיבא). שעת הפתיחה בבוקר לא פורסמה – 05:00 משוער.', prov: site(D + 'directions-eating-disorder-center-adults', 'low', { todo: 'לאמת שעת פתיחה ושעה מדויקת ביום שישי' }) },
  { id: 'gate-south', name: 'שער דרום', hours: [{ days: [0, 1, 2, 3, 4], from: '05:00', to: '17:30' }],
    note: 'סגור מ-17:30 ובסופי שבוע (לפי אתר שיבא). שעת הפתיחה בבוקר לא פורסמה – 05:00 משוער.', prov: site(D + 'directions-eating-disorder-center-adults', 'low', { todo: 'לאמת שעת פתיחה' }) },
];

const sources = [
  { id: 'osm', title: 'OpenStreetMap', url: 'https://www.openstreetmap.org/copyright', license: 'ODbL 1.0', retrieved: CHECKED, use: 'בניינים, שבילים, כניסות, חניונים, אזורי בטיחות' },
  { id: 'sheba-locations', title: 'שיבא – הגעה, חנייה ונגישות', url: LOC, license: 'כל הזכויות שמורות לשיבא – נעשה שימוש בעובדות בלבד (שמות חניונים, מחירים, שעות), בניסוח שלנו', retrieved: CHECKED },
  { id: 'sheba-directions', title: 'שיבא – דפי "איך מגיעים" למרפאות', url: D, license: 'כל הזכויות שמורות לשיבא – עובדות בלבד (בניין, קומה), בניסוח מקוצר שלנו, עם קישור למקור', retrieved: CHECKED },
];

// Buildings whose ground floor is used as a public route in the official directions
const PUBLIC_INTERIOR = { tower: 'לובי מגדל האשפוז', cancer: 'מרכז הסרטן', tzomet: 'מרכז הצומת (קומה 4, קומת החנויות)', safra: 'לובי בית החולים ספרא' };
// Indoor passages described on the official site (geometry estimated: straight line x lengthFactor)
const pass = (id, from, to, note, url, extra = {}) => ({ id, from, to, kind: 'passage', indoor: true, stairs: false, wheelchair: true, public: true, hours: null, note,
  lengthFactor: 1.3, ...extra, prov: site(url, 'medium', { note: 'המעבר מתואר באתר שיבא; המסלול המדויק והשעות לא פורסמו' }) });
const passages = [
  pass('pass-central-garage-tzomet', 'park:p-central', 'hub:' + B.tzomet, 'עלו במעלית החניון לקומה 4 (מרכז הצומת – קומת החנויות)', D + 'how-to-reach-mri-test', { extraSeconds: 60, lengthFactor: 1 }),
  pass('pass-tzomet-tower', 'hub:' + B.tzomet, 'hub:' + B.tower, 'מקומה 4 המשיכו לפי השילוט למגדל האשפוז, ובמדרגות או במעלית לקומת הקרקע', D + 'how-to-reach-mri-test', { extraSeconds: 45 }),
  pass('pass-tzomet-safra', 'hub:' + B.tzomet, 'hub:' + B.safra, 'בקומה 4 פנו ימינה למסדרון השמאלי שמחבר לבית החולים ספרא לילדים', D + 'directions-children-clinics'),
  pass('pass-tower-cancer', 'hub:' + B.tower, 'hub:' + B.cancer, 'מהלובי הראשי של מגדל האשפוז המשיכו ישר עד קצה המסדרון – מרכז הסרטן', D + 'directions-cancer-center'),
];

// ---------------------------------------------------------------------------
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const upsert = (key, recs) => {
  data[key] = data[key] || [];
  for (const r of recs) {
    const i = data[key].findIndex(x => x.id === r.id);
    if (i >= 0) {
      const old = data[key][i];
      if (old.prov?.edited) continue; // edited in the on-site editor – never overwrite
      // keep anything the owner already filled in (coords, verification)
      const keep = {};
      for (const k of ['lat', 'lon', 'nodeId']) if (old[k] != null && r[k] == null) keep[k] = old[k];
      if (old.prov?.verified) keep.prov = old.prov;
      data[key][i] = { ...r, ...keep };
    } else data[key].push(r);
  }
};
for (const d of destinations) if (TOPO[d.id]) d.topoNode = TOPO[d.id];
const centre = id => data.buildings.find(b => b.id === id)?.center;
for (const d of destinations) if (d.lat == null && d.buildingId) { const c = centre(d.buildingId); if (c) [d.lat, d.lon] = c; }
upsert('destinations', destinations);
upsert('parkings', parkings);
upsert('entrances', entrances);
upsert('gates', gates);
upsert('sources', sources);
for (const [k, label] of Object.entries(PUBLIC_INTERIOR)) {
  const b = data.buildings.find(b => b.id === B[k]);
  if (b) { b.publicInterior = true; b.publicInteriorNote = label + ' – מעבר ציבורי לפי הוראות ההגעה הרשמיות'; }
}
data.graph.edges = data.graph.edges.filter(e => !passages.some(p => p.id === e.id)).concat(passages);
data.routeNotes = data.routeNotes || [];
// best guess for the owner's night-MRI tip: the small OSM lot east/north-east of the tower (way/295751880), not part of the central garage.
{
  const lot = data.parkings.find(p => p.id === 'p-osm-295751880');
  if (lot && !lot.prov?.edited && !lot.prov?.verified) {
    lot.name = 'חניה קטנה צפונית-מזרחית למגדל (טיפ מהשטח)';
    lot.rules = [{ days: ALL, from: '19:00', to: '06:00', status: 'ok', note: 'טיפ מהשטח (לא מאומת)' }];
    lot.note = 'טיפ לא רשמי';
    lot.prov = { ...lot.prov, source: 'owner', osm: 'way/295751880', confidence: 'low', todo: 'לאמת בשטח שזו החניה הקטנה שהבעלים התכוון אליה, שערים ושעות' };
  }
}
data.routeNotes = data.routeNotes.filter(r => r.id !== 'rn-mri-night');
data.routeNotes.push({
  id: 'rn-mri-night', parkingId: 'p-osm-295751880', entranceId: 'ent-mri-rear', destinationId: 'mri',
  steps: [
    { text: 'חנו בחניה הקטנה (טיפ מהשטח, לא רשמי – בדקו שילוט במקום), לא בחניון המרכזי הגדול.', indoor: false },
    { text: 'לכו ברגל לכיוון מגדל האשפוז, לקיר המזרחי של הבניין (כ-250 מטר, הערכה).', indoor: false },
    { text: 'היכנסו בדלת האחורית/הצדדית (ניחוש – אם היא נעולה או לא מתאימה, עברו לכניסה הראשית בצד צפון-מזרח).', indoor: false },
    { text: 'מהדלת המשיכו במסדרון לאגף הדימות / MRI (כחצי דקה, הערכה).', indoor: true },
  ],
  prov: owner('לאמת את הצעדים בשטח', { confidence: 'low' }),
});
data.meta = { ...(data.meta || {}), version: 1, officialSeeded: CHECKED, title: 'Sheba Parking Guide data (unofficial)',
  parkingFlatRate: { text: 'כל החניות בשיבא: 30 ₪ ליממה. עד 30 דקות חינם אם נכנסים ויוצאים מאותו שער.', source: LOC, retrieved: CHECKED } };
fs.writeFileSync(DATA, formatData(data));
console.log('seeded', destinations.length, 'destinations,', parkings.length, 'parkings,', gates.length, 'gates');
