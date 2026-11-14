// Destination search: Hebrew transliteration of Latin names (פט סיטי → PET CT) and doctor-visit vs ward intent
// (typing "אורתופדיה" should list the outpatient clinics before the inpatient ward). Pure functions – no DOM.
import { norm } from '../util.js';

const squash = s => norm(s).replace(/ /g, '');

/** Prepares the alias dictionary (data/search-aliases.json) for fast lookups. */
export function prepareAliases(raw) {
  const latin = [], words = [];
  for (const l of raw?.latin || []) latin.push({ canon: squash(l.canonical), variants: (l.he || []).map(squash).filter(Boolean) });
  for (const w of raw?.words || []) words.push({ he: squash(w.he), equals: (w.equals || []).map(squash).filter(Boolean) });
  const intent = raw?.intent || {};
  return {
    latin, words,
    outpatient: (intent.outpatientWords || []).map(norm),
    inpatient: (intent.inpatientWords || []).map(norm),
    specialties: (intent.specialties || []).map(norm),
  };
}

/** The query itself plus every spelling it could stand for (PET CT, MRI, synonyms). All squashed (no spaces). */
export function expandQuery(q, A) {
  const base = squash(q);
  const out = new Set(base ? [base] : []);
  if (!base || !A) return [...out];
  for (const l of A.latin) for (const v of l.variants) if (v && base.includes(v)) out.add(base.replace(v, l.canon));
  for (const w of A.words) if (w.he && base.includes(w.he)) for (const e of w.equals) out.add(base.replace(w.he, e));
  return [...out];
}

/** What kind of unit a name describes, from its first words. */
export function unitType(name) {
  const n = norm(name);
  if (/^(מרפאה|מרפאות|מרפאת)/.test(n)) return 'clinic';
  if (/^(מחלקה|מחלקת|מחלקות)/.test(n)) return 'ward';
  if (/^(מערך|המערך)/.test(n)) return 'array';
  if (/^(מכון|המכון)/.test(n)) return 'institute';
  if (/^(יחידה|היחידה|יחידת)/.test(n)) return 'unit';
  if (/מרפא/.test(n)) return 'clinic';
  if (/שיקום|אשפוז|טיפול נמרץ/.test(n)) return 'ward';
  return null;
}

function textScore(hay, q) {
  if (!hay || !q) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 90;
  if (hay.split(' ').some(w => w.startsWith(q))) return 75;
  if (hay.includes(q)) return 60;
  return 0;
}

/** Score one destination for a query; 0 = no match. d = { name, aliases[], kind }. */
export function scoreDest(d, query, A) {
  const alts = expandQuery(query, A);
  if (!alts.length) return 0;
  const nameN = norm(d.name), nameSq = nameN.replace(/ /g, '');
  const aliasSq = (d.aliases || []).map(squash);
  let best = 0, byName = false;
  for (const q of alts) {
    const fromName = Math.max(textScore(nameSq, q), textScore(nameN, norm(query)) * (q === alts[0] ? 1 : 0));
    const fromAlias = Math.max(0, ...aliasSq.map(a => textScore(a, q))) * 0.7;
    if (fromName > best) { best = fromName; byName = true; }
    if (fromAlias > best) { best = fromAlias; byName = false; }
  }
  // several words typed: every word must appear somewhere in name/aliases
  if (!best) {
    const toks = norm(query).split(' ').filter(Boolean);
    if (toks.length > 1) {
      const hay = [nameN, ...(d.aliases || []).map(norm)].join(' ');
      if (toks.every(t => hay.includes(t) || expandQuery(t, A).some(e => hay.replace(/ /g, '').includes(e)))) best = 45;
    }
  }
  if (!best) return 0;

  // doctor visit vs ward: a bare specialty ("אורתופדיה") means the outpatient clinic unless the user says "מחלקה"/"אשפוז"
  const qn = norm(query);
  const wantsWard = A?.inpatient.some(w => qn.includes(w));
  const specialty = A?.specialties.some(s => qn.includes(s));
  const type = unitType(d.name);
  if (specialty && !wantsWard) {
    if (type === 'clinic') best += 30;
    else if (type === 'institute' || type === 'unit') best += 8;
    else if (type === 'ward') best -= 25;
    if (d.kind === 'dest' && !byName) best -= 20;     // a generic place that only lists the word as an alias
  } else if (wantsWard) {
    if (type === 'ward') best += 30;
    else if (type === 'clinic') best -= 10;
  }
  if (d.kind === 'dest') best += 4;                    // main places win ties
  return Math.max(1, best);
}

/** Filter + order destinations for a query. */
export function rankDests(list, query, A) {
  const scored = [];
  for (const d of list) { const s = scoreDest(d, query, A); if (s > 0) scored.push([s, d]); }
  scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name, 'he'));
  return scored.map(x => x[1]);
}
