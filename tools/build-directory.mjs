#!/usr/bin/env node
// Builds data/clinics-directory.json, data/tests-directory.json and docs/CLINICS-COVERAGE.md from the crawl output.
//
//   node tools/build-directory.mjs [--lobby tools/.cache/lobby.json] [--details tools/.cache/clinics] [--sitemap tools/.cache/sitemap.xml]
//
// The crawl itself lives in tools/crawl/ (needs Playwright). Contact details are never stored; only name, link and the
// public "מיקום" text of each clinic page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLocation } from './lib/parse-location.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const LOBBY = arg('lobby', path.join(ROOT, 'tools/.cache/lobby.json'));
const DETAILS = arg('details', path.join(ROOT, 'tools/.cache/clinics'));
const SITEMAP = arg('sitemap', path.join(ROOT, 'tools/.cache/sitemap.xml'));
const TODAY = new Date().toISOString().slice(0, 10);

const DEPT_HE = { pediatrics: 'ילדים', surgery: 'כירורגיה', 'internal-medicine': 'רפואה פנימית', cancer: 'רפואת הסרטן', general: 'כללי', rehabilitation: 'שיקום', pregnancy: 'הריון ולידה',
  cardiovascular: 'לב וכלי דם', gynecology: 'גינקולוגיה', psychiatry: 'רפואת הנפש', neuroscience: 'מוח ועצבים', research: 'מחקר', imaging: 'דימות', geriatrics: 'גריאטריה',
  'preventive-medicine': 'רפואה מונעת', beyond: 'שיבא Beyond', education: 'הכשרה', 'adi-hospital': 'בית חולים עדי' };
