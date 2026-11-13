// Parses the free-text "מיקום" field of Sheba clinic pages into { building, floor, wing, area, quality }.
// Everything here is rule-based and deliberately conservative: unknown stays unknown.

const FLOOR_WORDS = { 'ראשונה': 1, 'ראשון': 1, 'שנייה': 2, 'שניה': 2, 'שלישית': 3, 'רביעית': 4, 'חמישית': 5, 'שישית': 6, 'שביעית': 7 };

/** Building patterns. The EARLIEST mention in the text wins (location texts start with the building). */
export const BUILDING_PATTERNS = [
  ['cancer', /מרכז\s*(ה)?סרטן|בניי?ן\s*(ה)?סרטן|רפואת\s*הסרטן/],
  ['heart', /מרכז\s*(ה)?לב|בניי?ן\s*(ה)?לב\b|בניי?ן\s*לב/],
  ['safra', /ספרא|בית\s*(ה)?חולים\s*(ה)?לילדים|בניי?ן\s*ילדים|בית\s*חולים\s*ילדים/],
  ['women', /בית\s*(ה)?חולים\s*לנשים|נשים\s*(ו)?(יולדות|מיילדות)|בניין\s*יולדות|בניין\s*נשים/],
  ['pade', /פדה|שיקום\s*המבוגר|גריאטריה/],
  ['rehab', /בניין\s*(ה)?שיקום|מרכז\s*(ה)?שיקום|בית\s*(ה)?חולים\s*(ה)?שיקומי|אגף\s*שיקום/],
  ['eyes', /מכון\s*עיניים|בניין\s*עיניים/],
  ['ent', /אף[\s-]*אוזן[\s-]*גרון|אא"ג|אאג/],
  ['oral', /פה\s*ולסת/],
  ['labs', /(אגף|בניי?ן)\s*(ה)?מעבדות/],
  ['bloodbank', /בנק\s*הדם/],
  ['shilev', /שי[\s-]*לב|מלון\s*(רפואי|החלמה)/],
  ['endo', /שמוק|סוכרת\s*ואנדוקרינולוגיה/],
  ['childdev', /התפתחות\s*הילד/],
  ['pav16', /ביתן\s*16/],
  ['pav17', /ביתן\s*17/],
  ['heller', /מכון\s*הלר/],
  ['sourasky', /סוראסקי/],
  ['central', /חניון\s*(ה)?(מרכזי|צומת)|מרכז\s*הצומת|קניון\s*הצומת/],
  ['er', /חדר\s*(ה)?מיון|מיון\s*(מרכזי|כללי|ראשי)|בניין\s*(ה)?מיון|רפואה\s*דחופה/],
  ['psych', /רפואת\s*הנפש|פסיכיאטריה/],
  // the tower is the default home of many clinics, so it comes last in tie-breaks
  ['tower', /מגדל\s*(ה)?אשפוז|בניי?ן\s*(ה)?אשפוז|אשפוז\s*מרכזי|מרפאות\s*(ה)?חוץ|אגף\s*[דש]ימות|בניי?ן\s*מרפאות|בניי?ן\s*מרכזי|בית\s*חולים\s*מרכזי|מרכז\s*מירב/],
];

/** Fallback: the clinic page links to a directions page – that page tells us the building. */
export const DIRECTIONS_BUILDING = {
  'directions-cancer-center': 'cancer', 'directions-cancer-clinics-center': 'cancer', 'directions-radiotherapy-institute': 'cancer',
  'directions-heart-center': 'heart', 'directions-heart-cardiac-rehabilitation': 'heart', 'directions-vascular-institute': 'heart',
  'directions-children-clinics': 'safra', 'directions-safra-childrens-hospital': 'safra', 'directions-pediatric-er': 'safra',
  'directions-child-psychiatry-clinic': 'safra', 'directions-pediatric-hemato-oncology-institute': 'safra',
  'directions-women': 'women', 'directions-women-clinics': 'women', 'directions-women-maternity-hospital': 'women',
  'directions-imaging-division': 'tower', 'directions-internal-clinics': 'tower', 'directions-surgery-clinics': 'tower',
  'directions-surgery': 'tower', 'directions-orthopedic-clinics': 'tower', 'directions-nuclear-medicine': 'tower',
  'directions-neurology-clinics': 'tower', 'directions-neurology-department': 'tower', 'directions-neurosurgery-department': 'tower',
  'directions-gastro-institute': 'tower', 'directions-autoimmune-diseases-center': 'tower', 'directions-lung-diseases-institute': 'tower',
  'directions-urology-clinics': 'tower', 'directions-pain-clinic': 'tower', 'directions-phototherapy-institute': 'tower',
  'directions-hypertension-clinic': 'tower', 'directions-infectious-diseases-unit': 'tower', 'directions-kidney-transplant-center': 'tower',
  'directions-rehab': 'rehab', 'directions-rehabilitation-clinics': 'rehab', 'directions-eating-disorder-center-adults': 'rehab',
  'directions-pade-building': 'pade', 'directions-geriatrics-clinic': 'pade', 'directions-pressure-chamber': 'pade',
  'directions-psychiatry': 'psych', 'directions-psychiatry-clinics': 'psych', 'how-to-reach-hava-center': 'psych',
  'directions-ophthalmology-institute-eyes': 'eyes', 'directions-otolaryngology-clinics-ent': 'ent',
  'directions-oral-and-maxillofacial-institute': 'oral', 'directions-er': 'er', 'directions-surgeries-day-hospitalization': 'er',
  'directions-endocrinology-institute': 'endo', 'directions-overweight-center': 'endo',
  'directions-child-development-institute': 'childdev', 'how-to-reach-shilev-hotel': 'shilev',
  'directions-mother-baby-day-therapy-unit': 'shilev', 'directions-bnei-brak-clinic': 'pav16', 'directions-sexual-health-center': 'pav16',
  'directions-trauma-treatment': 'pav17', 'directions-eating-disorders-children': 'heller', 'directions-hematology-lab': 'labs',
  'how-to-reach-mri-test': 'tower', 'directions-tissue-typing-lab': 'tower', 'directions-sourasky-house': 'sourasky',
  'directions-screening-tests': 'central',
};

export function cleanLocation(raw) {
  return String(raw || '')
    .replace(/פירוט\s*דרכי\s*הגעה/g, ' ')
    .replace(/\bWaze\b/gi, ' ')
    .replace(/במקרה חירום[\s\S]*$/, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseFloor(text) {
  let m;
  if ((m = /קומה\s*(\d+)\s*-(?!\s*\d)/.exec(text))) return String(-m[1]);               // Hebrew UI prints "קומה 1-" for −1
  if ((m = /קומה\s*[-−–]\s*(\d+)/.exec(text)) || (m = /קומה\s*מינוס\s*(\d+)/.exec(text))) return String(-m[1]);
  if ((m = /קומה\s*(\d+)/.exec(text))) return String(+m[1]);
  if (/קומת\s*(ה)?(כניסה|קרקע)|קומה\s*G\b|קומת\s*G\b|קומה\s*(ה)?קרקע/.test(text)) return '0';
  if ((m = /קומה\s*(ראשונה|ראשון|שנייה|שניה|שלישית|רביעית|חמישית|שישית|שביעית)/.exec(text))) return String(FLOOR_WORDS[m[1]]);
  if (/קומה\s*ראשונה/.test(text)) return '1';
  return null;
}

// "adjacent to the outpatient clinics" is NOT "in the outpatient clinics": skip mentions that follow a proximity word
const NEARBY_BEFORE = /(בצמוד|צמוד|סמוך|ליד|מול|מעל|שמעל|לפני|אחרי)\s*(ל|ל־|ל-)?\s*$/;

export function parseBuilding(text) {
  let best = null;
  for (const [id, re] of BUILDING_PATTERNS) {
    const g = new RegExp(re.source, 'g');
    let m;
    while ((m = g.exec(text))) {
      if (NEARBY_BEFORE.test(text.slice(Math.max(0, m.index - 14), m.index))) continue;
      if (best === null || m.index < best.index) best = { id, index: m.index };
      break;
    }
  }
  return best ? best.id : null;
}

export function parseWing(text) {
  if (/אגף\s*(מערבי|מערב)/.test(text)) return 'W';
  if (/אגף\s*(מזרחי|מזרח)/.test(text)) return 'E';
  if (/אגף\s*(צפוני|צפון)/.test(text)) return 'N';
  const m = /אגף\s*(\d{1,2})(?!\d)/.exec(text);
  return m ? m[1] : null;
}

/**
 * @param {string} raw location text from the clinic page
 * @param {{links?: {text:string,href:string}[]}} extra
 * @returns {{building, floor, wing, text, quality, via}}
 */
export function parseLocation(raw, extra = {}) {
  const text = cleanLocation(raw);
  let building = text ? parseBuilding(text) : null;
  let via = building ? 'location-text' : null;
  const floor = text ? parseFloor(text) : null;
  const wing = text ? parseWing(text) : null;
  // The fallbacks below only apply when the clinic page has NO location sentence. If it has one that we cannot
  // identify (e.g. "בניין וואהל"), we keep it unlocated instead of trusting a different page over the clinic's own words.
  if (!building && !text) {
    // fallback 1: the "דרכי הגעה" link of the clinic page
    for (const l of extra.links || []) {
      const slug = String(l.href || '').replace(/\/+$/, '').split('/').pop();
      if (DIRECTIONS_BUILDING[slug]) { building = DIRECTIONS_BUILDING[slug]; via = 'directions-link'; break; }
    }
  }
  if (!building && !text) {
    // fallback 2: the Waze search text ("שיבא מרכז הסרטן")
    for (const l of extra.links || []) {
      const q = decodeURIComponent(String(l.href || '').split('?q=')[1] || '');
      const b = q ? parseBuilding(q) : null;
      if (b) { building = b; via = 'waze-query'; break; }
    }
  }
  const quality = building && floor !== null ? 'building+floor' : building ? 'building' : 'none';
  return { building, floor, wing, text: text || null, quality, via };
}
