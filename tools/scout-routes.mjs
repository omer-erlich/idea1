#!/usr/bin/env node
// Route scout: for EVERY destination in data/sheba.json and every hour band (day / evening / night) try every
// parking lot × every door of the destination's building with the real CampusRouter (findPathVia), check safety,
// and rank the options. Writes:
//   data/route-scout.json            – per destination × band: default (what the app shows), top options, rejected options
//   data/local-tips.generated.json   – {tips:[…]} like data/local-tips.json, provenance "osm-scout" (hand tips always win)
//   docs/LOCAL-ROUTES-CANDIDATES.md  – the coverage section between the scout markers (rest of the file untouched)
// Offline from repo data. `--fresh` re-reads door/parking tags from Overpass (NODE_USE_ENV_PROXY=1) into tools/.cache/osm-scout.json.
// Usage: node tools/scout-routes.mjs [--fresh] [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CampusRouter, TIP_BONUS_CAP_MIN, STATUS_PENALTY_MIN, UNVERIFIED_TIP_PENALTY_MIN } from '../js/engine/campus-router.js';
import { parseWhen, parkingStatusAt, isOpenAt, windowMatches } from '../js/engine/time.js';
import { parkingSafetyProblems, SAFETY_KINDS } from '../js/engine/safety.js';
import { haversine, pointInPolygon, distanceToPolyline } from '../js/engine/geo.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const GENERATED_BONUS_MAX = 4;            // generated tips stay below the owner's tips (router cap is TIP_BONUS_CAP_MIN)
export const MIN_SAVING_SEC = 60;                // a generated tip needs at least one minute less walking than the default
export const UNSAFE_DOOR_DIST_M = 30;            // doors this close to an ambulance bay / ER emergency door are never used
const ALL = [0, 1, 2, 3, 4, 5, 6];
export const BANDS = [
  { id: 'day', he: 'יום', from: '07:00', to: '17:00', samples: ['sun-08:00', 'sun-12:00', 'sun-16:30'] },
  { id: 'evening', he: 'ערב', from: '17:00', to: '22:00', samples: ['sun-17:30', 'sun-19:30', 'sun-21:30'] },
  { id: 'night', he: 'לילה', from: '22:00', to: '07:00', samples: ['sun-23:00', 'mon-02:00', 'mon-05:30'] },
];
const UNSAFE_TAG = t => !!(t && (t.emergency || t.entrance === 'emergency' || t.door === 'emergency_exit' || /^(private|no|staff|employees|permit|delivery)$/.test(t.access || '')));
const GARAGE_FLOOR_RE = /^(cancer-garage\/F\d+|central\/F3)$/;   // garage floor nodes with pedestrian links (owner 2026-11-14)
const STAFF_NOTE =t => /employee|staff|עובד|צוות/i.test(`${t?.note || ''} ${t?.description || ''}`);