const slugOf = h => h.replace(/^\/+|\/+$/g, '').replace(/\//g, '__');
const norm = s => String(s || '').toLowerCase().replace(/["'״׳\-–_.,()]/g, '').replace(/\s+/g, ' ').trim();

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/topology-seed.json'), 'utf8'));
const sheba = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sheba.json'), 'utf8'));
const bName = Object.fromEntries(seed.buildings.map(b => [b.id, b.name.split('(')[0].trim()]));

// ---------------------------------------------------------------- clinics
const lobby = JSON.parse(fs.readFileSync(LOBBY, 'utf8')).filter(x => x.href);
const clinics = [];
for (const it of lobby) {
  const f = path.join(DETAILS, slugOf(it.href) + '.json');
  const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  const links = d?.links || [];
  const loc = parseLocation(d?.location || '', { links });
  const dir = links.map(l => String(l.href || '')).find(h => /directions-clinics|how-to-reach/.test(h));
  const waze = links.map(l => String(l.href || '')).find(h => /waze/.test(h));
  clinics.push({
    id: slugOf(it.href), name: it.name, href: it.href, dept: it.href.split('/')[0],
    crawled: !!d?.ok, hasLocationField: !!d?.hasLocationField,
    location: { raw: d?.location || null, text: loc.text, building: loc.building, floor: loc.floor, wing: loc.wing, quality: loc.quality, via: loc.via },
    directionsPage: dir ? dir.replace(/\/+$/, '').split('/').pop() : null,
    wazeQuery: waze && waze.includes('?q=') ? decodeURIComponent(waze.split('?q=')[1]) : null,
  });
}

// does the app already cover the clinic?  exact = the clinic IS a destination (name / alias equal, or the destination name is the clinic name);
// building = the app can at least route to that clinic's building (some destination lives there)
const osmToKey = new Map(seed.buildings.filter(b => b.osm).map(b => [b.osm, b.id]));
const destList = (sheba.destinations || []).map(d => ({ d, keys: new Set([d.name, ...(d.aliases || [])].map(norm)), bkey: osmToKey.get(d.buildingId) || null }));
const coveredBuildings = new Set(destList.map(x => x.bkey).filter(Boolean));
for (const c of clinics) {
  const n = norm(c.name);
  const hit = destList.find(({ keys }) => keys.has(n));
  c.inApp = hit ? hit.d.id : null;
  c.buildingCovered = !!(c.location.building && coveredBuildings.has(c.location.building));
}

// ---------------------------------------------------------------- tests (from the sitemap; location = the unit that performs them)
const tests = [];
if (fs.existsSync(SITEMAP)) {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const UNIT = { imaging: { unit: 'אגף דימות', building: 'tower', floor: '0', area: 'tower/imaging' }, cardiovascular: { unit: 'מרכז הלב, חזה וכלי דם', building: 'heart', floor: null } };
  for (const u of urls) {
    const m = /^https:\/\/www\.sheba\.co\.il\/([^/]+)\/(tests?(?:-[a-z]+)?)\/([^/]+)\/?$/.exec(u);
    if (!m) continue;
    const [, section, kind, slug] = m;
    tests.push({ section, sectionHe: DEPT_HE[section] || section, group: kind, slug, url: u, unit: UNIT[section]?.unit || null, building: UNIT[section]?.building || null, floor: UNIT[section]?.floor ?? null,
      locationBasis: UNIT[section] ? 'מיקום יחידת הבדיקה' : 'לא צוין באתר' });
  }
}

// ---------------------------------------------------------------- write data
const stats = {
  lobbyEntries: clinics.length, crawled: clinics.filter(c => c.crawled).length,
  withLocationText: clinics.filter(c => c.location.text).length,
  buildingAndFloor: clinics.filter(c => c.location.quality === 'building+floor').length,
  buildingOnly: clinics.filter(c => c.location.quality === 'building').length,
  viaFallback: clinics.filter(c => c.location.via && c.location.via !== 'location-text').length,
  unlocated: clinics.filter(c => c.location.quality === 'none').length,
  inApp: clinics.filter(c => c.inApp).length,
  buildingCovered: clinics.filter(c => c.buildingCovered).length,
};
const outClinics = clinics.map(c => ({ id: c.id, name: c.name, href: c.href, dept: c.dept, location: c.location, directionsPage: c.directionsPage, wazeQuery: c.wazeQuery, inApp: c.inApp || undefined, buildingCovered: c.buildingCovered || undefined }));
fs.writeFileSync(path.join(ROOT, 'data/clinics-directory.json'), JSON.stringify({ meta: { source: 'https://www.sheba.co.il/lobbies/clinics-lobby + each clinic page (public text "מיקום")', retrieved: TODAY, siteHeaderCount: 773, ...stats }, clinics: outClinics }, null, 0) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/tests-directory.json'), JSON.stringify({ meta: { source: 'https://www.sheba.co.il/sitemap (URLs under /tests*/)', retrieved: TODAY, count: tests.length }, tests }) + '\n');

// ---------------------------------------------------------------- coverage report
const gmaps = name => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' שיבא תל השומר')}`;
const link = c => `[${c.name.replace(/\|/g, '/')}](https://www.sheba.co.il/${c.href.replace(/^\/+/, '')})`;
const floorKey = f => (f == null ? 99 : +f);
let md = `# כיסוי מרפאות ובדיקות – מה יש, מה חסר, ומה עוד לא ידוע

נוצר אוטומטית ע"י \`tools/build-directory.mjs\` ב-${TODAY}. מקור: [לובי המרפאות של שיבא](https://www.sheba.co.il/lobbies/clinics-lobby) ודפי המרפאות עצמן (הטקסט הציבורי תחת "מיקום").

## סיכום

| | כמות |
|---|---|
| מרפאות ברשימת הלובי (איסוף ע"י דפדוף ב-52 עמודים) | **${stats.lobbyEntries}** (כותרת האתר מציינת 773 – ראו OPEN_QUESTIONS) |
| דפים שנקראו | ${stats.crawled} |
| עם טקסט "מיקום" באתר | ${stats.withLocationText} |
| נקלט בניין + קומה | ${stats.buildingAndFloor} |
| נקלט בניין בלבד | ${stats.buildingOnly} |
| מזה: בניין נלמד מקישור "דרכי הגעה"/Waze (ולא מהטקסט) | ${stats.viaFallback} |
| **ללא מיקום ידוע** | **${stats.unlocated}** |
| כבר יעד באפליקציה (שם זהה) | ${stats.inApp} |
| הבניין שלהן מכוסה באפליקציה (יש יעד באותו בניין) | ${stats.buildingCovered} |
| דפי בדיקות (מה-sitemap) | ${tests.length} |

האפליקציה כוללת כרגע ${sheba.destinations.length} יעדים מרוכזים (מכונים ומרפאות מרכזיות) – ולכן כמעט כל הרשימה למטה "חסרה" כיעד חיפוש. כולם כבר מופיעים כצמתים בגרף הפנימי (\`graph.html\`) אם נקלט להם בניין.

> **על גוגל מפות:** לא נאסף מידע מגוגל מפות (תנאי השימוש אוסרים חילוץ אוטומטי ושמירה של התוכן, ובפרויקט משתמשים רק בחומר שמותר לעשות בו שימוש חוזר). במקום זה המיקומים נלקחו מהטקסט הרשמי של שיבא. לרשומות שנשארו בלי מיקום יש בהמשך קישור "חיפוש במפות" שאפשר ללחוץ ידנית.

`;
const byB = new Map();
for (const c of clinics) { const b = c.location.building || '_none'; if (!byB.has(b)) byB.set(b, []); byB.get(b).push(c); }
const order = [...byB.keys()].filter(k => k !== '_none').sort((a, b) => byB.get(b).length - byB.get(a).length);
md += `## מרפאות לפי בניין וקומה (${stats.lobbyEntries - stats.unlocated})\n\n`;
for (const b of order) {
  const list = byB.get(b).sort((x, y) => floorKey(x.location.floor) - floorKey(y.location.floor) || x.name.localeCompare(y.name, 'he'));
  md += `### ${bName[b] || b} (${list.length})\n\n<details><summary>הצג את ${list.length} המרפאות</summary>\n\n| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |\n|---|---|---|---|---|\n`;
  for (const c of list) md += `| ${c.location.floor ?? '?'} | ${link(c)} | ${(c.location.text || '—').replace(/\|/g, '/')} | ${c.location.via === 'location-text' ? 'טקסט' : c.location.via === 'directions-link' ? 'קישור הגעה' : 'Waze'} | ${c.inApp ? '✔ יעד: ' + c.inApp : c.buildingCovered ? 'בניין מכוסה' : '—'} |\n`;
  md += `\n</details>\n\n`;
}
const none = (byB.get('_none') || []).sort((x, y) => x.name.localeCompare(y.name, 'he'));
md += `## ללא מיקום ידוע (${none.length})\n\nבדפים האלה אין שדה "מיקום" ואין קישור הגעה שמזהה בניין. אפשר לברר בשטח (העורך \`?edit=1\`) או ללחוץ על חיפוש במפות.\n\n<details open><summary>הצג את ${none.length} המרפאות</summary>\n\n| מרפאה | תחום | חיפוש |\n|---|---|---|\n`;
for (const c of none) md += `| ${link(c)} | ${DEPT_HE[c.dept] || c.dept} | [מפות ↗](${gmaps(c.name)}) |\n`;
md += `\n</details>\n\n`;

md += `## בדיקות (${tests.length})\n\nדפי הבדיקות באתר אינם מציינים מיקום – בדיקה מתבצעת ביחידה שמציעה אותה. רק לשני תחומים המיקום נגזר בבטחה:\n\n| תחום | דפי בדיקות | יחידה / מיקום |\n|---|---|---|\n`;
const bySec = new Map();
for (const t of tests) { if (!bySec.has(t.section)) bySec.set(t.section, []); bySec.get(t.section).push(t); }
for (const [sec, list] of [...bySec].sort((a, b) => b[1].length - a[1].length)) {
  const t0 = list[0];
  md += `| ${t0.sectionHe} | ${list.length} | ${t0.unit ? `${t0.unit} – ${bName[t0.building]}${t0.floor != null ? ', קומה ' + t0.floor : ''}` : 'לא צוין – יש לברר מול המחלקה'} |\n`;
}
md += `\n<details><summary>כל כתובות דפי הבדיקות</summary>\n\n`;
for (const [sec, list] of [...bySec].sort((a, b) => b[1].length - a[1].length)) md += `**${list[0].sectionHe}**\n\n${list.map(t => `- [${t.slug}](${t.url})`).join('\n')}\n\n`;
md += `</details>\n`;
fs.writeFileSync(path.join(ROOT, 'docs/CLINICS-COVERAGE.md'), md);
console.log(JSON.stringify(stats), 'tests', tests.length);