// ---------------------------------------------------------------- helpers
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const r1 = x => Math.round(x * 10) / 10;
function osmIndex(raw) {
  const nodes = new Map(), ways = new Map();
  for (const e of raw?.elements || []) { if (e.type === 'node') nodes.set(e.id, e); else if (e.type === 'way') ways.set(e.id, e); }
  return { nodes, ways };
}
const osmIdOf = s => { const m = /node\/(\d+)/.exec(s || ''); return m ? +m[1] : null; };
function polyOverlap(a, b) {
  if (!a || !b || a.length < 3 || b.length < 3) return false;
  return a.some(p => pointInPolygon(p, b)) || b.some(p => pointInPolygon(p, a));
}
function samplePoints(coords, stepM = 5) {
  const out = [];
  for (let i = 0; i < coords.length; i++) {
    out.push(coords[i]);
    if (i === 0) continue;
    const a = coords[i - 1], b = coords[i], d = haversine(a, b), n = Math.floor(d / stepM);
    for (let k = 1; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}
function zoneHit(p, z) {
  if (z.polygon && z.polygon.length >= 3) return pointInPolygon(p, z.polygon);
  if (z.line) return distanceToPolyline(p, z.line) <= (z.buffer ?? 6);
  if (z.center) return haversine(p, z.center) <= (z.radius ?? 10);
  return false;
}
const zoneDist = (p, z) => z.center ? haversine(p, z.center) - (z.radius ?? 10) : z.line ? distanceToPolyline(p, z.line) - (z.buffer ?? 6) : (z.polygon && pointInPolygon(p, z.polygon) ? 0 : Math.min(...z.polygon.map(q => haversine(p, q))));

/** Router variant that may open ONE door whose public access is unknown (for "candidate, needs owner answer" options only; never for tips). */
class ProbeRouter extends CampusRouter {
  constructor(topo, sheba) { super(topo, sheba); this.probeDoor = null; }
  nodeOpen(n, when) { if (n && n.id === this.probeDoor && n.publicAccess !== 'no') return !n.hours || isOpenAt(n.hours, when).open; return super.nodeOpen(n, when); }
}

/** "חניה קטנה ליד <nearest named building>" – no raw OSM numbers in user-facing text. */
function lotLabel(sheba, pid) {
  const p = sheba.parkings.find(x => x.id === pid);
  let best = null, bd = Infinity;
  for (const b of sheba.buildings || []) { if (!b.name || !b.center) continue; const d = haversine([p.lat, p.lon], b.center); if (d < bd) { bd = d; best = b; } }
  const size = p.outline ? (() => { const k = 111320 * Math.cos(p.lat * Math.PI / 180); let a = 0; const o = p.outline; for (let i = 0; i < o.length - 1; i++) a += (o[i][1] * k) * (o[i + 1][0] * 110540) - (o[i + 1][1] * k) * (o[i][0] * 110540); return Math.abs(a / 2); })() : null;
  return `${size != null && size < 2000 ? 'חניה קטנה' : 'מגרש חניה'} ליד ${best ? best.name.split('(')[0].trim() : 'הבניין'}`;
}

// ---------------------------------------------------------------- safety knowledge
/** Door node ids the OWNER verified as public (sheba.entrances: prov.verified + prov.source "owner" + publicAccess "yes").
 *  The owner's confirmation outranks an OSM emergency-entrance tag for THAT door only. */
export function ownerVerifiedDoors(sheba) {
  return new Set((sheba.entrances || []).filter(e => e.prov?.verified === true && e.prov?.source === 'owner' && e.publicAccess === 'yes').map(e => e.nodeId || `door:${e.id}`));
}
export function unsafeDoors(R, sheba, osm) {
  const out = new Map();
  const owner = ownerVerifiedDoors(sheba);
  const amb = (sheba.safetyZones || []).filter(z => z.kind === 'ambulance_bay' || z.kind === 'helipad');
  for (const n of R.nodes.values()) {
    if (n.kind !== 'entrance') continue;
    if (owner.has(n.id) && n.publicAccess === 'yes') continue;   // owner-verified public door (e.g. the ER entrance, owner 2026-11-14)
    const tags = osm.nodes.get(osmIdOf(n.src))?.tags;
    if (UNSAFE_TAG(tags)) { out.set(n.id, `OSM tags: ${JSON.stringify(tags)}`); continue; }
    if (n.publicAccess === 'no') { out.set(n.id, 'publicAccess=no'); continue; }
    for (const z of amb) { const d = zoneDist([n.lat, n.lon], z); if (d < UNSAFE_DOOR_DIST_M) { out.set(n.id, `${Math.max(0, Math.round(d))} מ' מ${SAFETY_KINDS[z.kind]} (${z.prov?.osm || z.id})`); break; } }
  }
  return out;
}
export function lotSafety(p, sheba) {
  const problems = parkingSafetyProblems(p, sheba.safetyZones);
  for (const z of sheba.safetyZones || []) {
    if (['disabled', 'helipad', 'ambulance_bay', 'fire_access'].includes(z.kind) && z.polygon && polyOverlap(p.outline, z.polygon)) problems.push(`(${z.prov?.osm || z.id})`);
    if (z.kind === 'emergency_lane' && z.line && (p.outline || []).some(q => distanceToPolyline(q, z.line) <= (z.buffer ?? 6))) problems.push(`החניה נוגעת ב${SAFETY_KINDS[z.kind]} (${z.prov?.osm || z.id})`);
  }
  return [...new Set(problems)];
}
/** The estimated ambulance-bay zone drawn around an owner-verified public door (same OSM node) is that door's own
 *  forecourt: a walk that ENDS at that door may enter it (warning only). Every other route through it stays rejected. */
export function pathSafety(R, o, badDoors, zones, ownerDoors = new Set()) {
  const rej = [], warn = [];
  for (const id of o.path.nodeIds) if (badDoors.has(id)) rej.push(`המסלול עובר בדלת אסורה ${id} (${badDoors.get(id)})`);
  const pts = samplePoints(o.coords || []);
  const usedOwnerDoorOsm = o.path.nodeIds.filter(id => ownerDoors.has(id)).map(id => osmIdOf(R.nodes.get(id)?.src)).filter(Boolean);
  for (const z of zones) {
    if (!pts.some(p => zoneHit(p, z))) continue;
    if (z.kind === 'ambulance_bay' && usedOwnerDoorOsm.includes(osmIdOf(z.prov?.osm))) { warn.push('er-forecourt-owner-verified-door'); continue; }
    if (z.kind === 'ambulance_bay' || z.kind === 'helipad' || z.kind === 'fire_access') rej.push(`המסלול עובר ב${SAFETY_KINDS[z.kind]} (${z.prov?.osm || z.id})`);
    else warn.push(`walk-crosses-${z.kind}`);
  }
  return { rej, warn };
}

// ---------------------------------------------------------------- one option
function describe(R, o) {
  const hops = o.path.hops;
  const indoorSec = hops.filter(h => h.edge.indoor).reduce((s, h) => s + h.edge.sec, 0);
  const outdoorM = Math.round(hops.filter(h => !h.edge.indoor).reduce((s, h) => s + (h.edge.m ?? 0), 0));
  const vertical = hops.filter(h => ['stairs', 'elevator', 'floor-exit'].includes(h.edge.kind) || h.edge.stairs).length;
  const inferred = hops.filter(h => h.edge.conf === 'inferred').length;
  const doors = o.path.nodeIds.filter(id => R.nodes.get(id)?.kind === 'entrance');
  return { indoorSec: Math.round(indoorSec), outdoorM, verticalHops: vertical, inferredLinks: inferred, doors };
}
function evidenceOf(R, p, doorNode) {
  const ev = [];
  if (p.osmRef || p.prov?.osm) ev.push(`OSM ${p.osmRef || p.prov.osm}`);
  if (p.prov?.url) ev.push(p.prov.url);
  if (p.prov?.source === 'owner') ev.push('owner');
  if (doorNode?.src) ev.push(doorNode.src);
  ev.push('data/topology.json (CampusRouter.findPathVia)');
  return [...new Set(ev)];
}

// ---------------------------------------------------------------- main scout
export function scout({ sheba, topo, handTips = [], osmRaw = null, generatedAt = null }) {
  const R = new CampusRouter(topo, sheba);
  const P = new ProbeRouter(topo, sheba);
  const osm = osmIndex(osmRaw);
  const badDoors = unsafeDoors(R, sheba, osm);
  const ownerDoors = ownerVerifiedDoors(sheba);
  const zones = sheba.safetyZones || [];
  const lots = (sheba.parkings || []).filter(p => R.nodes.has(`park:${p.id}`));
  const unplacedLots = (sheba.parkings || []).filter(p => !R.nodes.has(`park:${p.id}`)).map(p => ({ id: p.id, name: p.name, reason: p.lat == null ? 'no-coords' : 'not-in-graph' }));
  const lotSafe = new Map(lots.map(p => [p.id, lotSafety(p, sheba)]));
  const main = (sheba.parkings || []).find(p => p.mainOfficial);
  // an unofficial lot next to a lot OSM marks private may be part of a staff area: keep it, but warn and ask
  const privateLots = (sheba.parkings || []).filter(p => p.access === 'private' && p.lat != null);
  const nearPrivate = new Map(lots.filter(p => !p.official).map(p => [p.id, privateLots.find(q => q.id !== p.id && haversine([p.lat, p.lon], [q.lat, q.lon]) < 90)?.prov?.osm || null]));
  const usedOsmDoors = new Set((sheba.entrances || []).map(e => osmIdOf(e.prov?.osm)).filter(Boolean));
  const results = [], tips = [], rejectedForSafety = new Map();
  const addRej = (key, why) => { if (!rejectedForSafety.has(key)) rejectedForSafety.set(key, why); };

  for (const dest of sheba.destinations || []) {
    const destNode = R.nodes.get(dest.topoNode);
    if (!destNode) { results.push({ destination: dest.id, name: dest.name, error: 'no-topo-node' }); continue; }
    const bKey = destNode.building || null;
    const bld = R.buildings.get(bKey);
    const doors = [...R.nodes.values()].filter(n => n.kind === 'entrance' && n.building === bKey);
    // OSM doors on this building that are NOT in the graph (service / side doors): candidates for the owner, never routed
    const osmDoorCandidates = [];
    if (bld?.outline) {
      const ring = bld.outline;
      for (const n of osm.nodes.values()) {
        if (!n.tags || !(n.tags.entrance || n.tags.door) || usedOsmDoors.has(n.id)) continue;
        const d = distanceToPolyline([n.lat, n.lon], ring);
        if (d > 25) continue;
        const why = UNSAFE_TAG(n.tags) ? 'unsafe-tags' : zones.filter(z => ['ambulance_bay', 'helipad'].includes(z.kind)).some(z => zoneDist([n.lat, n.lon], z) < UNSAFE_DOOR_DIST_M) ? 'near-ambulance-or-helipad' : null;
        osmDoorCandidates.push({ osm: `node/${n.id}`, tags: n.tags, distToWallM: Math.round(d), status: why ? 'rejected' : 'needs-owner-answer', reason: why || (STAFF_NOTE(n.tags) ? 'staff note in OSM' : 'not in the walking graph; public access unknown') });
        if (why) addRej(`node/${n.id}`, `${dest.id}: דלת OSM node/${n.id} ${JSON.stringify(n.tags)} – ${why}`);
      }
    }
    for (const d of doors) if (badDoors.has(d.id)) addRej(d.id, `${dest.id}: ${d.label} – ${badDoors.get(d.id)}`);

    const bands = {};
    for (const band of BANDS) {
      const whens = band.samples.map(s => parseWhen(s));
      const mid = whens[1];
      // what the app shows today (no tips) and with the hand tips
      const def = whens.map(w => R.recommend(dest.topoNode, dest, w, { limit: 3 }).options[0] || null);
      const withHand = R.recommend(dest.topoNode, dest, mid, { limit: 3, tips: handTips }).options[0] || null;
      const d0 = def[1] || def.find(Boolean);
      const defaultSec = d0 ? Math.max(...def.filter(Boolean).map(o => o.seconds)) : null;
      const defaultOpt = d0 ? { parking: d0.parking.id, parkingName: d0.parking.name, entrance: d0.entrance?.id || null, minutes: r1(defaultSec / 60), walkMinutes: d0.walkMinutes, unsafe: pathSafety(R, d0, badDoors, zones, ownerDoors).rej, viaGarageFloor: d0.path.nodeIds.filter(id => GARAGE_FLOOR_RE.test(id)) } : null;
      const cell = { default: defaultOpt, withHandTips: withHand ? { parking: withHand.parking.id, entrance: withHand.entrance?.id || null, tip: withHand.tip?.id || null } : null, options: [], rejected: [], candidates: [] };
      const seen = new Set();
      for (const p of lots) {
        const safeProb = lotSafe.get(p.id);
        if (safeProb.length) { cell.rejected.push({ parking: p.id, reason: 'safety', detail: safeProb }); addRej(p.id, `${p.id}: ${safeProb.join('; ')}`); continue; }
        const ex = whens.map(w => R.parkingExclusion(p, w));
        if (ex.every(e => e && e.code === 'forbidden')) { cell.rejected.push({ parking: p.id, reason: 'forbidden', detail: [ex[1].reason] }); continue; }
        // usable by the app at that time: no exclusion, or only "unofficial lot without hour rules" (the router accepts those when a tip names them)
        const appUsableAt = ex.map(e => !e || e.code === 'unknown');
        const lotHours = ex.some(e => e?.code === 'unknown') ? 'unknown' : 'known';
        const tries = [...doors.filter(d => d.publicAccess === 'yes').map(d => d.id), null, ...doors.filter(d => d.publicAccess !== 'yes').map(d => d.id)];
        for (const doorId of tries) {
          const doorNode = doorId ? R.nodes.get(doorId) : null;
          if (doorId && badDoors.has(doorId)) continue;              // reported once per destination above
          const unknownDoor = doorNode && doorNode.publicAccess !== 'yes';
          const per = whens.map((w, i) => {
            if (ex[i] && ex[i].code === 'forbidden') return null;
            const router = unknownDoor ? P : R;
            router.probeDoor = unknownDoor ? doorId : null;
            if (doorNode && !router.nodeOpen(doorNode, w)) return null;   // door known closed (or not public) at that time
            const o = router._option('parking', `park:${p.id}`, dest.topoNode, dest, w, {}, { parking: p, via: doorId });
            P.probeDoor = null;
            if (!o || (doorId && !o.path.nodeIds.includes(doorId))) return null;
            return o;
          });
          const ok = per.filter(Boolean);
          if (!ok.length) continue;
          const o = per[1] || ok[0];
          const firstDoor = doorId || o.entrance?.id || null;   // the door this option is about (forced via), else the one the router picked
          const key = `${p.id}|${firstDoor}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const sec = Math.max(...ok.map(x => x.seconds));
          const info = describe(R, o);
          const safety = pathSafety(R, o, badDoors, zones, ownerDoors);
          const viaGarageFloor = o.path.nodeIds.filter(id => GARAGE_FLOOR_RE.test(id));
          if (viaGarageFloor.length) safety.warn.push(`via-garage-floor:${viaGarageFloor.join(',')}`);
          if (doorId && info.doors.filter(x => x !== doorId).some(x => R.nodes.get(x).building !== bKey)) safety.warn.push('passes-through-another-building');
          if (doorId && o.path.nodeIds.slice(o.path.nodeIds.indexOf(doorId) + 1).some(x => R.nodes.get(x)?.kind === 'entrance')) continue;   // walks in, out again and through another door: not a real "use this door" option
          const st = parkingStatusAt(p, mid).status;
          const status = st === 'unknown' ? 'paid' : st;
          const score = o.cost / 60 + (STATUS_PENALTY_MIN[status] ?? 0) + (!p.official && !p.prov?.verified ? UNVERIFIED_TIP_PENALTY_MIN : 0);
          const row = {
            parking: p.id, parkingName: p.name || null, official: !!p.official, lotType: p.type || null,
            entrance: firstDoor, entranceName: firstDoor ? R.nodes.get(firstDoor).label : null, entrancePublic: doorNode ? doorNode.publicAccess : (firstDoor ? R.nodes.get(firstDoor).publicAccess : null),
            minutes: r1(sec / 60), seconds: Math.round(sec), meters: Math.round(o.meters), ...info,
            availableSamples: ok.length, appUsableSamples: per.filter((x, i) => x && appUsableAt[i] && !unknownDoor).length,
            lotHours, appScore: r1(score), savedVsDefaultMin: defaultSec != null ? r1((defaultSec - sec) / 60) : null,
            warnings: [...new Set([...o.warnings, ...safety.warn, ...(nearPrivate.get(p.id) ? [`near-private-lot:${nearPrivate.get(p.id)}`] : []), ...(p.official ? [] : ['unofficial']), ...(unknownDoor ? ['door-public-access-unknown'] : [])])],
            evidence: evidenceOf(R, p, doorNode || (firstDoor && R.nodes.get(firstDoor))),
            confidence: p.official && !unknownDoor && !info.inferredLinks ? 'medium' : 'low',
            est: true,
          };
          if (safety.rej.length) { cell.rejected.push({ parking: p.id, entrance: firstDoor, reason: 'safety', detail: safety.rej }); for (const r of safety.rej) addRej(`${p.id}|${firstDoor}`, `${dest.id}/${band.id}: ${p.id} → ${firstDoor}: ${r}`); continue; }
          if (unknownDoor || row.appUsableSamples === 0) {
            row.needs = [...(unknownDoor ? [`האם הדלת ${firstDoor} פתוחה לציבור (${band.he})?`] : []), ...(lotHours === 'unknown' ? [`האם כדאי לחנות ב-${p.osmRef || p.prov?.osm || p.id} ב${band.he}? (אין כלל שעות)`] : [])];
            cell.candidates.push(row);
          } else cell.options.push(row);
        }
      }
      cell.options.sort((a, b) => a.seconds - b.seconds || a.appScore - b.appScore);
      { const firsts = [], rest = [], lotSeen = new Set(); for (const r of cell.options) (lotSeen.has(r.parking) ? rest : (lotSeen.add(r.parking), firsts)).push(r); cell.options = [...firsts, ...rest]; }
      cell.candidates.sort((a, b) => a.seconds - b.seconds);
      // mark why each option differs from the default
      for (const r of cell.options) {
        const same = defaultOpt && r.parking === defaultOpt.parking && r.entrance === defaultOpt.entrance;
        r.why = same ? 'ברירת המחדל של האפליקציה' : r.savedVsDefaultMin >= 1 ? `חוסך כ-${Math.round(r.savedVsDefaultMin)} דק' הליכה מול ברירת המחדל${r.official ? '' : ' (חניה לא רשמית, עונש "לא מאומת" בדירוג)'}` : r.parking === defaultOpt?.parking ? 'אותה חניה, דלת אחרת' : 'חלופה';
        r.isDefault = !!same;
      }
      const mainRow = cell.options.find(o => o.parking === main?.id);
      cell.mainOfficialOffered = !!mainRow;
      const defRow = cell.options.find(o => o.isDefault);
      cell.options = cell.options.slice(0, 8);
      if (defRow && !cell.options.includes(defRow)) cell.options.push(defRow);
      if (mainRow && !cell.options.includes(mainRow)) cell.options.push({ ...mainRow, fallback: true });
      { const lotSeen = new Set(); cell.candidates = cell.candidates.filter(r => !lotSeen.has(r.parking) && lotSeen.add(r.parking)).slice(0, 6); }

      // ---- tip generation: best app-usable option that clearly beats the default walk
      const handCovers = handTips.some(t => (t.destinations || []).includes(dest.id) && whens.some(w => (t.when || []).some(x => windowMatches(x, w))));
      const best = cell.options.find(r => !r.isDefault && !r.fallback && r.entrance && r.entrancePublic === 'yes' && r.appUsableSamples >= 2 && r.savedVsDefaultMin * 60 >= MIN_SAVING_SEC && r.parking !== defaultOpt?.parking);
      cell.tip = null;
      if (best && handCovers) cell.tipSkipped = 'hand-tip-covers-this-band';
      else if (best) {
        const bonusMin = Math.min(GENERATED_BONUS_MAX, TIP_BONUS_CAP_MIN, Math.max(1, Math.floor(best.savedVsDefaultMin)));
        const lotName = best.parkingName || lotLabel(sheba, best.parking);
        const doorName = (best.entranceName || '').split('·')[0].trim();
        const tip = {
          id: `gen-${dest.id}-${band.id}`, destinations: [dest.id], parking: best.parking, entrance: best.entrance,
          when: [{ days: ALL, from: band.from, to: band.to }], bonusMin,
          provenance: 'osm-scout', confidence: 'low', status: 'unverified',
          noteHe: `טיפ מהשטח (נמצא אוטומטית, לא מאומת): ב${band.he} – ${lotName}, כניסה דרך ${doorName}. כ-${Math.round(best.savedVsDefaultMin)} דק' הליכה פחות מהחניה הרגילה.${best.official ? '' : ' טיפ לא רשמי – על אחריותך, בדוק שילוט במקום.'}`,
          scout: { savedMin: best.savedVsDefaultMin, minutes: best.minutes, defaultParking: defaultOpt.parking, defaultMinutes: defaultOpt.minutes, evidence: best.evidence, warnings: best.warnings },
        };
        // check with the real router that the app will really use it (tip bonus applied) and where it ranks
        const rank = whens.map(w => { const rr = R.recommend(dest.topoNode, dest, w, { limit: 50, tips: [...handTips, tip] }).options; const i = rr.findIndex(x => x.parking.id === tip.parking); return i >= 0 && rr[i].tipOption ? i + 1 : null; });
        if (rank.filter(Boolean).length < 2) cell.tipSkipped = 'router-would-not-apply-it';
        else { tip.scout.appRank = rank; cell.tip = tip.id; tips.push(tip); }
      }
      bands[band.id] = cell;
    }
    results.push({ destination: dest.id, name: dest.name, building: bKey, topoNode: dest.topoNode, doors: doors.map(d => ({ id: d.id, publicAccess: d.publicAccess, hours: d.hours ?? null, unsafe: badDoors.get(d.id) || null })), osmDoorCandidates, bands });
  }

  // internal parking division: only what the graph supports
  // garage buildings = graph buildings a lot node links into directly (e.g. park:p-cancer → cancer-garage/F2, park:p-central → central/lobby)
  const linkedBuildings = pid => new Set((topo.edges || []).filter(e => e.a === `park:${pid}` || e.b === `park:${pid}`).map(e => R.nodes.get(e.a === `park:${pid}` ? e.b : e.a)?.building).filter(b => b && (topo.buildings || []).some(x => x.id === b && /garage|חניון/i.test(`${x.id} ${x.name || ''}`))));
  const garageBuildings = new Set((sheba.parkings || []).flatMap(p => [...linkedBuildings(p.id)]));
  const garageLevels = [...R.nodes.values()].filter(n => (n.kind === 'parking' && n.building) || (n.kind === 'floor' && garageBuildings.has(n.building))).map(n => ({ id: n.id, building: n.building, floor: n.floor, label: n.label.includes('חניון') ? n.label : `${(topo.buildings || []).find(x => x.id === n.building)?.name || n.building} – ${n.label}`, conf: n.conf || null, src: n.src, links: (topo.edges || []).filter(e => (e.a === n.id || e.b === n.id) && ['passage', 'stairs', 'link'].includes(e.kind)).map(e => ({ to: e.a === n.id ? e.b : e.a, kind: e.kind, conf: e.conf || null, src: e.src || null })) }));
  const garages = (sheba.parkings || []).filter(p => p.type === 'garage').map(p => { const bs = linkedBuildings(p.id); return { id: p.id, name: p.name, levelsInData: garageLevels.filter(g => `park:${p.id}` === g.id || bs.has(g.building)).map(g => g.id) }; });
  // forced checks through the owner's new garage floor links: does going via the floor node change anything? (day, mid sample)
  const garageViaChecks = [];
  { const w = parseWhen(BANDS[0].samples[1]);
    for (const g of garageLevels.filter(x => GARAGE_FLOOR_RE.test(x.id))) {
      const pid = (sheba.parkings || []).find(p => linkedBuildings(p.id).has(g.building))?.id;
      const targets = new Set(g.links.filter(l => l.kind === 'passage').map(l => R.nodes.get(l.to)?.building));
      for (const dest of (sheba.destinations || []).filter(d => targets.has(R.nodes.get(d.topoNode)?.building))) {
        const a = pid && R.findPath(`park:${pid}`, dest.topoNode, w), b = pid && R.findPathVia(`park:${pid}`, g.id, dest.topoNode, w);
        garageViaChecks.push({ via: g.id, parking: pid, destination: dest.id, defaultMin: a ? r1(a.cost / 60) : null, viaMin: b ? r1(b.cost / 60) : null, wins: !!(a && b && b.cost < a.cost) });
      }
    } }
  return {
    report: {
      _readme: 'Generated by tools/scout-routes.mjs – do not edit by hand. Minutes are the router\'s estimates (worst of 3 sample times per band). "options" can be used by the app today; "candidates" need an owner answer (door access unknown / lot without hour rules); "rejected" never.',
      generatedAt, bands: BANDS.map(({ id, from, to, samples }) => ({ id, from, to, samples })),
      thresholds: { MIN_SAVING_SEC, GENERATED_BONUS_MAX, UNSAFE_DOOR_DIST_M },
      unsafeDoors: Object.fromEntries(badDoors), ownerVerifiedDoors: [...ownerDoors], unplacedLots, garages, garageLevels, garageViaChecks,
      rejectedForSafety: [...rejectedForSafety.values()],
      destinations: results,
    },
    tips,
  };
}

// ---------------------------------------------------------------- markdown
export function coverageMarkdown(report, tips, prev) {
  const L = [];
  const cells = report.destinations.flatMap(d => d.bands ? BANDS.map(b => d.bands[b.id]) : []);
  const withOpt = cells.filter(c => c.options.length).length;
  L.push('<!-- scout:begin (generated by tools/scout-routes.mjs – do not edit inside) -->', '', '## סריקת מסלולים – כל היעדים × שעות (route-scout)', '');
  L.push(`נוצר: ${report.generatedAt} · יעדים: ${report.destinations.length} · תאים (יעד × רצועה): ${cells.length} · תאים עם אפשרות: ${withOpt} · טיפים שנוצרו: ${tips.length}`, '');
  L.push('רצועות: יום 07–17, ערב 17–22, לילה 22–07 (3 זמני דגימה בכל רצועה, הזמן הגרוע נלקח). הדקות הן הערכות של הנתב (CampusRouter) – אותם מספרים שהאפליקציה מציגה. "מועמדים" = דורשים תשובה (דלת שגישתה לא ידועה / חניה בלי כלל שעות).', '');
  L.push('| יעד | רצועה | ברירת מחדל (חניה → דלת, דק\') | אפשרויות | מועמדים | החלופה המהירה | טיפ |', '|---|---|---|---|---|---|---|');
  const short = id => (id || '–').replace('park:', '').replace('door:', '');
  for (const d of report.destinations) {
    if (!d.bands) { L.push(`| ${d.destination} | – | שגיאה: ${d.error} | | | | |`); continue; }
    for (const b of BANDS) {
      const c = d.bands[b.id];
      const best = c.options.find(o => !o.isDefault && !o.fallback) || null;
      const cand = c.candidates[0];
      const bestTxt = best ? `${short(best.parking)} → ${short(best.entrance)} ${best.minutes}′ (${best.savedVsDefaultMin >= 0 ? '−' : '+'}${Math.abs(best.savedVsDefaultMin)})` : '–';
      L.push(`| ${d.destination} | ${b.he} | ${c.default ? `${short(c.default.parking)} → ${short(c.default.entrance)} ${c.default.minutes}′` : 'אין'} | ${c.options.length} | ${c.candidates.length}${cand && cand.savedVsDefaultMin >= 1 ? ` (${short(cand.parking)} −${cand.savedVsDefaultMin}′)` : ''} | ${bestTxt} | ${c.tip || (c.tipSkipped ? 'טיפ ידני' : '')} |`);
    }
  }
  L.push('', '### טיפים שנוצרו (`data/local-tips.generated.json`)', '');
  if (!tips.length) L.push('אין.');
  for (const t of tips) L.push(`- \`${t.id}\`: ${t.parking} → ${t.entrance}, ${t.when[0].from}–${t.when[0].to}, בונוס ${t.bonusMin} דק' (חוסך ${t.scout.savedMin} דק' מול ${t.scout.defaultParking}).`);
  L.push('', '### נדחו מטעמי בטיחות', '');
  for (const r of report.rejectedForSafety.slice(0, 30)) L.push(`- ${r}`);
  if (report.rejectedForSafety.length > 30) L.push(`- …ועוד ${report.rejectedForSafety.length - 30} (ראו data/route-scout.json)`);
  const unsafeDefaults = report.destinations.flatMap(d => d.bands ? BANDS.filter(b => d.bands[b.id].default?.unsafe?.length).map(b => `${d.destination}/${b.id}: ${d.bands[b.id].default.parking} – ${d.bands[b.id].default.unsafe[0]}`) : []);
  if (unsafeDefaults.length) { L.push('', '**ברירות מחדל של האפליקציה שהסורק פוסל (לטיפול):**', ''); for (const u of unsafeDefaults) L.push(`- ${u}`); }
  L.push('', '### שאלות לבעלים (מהסריקה הזו)', '');
  ownerQuestions(report, tips).forEach((q, i) => L.push(`${i + 1}. ${q}`));
  L.push('', '### חלוקה פנימית של חניונים', '');
  for (const g of report.garages) L.push(`- ${g.id} (${g.name}): ${g.levelsInData.length ? 'רמות בנתונים: ' + g.levelsInData.join(', ') : 'אין נתוני קומות/אזורים – לא הומצאו'}`);
  for (const g of (report.garageLevels || []).filter(x => x.links?.length && GARAGE_FLOOR_RE.test(x.id))) L.push(`  - ${g.id} (${g.conf}): ${g.links.map(l => `${l.kind} → ${l.to} (${l.conf}, ${l.src})`).join('; ')}`);
  const viaG = report.destinations.flatMap(d => d.bands ? BANDS.map(b => [d, b, d.bands[b.id]]) : []).filter(([, , c]) => c.default?.viaGarageFloor?.length || c.options.some(o => o.warnings.some(w => w.startsWith('via-garage-floor')) && !o.fallback));
  L.push('', '#### היכן הקישורים החדשים מהחניונים (cancer-garage/F2, central/F3) משנים תוצאה', '');
  if (!viaG.length) L.push('אף תא לא משתמש בהם.');
  const vc = report.garageViaChecks || [];
  if (vc.length) L.push('', `בדיקה מאולצת (יום, עלות נתב בדק'): ${[...new Set(vc.map(v => v.via))].map(via => { const xs = vc.filter(v => v.via === via); return `${via}: ${xs.filter(v => v.wins).length}/${xs.length} יעדים מהירים יותר (למשל ${xs.slice(0, 2).map(v => `${v.destination} ${v.viaMin}′ מול ${v.defaultMin}′`).join(', ')})`; }).join(' · ')}. הקישור מוצע רק אם הוא באמת מהיר יותר; central/F3 מסומן inferred ולכן מקבל עונש עד לאימות הקומה.`);
  for (const [d, b, c] of viaG) {
    const o = c.options.find(x => x.warnings.some(w => w.startsWith('via-garage-floor')));
    L.push(`- ${d.destination}/${b.id}: ${c.default?.viaGarageFloor?.length ? `ברירת המחדל עוברת ב-${c.default.viaGarageFloor.join(', ')} (${c.default.parking}, ${c.default.minutes}′)` : `אפשרות ${o.parking} דרך ${o.warnings.find(w => w.startsWith('via-garage-floor')).split(':')[1]} – ${o.minutes}′ (${o.savedVsDefaultMin >= 0 ? '−' : '+'}${Math.abs(o.savedVsDefaultMin)} מול ברירת המחדל)`}`);
  }
  L.push('', '### חניות שלא נבדקו (אין מיקום בגרף)', '', report.unplacedLots.map(u => `${u.id} (${u.reason})`).join(', ') || '–');
  if (prev) L.push('', '### מה השתנה מאז הריצה הקודמת', '', prev);
  L.push('', '<!-- scout:end -->');
  return L.join('\n');
}

export function ownerQuestions(report, tips) {
  const Q = [];
  const lots = new Map();
  for (const t of tips) if (!lots.has(t.parking)) lots.set(t.parking, t);
  for (const [pid, t] of lots) Q.push(`חניה ${pid.replace('p-osm-', 'OSM way/')} (טיפ אוטומטי ל-${t.destinations[0]}): האם מבקרים יכולים לחנות שם ביום/ערב/לילה? יש מחסום, שילוט "עובדים בלבד" או חניות נכים? (תמונה של הכניסה לחניה מספיקה)`);
  const seen = new Set();
  for (const d of report.destinations) for (const b of BANDS) for (const c of d.bands?.[b.id]?.candidates || []) {
    if (c.savedVsDefaultMin < 1 || !c.warnings.includes('door-public-access-unknown') || seen.has(c.entrance)) continue;
    seen.add(c.entrance);
    Q.push(`הדלת ${c.entrance.replace('door:ent-osm-', 'OSM node/')} (${(c.entranceName || '').split('·').pop().trim()}): פתוחה לציבור? באילו שעות? (חוסכת כ-${Math.round(c.savedVsDefaultMin)} דק' מ-${c.parking})`);
  }
  for (const d of report.destinations) if (d.bands && BANDS.every(b => !d.bands[b.id].default)) Q.push(`${d.name || d.destination}: אין מיקום/חיבור בגרף – סמן נעץ לכניסה לבניין (אין מסלול בכלל כרגע).`);
  // doors blocked only by an OSM emergency tag (not by publicAccess=no or ambulance distance): ask once; the owner can verify them like the ER door
  const tagOnly = Object.entries(report.unsafeDoors || {}).filter(([, why]) => /^OSM tags/.test(why) && /emergency/.test(why)).map(([id]) => id.replace('door:', ''));
  if (tagOnly.length) Q.push(`${tagOnly.join(', ')} מסומנת ב-OSM ככניסת חירום – האם זו דלת ציבורית להולכי רגל? עד תשובה הסורק לא משתמש בה.`);
  for (const g of report.garageLevels || []) for (const l of g.links || []) if (l.conf === 'inferred' && l.kind === 'passage') Q.push(`${g.label}: האם המעבר להולכי רגל אל ${l.to} יוצא באמת מקומה ${g.floor}? (צילום שלט הקומה ליד המעבר מספיק)`);
  const g = report.garages.filter(x => !x.levelsInData.length).map(x => x.id);
  if (g.length) Q.push(`חלוקה פנימית: לאילו קומות/אזורים ב-${g.join(', ')} יש יציאה ישירה להולכי רגל?`);
  return Q.slice(0, 15);
}

function diffSummary(oldTips, newTips) {
  const o = new Set(oldTips.map(t => `${t.id}|${t.parking}|${t.entrance}`)), n = new Set(newTips.map(t => `${t.id}|${t.parking}|${t.entrance}`));
  const added = [...n].filter(x => !o.has(x)).map(x => x.split('|')[0]), removed = [...o].filter(x => !n.has(x)).map(x => x.split('|')[0]);
  if (!oldTips.length && newTips.length) return 'ריצה ראשונה של הסורק על כל הקמפוס.';
  return `טיפים חדשים: ${added.join(', ') || 'אין'} · הוסרו: ${removed.join(', ') || 'אין'}.`;
}

async function fetchFresh() {
  const q = '[out:json][timeout:90];(node["entrance"](32.0395,34.837,32.0535,34.852);node["door"](32.0395,34.837,32.0535,34.852);way["amenity"="parking"](32.0395,34.837,32.0535,34.852););out center;';
  for (const url of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'User-Agent': 'sheba-parking-guide-scout/1.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q), signal: AbortSignal.timeout(120000) });
      const txt = await r.text();
      if (r.ok && txt.trimStart().startsWith('{')) { const j = JSON.parse(txt); fs.writeFileSync(path.join(ROOT, 'tools/.cache/osm-scout.json'), JSON.stringify(j)); return j; }
      console.warn('overpass answered without JSON', url, r.status);
    } catch (e) { console.warn('overpass failed', url, e.message); }
  }
  return null;
}

// ---------------------------------------------------------------- CLI
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = new Set(process.argv.slice(2));
  const sheba = read('data/sheba.json'), topo = read('data/topology.json');
  const handTips = read('data/local-tips.json').tips || [];
  let osmRaw = null;
  if (args.has('--fresh')) osmRaw = await fetchFresh();
  if (!osmRaw) for (const f of ['tools/.cache/osm-scout.json', 'tools/.cache/osm-raw.json']) if (fs.existsSync(path.join(ROOT, f))) { osmRaw = read(f); break; }
  const generatedAt = new Date().toISOString().slice(0, 10);
  const { report, tips } = scout({ sheba, topo, handTips, osmRaw, generatedAt });
  const genFile = path.join(ROOT, 'data/local-tips.generated.json');
  const oldTips = fs.existsSync(genFile) ? JSON.parse(fs.readFileSync(genFile, 'utf8')).tips || [] : [];
  const md = coverageMarkdown(report, tips, diffSummary(oldTips, tips));
  if (args.has('--dry')) { console.log(md); process.exit(0); }
  fs.writeFileSync(path.join(ROOT, 'data/route-scout.json'), JSON.stringify(report) + '\n');
  fs.writeFileSync(genFile, JSON.stringify({ _readme: 'GENERATED by tools/scout-routes.mjs (provenance osm-scout) – do not edit; hand tips in data/local-tips.json always win (loaded first). Unverified field tips; bonus ≤ ' + GENERATED_BONUS_MAX + ' min.', generatedAt, tips }, null, 1) + '\n');
  const docPath = path.join(ROOT, 'docs/LOCAL-ROUTES-CANDIDATES.md');
  let doc = fs.readFileSync(docPath, 'utf8');
  const re = /<!-- scout:begin[\s\S]*?<!-- scout:end -->/;
  doc = re.test(doc) ? doc.replace(re, md) : doc.trimEnd() + '\n\n' + md + '\n';
  fs.writeFileSync(docPath, doc);
  const cells = report.destinations.reduce((s, d) => s + (d.bands ? Object.keys(d.bands).length : 0), 0);
  console.log(`scout: ${report.destinations.length} destinations, ${cells} cells, ${tips.length} generated tips, ${report.rejectedForSafety.length} safety rejections`);
}
