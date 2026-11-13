#!/usr/bin/env node
// Import the campus skeleton from OpenStreetMap into data/sheba.json.
//
//   NODE_USE_ENV_PROXY=1 node tools/import-osm.mjs            # download fresh data
//   node tools/import-osm.mjs --from-file tools/.cache/osm-raw.json   # re-use a saved extract
//
// What it does:
//   * downloads all OSM objects in the campus bounding box (Overpass, falls back to the OSM API)
//   * builds buildings, entrances, parking areas, safety zones and the pedestrian graph
//   * REPLACES only records whose prov.source is "osm" or "generated"; everything else
//     (official data, owner tips, approved crowd tips) is kept untouched
//   * re-attaches every parking / entrance / destination with coordinates to the graph
//
// Data © OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { haversine, polylineLength, centroid, round6, simplify, pointInPolygon } from '../js/engine/geo.js';
import { attachAll } from '../js/engine/attach.js';
import { formatData } from '../js/engine/format.js';
export { formatData };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data/sheba.json');
const CACHE = path.join(ROOT, 'tools/.cache/osm-raw.json');
// south, west, north, east — the hospital grounds plus a small margin
export const BBOX = [32.0395, 34.8370, 32.0535, 34.8520];
const TODAY = new Date().toISOString().slice(0, 10);
const ALL = [0, 1, 2, 3, 4, 5, 6];

const args = process.argv.slice(2);
const fromFile = args.includes('--from-file') ? args[args.indexOf('--from-file') + 1] : null;

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const UA = 'sheba-parking-guide-import/1.0 (static community site)';

async function download() {
  const [s, w, n, e] = BBOX;
  const q = `[out:json][timeout:120];(nwr(${s},${w},${n},${e}););out body;>;out skel qt;`;
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q), signal: AbortSignal.timeout(180000) });
      if (r.ok) { console.log('downloaded from', url); return await r.json(); }
      console.warn(url, r.status);
    } catch (err) { console.warn(url, err.cause?.code || err.message); }
  }
  const api = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${w},${s},${e},${n}`;
  const r = await fetch(api, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(180000) });
  if (!r.ok) throw new Error('OSM API ' + r.status);
  console.log('downloaded from OSM API');
  return await r.json();
}

// ---------------------------------------------------------------------------
const WALKABLE = new Set(['footway', 'path', 'pedestrian', 'steps', 'corridor', 'service', 'residential', 'unclassified',
  'tertiary', 'tertiary_link', 'secondary', 'secondary_link', 'living_street', 'track', 'cycleway', 'elevator']);
const ROADS = new Set(['service', 'residential', 'unclassified', 'tertiary', 'tertiary_link', 'secondary', 'secondary_link', 'living_street', 'track']);
const FOOT_OK = new Set(['yes', 'designated', 'permissive']);
const NOT_PUBLIC = new Set(['private', 'no']);

const osmProv = (ref, confidence = 'medium', extra = {}) => ({ verified: false, lastVerified: null, source: 'osm', osm: ref, retrieved: TODAY, confidence, ...extra });

export function transform(raw) {
  const els = raw.elements;
  const N = new Map(), W = new Map();
  for (const e of els) { if (e.type === 'node') N.set(e.id, e); else if (e.type === 'way') W.set(e.id, e); }
  const ll = id => { const n = N.get(id); return n ? [n.lat, n.lon] : null; };
  const wayCoords = w => w.nodes.map(ll).filter(Boolean);

  // ---- hospital grounds (amenity=hospital area) – used to keep only relevant buildings
  const grounds = [...W.values()].find(w => w.tags?.amenity === 'hospital' && /תל השומר|Sheba|שיבא/.test((w.tags.name || '') + (w.tags.alt_name || '')));
  const groundsPoly = grounds ? wayCoords(grounds) : null;
  const nearGrounds = p => !groundsPoly || pointInPolygon(p, groundsPoly) || groundsPoly.some(q => haversine(p, q) < 60);

  // ---- buildings
  const buildings = [];
  const buildingOfNode = new Map();
  for (const w of W.values()) {
    const t = w.tags || {};
    if (!t.building || t.building === 'roof' || !w.nodes || w.nodes.length < 4) continue;
    const coords = wayCoords(w);
    if (coords.length < 4) continue;
    if (!nearGrounds(centroid(coords.slice(0, -1)))) continue;
    const id = `b-osm-${w.id}`;
    buildings.push({
      id, name: t['name:he'] || t.name || null, nameEn: t['name:en'] || null,
      officialName: t['official_name:he'] || t.official_name || null,
      levels: t['building:levels'] ? +t['building:levels'] : null,
      outline: simplify(coords, 0.5).map(round6),
      center: round6(centroid(coords.slice(0, -1))),
      prov: osmProv(`way/${w.id}`, t.fixme ? 'low' : 'medium', t.fixme ? { note: 'OSM fixme: ' + t.fixme } : {}),
    });
    for (const nid of w.nodes) if (!buildingOfNode.has(nid)) buildingOfNode.set(nid, id);
  }

  // ---- pedestrian graph
  const ways = [...W.values()].filter(w => {
    const t = w.tags || {};
    if (!WALKABLE.has(t.highway)) return false;
    if (t.foot === 'no' || t.access === 'no' && !FOOT_OK.has(t.foot)) return t.service === 'emergency_access'; // keep to mark as non-public
    return true;
  });
  const usage = new Map();
  for (const w of ways) w.nodes.forEach((id, i) => usage.set(id, (usage.get(id) || 0) + (i === 0 || i === w.nodes.length - 1 ? 2 : 1)));
  const interesting = id => { const t = N.get(id)?.tags || {}; return !!(t.entrance || t.barrier || t.highway === 'elevator' || t.door); };

  const gNodes = new Map(), gEdges = [];
  const addNode = (id) => {
    const key = `osm:n${id}`;
    if (gNodes.has(key)) return key;
    const n = N.get(id), t = n.tags || {};
    const node = { id: key, lat: n.lat, lon: n.lon, kind: 'junction', prov: osmProv(`node/${id}`) };
    if (t.barrier && NOT_PUBLIC.has(t.access) && !FOOT_OK.has(t.foot)) { node.public = false; node.kind = 'barrier'; node.name = t.name || 'שער'; }
    if (t.highway === 'elevator') node.kind = 'lift';
    gNodes.set(key, node);
    return key;
  };
  for (const w of ways) {
    const t = w.tags || {};
    const isPublic = !(NOT_PUBLIC.has(t.access) && !FOOT_OK.has(t.foot)) && t.service !== 'emergency_access';
    const indoor = t.highway === 'corridor' || t.indoor === 'yes' || t.indoor === 'corridor' || t.tunnel === 'building_passage';
    const stairs = t.highway === 'steps';
    const ring = w.nodes[0] === w.nodes[w.nodes.length - 1];
    let start = 0;
    for (let i = 1; i < w.nodes.length; i++) {
      const id = w.nodes[i];
      if (i === w.nodes.length - 1 || usage.get(id) > 1 || interesting(id)) {
        const seg = w.nodes.slice(start, i + 1);
        const coords = seg.map(ll).filter(Boolean);
        if (coords.length >= 2) {
          const a = addNode(seg[0]), b = addNode(seg[seg.length - 1]);
          if (a !== b) gEdges.push({
            id: `osm:w${w.id}:${start}`, from: a, to: b,
            kind: indoor ? 'corridor' : ROADS.has(t.highway) ? 'road' : 'footway',
            name: t['name:he'] || t.name || undefined,
            hw: t.highway, svc: t.service || undefined,   // OSM road class (used by the topology builder to drop parking aisles)
            indoor, stairs,
            wheelchair: stairs ? (t.ramp === 'yes' || t.wheelchair === 'yes') : t.wheelchair !== 'no',
            public: isPublic,
            oneway: false, // one-way applies to cars, not to people
            length: Math.round(polylineLength(coords) * 10) / 10,
            polyline: coords.length > 2 ? coords.map(round6) : undefined,
            prov: osmProv(`way/${w.id}`, 'medium', ring && t.area === 'yes' ? { note: 'outline of a pedestrian area' } : {}),
          });
        }
        start = i;
      }
    }
  }

  // ---- entrances (doors)
  const entrances = [];
  for (const n of N.values()) {
    const t = n.tags || {};
    if (!t.entrance && !t.door && t.emergency !== 'emergency_ward_entrance') continue;
    const id = `ent-osm-${n.id}`;
    let buildingId = buildingOfNode.get(n.id) || null;
    if (!buildingId) {
      const b = buildings.find(b => pointInPolygon([n.lat, n.lon], b.outline));
      buildingId = b ? b.id : null;
    }
    if (!buildingId) continue; // gates of other campuses, schools etc.
    const publicAccess = classifyAccess(t);
    const hours = parseOpeningHours(t.opening_hours);
    const notes = [];
    if (t.emergency === 'emergency_ward_entrance') notes.push('כניסת מיון');
    if (t.note) notes.push('OSM: ' + t.note);
    if (t.fixme) notes.push('OSM fixme: ' + t.fixme);
    if (t.opening_hours && hours === undefined) notes.push('שעות ב-OSM: ' + t.opening_hours);
    entrances.push({
      id, name: t['name:he'] || t.name || entranceName(t), buildingId,
      nodeId: `door:${id}`, lat: n.lat, lon: n.lon,
      publicAccess, kindOsm: t.entrance || t.door || 'yes',
      floor: t['level:ref'] ?? t.level ?? null,
      hours: hours === undefined ? null : hours,
      wheelchair: t.wheelchair === 'yes' ? true : t.wheelchair === 'no' ? false : null,
      note: notes.join(' · ') || null,
      prov: osmProv(`node/${n.id}`, publicAccess === 'yes' ? 'medium' : 'low'),
    });
    // if the door lies on a walkable way it is already a graph node: convert it
    const key = `osm:n${n.id}`;
    if (gNodes.has(key)) {
      const gn = gNodes.get(key);
      gNodes.delete(key);
      gn.id = `door:${id}`; gn.kind = 'door'; gn.entranceId = id; gn.buildingId = buildingId;
      gNodes.set(gn.id, gn);
      for (const e of gEdges) { if (e.from === key) e.from = gn.id; if (e.to === key) e.to = gn.id; }
    }
  }

  // ---- parkings (only geometry; status rules come from official/owner data)
  const parkings = [];
  const safetyZones = [];
  for (const w of W.values()) {
    const t = w.tags || {};
    if (t.amenity !== 'parking' || !w.nodes) continue;
    const coords = wayCoords(w);
    if (coords.length < 3) continue;
    const c = round6(centroid(coords.slice(0, -1)));
    if (t.disabled === 'designated' || t.motor_vehicle === 'no' && t.disabled) {
      safetyZones.push({ id: `sz-osm-${w.id}`, kind: 'disabled', polygon: simplify(coords, 0.5).map(round6), prov: osmProv(`way/${w.id}`) });
      continue;
    }
    parkings.push({
      id: `p-osm-${w.id}`, name: t.name || null, type: /multi-storey|underground/.test(t.parking || '') ? 'garage' : 'lot',
      official: false, access: NOT_PUBLIC.has(t.access) ? 'private' : (t.access || null), fee: t.fee || null,
      lat: c[0], lon: c[1], outline: simplify(coords, 0.5).map(round6), nodeId: `park:p-osm-${w.id}`,
      osmTags: pick(t, ['parking', 'capacity', 'capacity:disabled', 'opening_hours', 'description', 'building:levels', 'covered']),
      rules: [], // unknown → never recommended until someone adds verified rules
      prov: osmProv(`way/${w.id}`, 'medium', { note: 'מיקום מ-OSM בלבד; אין מידע על שעות/מחיר – לא מוצג כהמלצה עד אימות' }),
    });
  }

  // ---- safety zones
  for (const w of W.values()) {
    const t = w.tags || {};
    if (t.service === 'emergency_access' || t.emergency === 'yes' && t.highway) safetyZones.push({ id: `sz-osm-${w.id}`, kind: 'emergency_lane', line: wayCoords(w).map(round6), buffer: 6, prov: osmProv(`way/${w.id}`) });
    if (t.aeroway === 'helipad' || /מנחת/.test(t.name || '')) {
      const cs = wayCoords(w);
      if (cs.length >= 3) safetyZones.push({ id: `sz-osm-${w.id}`, kind: 'helipad', polygon: simplify(cs, 0.5).map(round6), prov: osmProv(`way/${w.id}`) });
    }
  }
  for (const n of N.values()) {
    const t = n.tags || {};
    if (t.emergency === 'emergency_ward_entrance') safetyZones.push({ id: `sz-osm-n${n.id}`, kind: 'ambulance_bay', center: round6([n.lat, n.lon]), radius: 15, prov: osmProv(`node/${n.id}`, 'low', { note: 'רדיוס משוער סביב כניסת המיון' }) });
    if (t.emergency === 'fire_hydrant') safetyZones.push({ id: `sz-osm-n${n.id}`, kind: 'fire_access', center: round6([n.lat, n.lon]), radius: 3, prov: osmProv(`node/${n.id}`) });
  }

  return { buildings, entrances, parkings, safetyZones, graph: { nodes: [...gNodes.values()], edges: gEdges } };
}

function classifyAccess(t) {
  if (NOT_PUBLIC.has(t.access) || t.access === 'employees' || t.access === 'staff') return 'no';
  if (t.emergency === 'emergency_ward_entrance') return 'yes';
  if (['yes', 'permissive', 'customers', 'public'].includes(t.access)) return 'yes';
  if (t.entrance === 'main') return 'yes';
  return 'unknown'; // entrance=yes / service / staircase / emergency exits: must be confirmed on site
}

function entranceName(t) {
  if (t.emergency === 'emergency_ward_entrance') return 'כניסת המיון';
  return { main: 'כניסה ראשית', service: 'כניסת שירות', staircase: 'כניסה לחדר מדרגות', emergency: 'יציאת חירום' }[t.entrance] || 'כניסה';
}

/** Very small opening_hours parser: "24/7", "HH:MM-HH:MM", "Mo-Fr HH:MM-HH:MM; ...". Returns undefined if unsupported. */
export function parseOpeningHours(s) {
  if (!s) return undefined;
  s = s.trim();
  if (s === '24/7') return [{ days: ALL, from: '00:00', to: '24:00' }];
  const DAYS = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
  const out = [];
  for (const part of s.split(';').map(x => x.trim()).filter(Boolean)) {
    const m = /^(?:([A-Z][a-z](?:-[A-Z][a-z])?(?:,[A-Z][a-z](?:-[A-Z][a-z])?)*)\s+)?(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(part);
    if (!m) return undefined;
    let days = ALL;
    if (m[1]) {
      days = [];
      for (const r of m[1].split(',')) {
        const [a, b] = r.split('-').map(d => DAYS[d]);
        if (a === undefined) return undefined;
        if (b === undefined) days.push(a); else for (let d = a; ; d = (d + 1) % 7) { days.push(d); if (d === b) break; }
      }
    }
    out.push({ days, from: m[2], to: m[3] });
  }
  return out;
}

const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));

// ---------------------------------------------------------------------------
const isImported = r => r?.prov && (r.prov.source === 'osm' || r.prov.source === 'generated');

const OVERLAY_KEYS = ['publicInterior', 'publicInteriorNote', 'hubPoint'];

/**
 * Merge freshly imported OSM records into the existing dataset.
 *  - records from other sources (official, owner, crowd) are always kept
 *  - if such a record has the SAME id as an imported one (e.g. the owner verified an OSM door),
 *    the edited record wins and the imported copy is dropped
 *  - a few overlay keys set by the seed script on OSM buildings are carried over
 */
export function merge(existing, imported) {
  const out = structuredClone(existing);
  const mergeList = (oldList = [], newList = []) => {
    const kept = oldList.filter(r => !isImported(r));
    const keptIds = new Set(kept.map(r => r.id));
    const oldById = new Map(oldList.map(r => [r.id, r]));
    const fresh = newList.filter(r => !keptIds.has(r.id)).map(r => {
      const old = oldById.get(r.id);
      if (!old) return r;
      const o = { ...r };
      for (const k of OVERLAY_KEYS) if (old[k] !== undefined) o[k] = old[k];
      return o;
    });
    return [...kept, ...fresh];
  };
  for (const k of ['buildings', 'entrances', 'parkings', 'safetyZones']) out[k] = mergeList(out[k], imported[k]);
  out.graph = out.graph || { nodes: [], edges: [] };
  out.graph.nodes = mergeList(out.graph.nodes, imported.graph.nodes);
  out.graph.edges = mergeList(out.graph.edges, imported.graph.edges);
  return out;
}

/** Drop graph parts that are not connected to anything useful (keeps file small). */
export function pruneGraph(data) {
  const g = data.graph;
  const adj = new Map();
  for (const e of g.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from).push(e.to); adj.get(e.to).push(e.from);
  }
  const seeds = new Set([...(data.parkings || []).map(p => p.nodeId), ...(data.destinations || []).map(d => d.nodeId), ...(data.entrances || []).map(e => e.nodeId)].filter(Boolean));
  const seen = new Set();
  const stack = [...seeds].filter(s => adj.has(s));
  while (stack.length) { const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); for (const y of adj.get(x) || []) if (!seen.has(y)) stack.push(y); }
  const before = g.nodes.length;
  g.nodes = g.nodes.filter(n => seen.has(n.id) || !isImported(n) || seeds.has(n.id));
  const keep = new Set(g.nodes.map(n => n.id));
  g.edges = g.edges.filter(e => keep.has(e.from) && keep.has(e.to));
  return before - g.nodes.length;
}

// ---------------------------------------------------------------------------
async function main() {
  let raw;
  if (fromFile) raw = JSON.parse(fs.readFileSync(fromFile, 'utf8'));
  else {
    raw = await download();
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(raw));
  }
  const imported = transform(raw);
  const existing = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : { meta: {}, sources: [], buildings: [], destinations: [], parkings: [], entrances: [], safetyZones: [], graph: { nodes: [], edges: [] }, routeNotes: [] };
  // official/owner parkings that point at an OSM area: drop the duplicate OSM-only record
  const merged = merge(existing, imported);
  const claimed = new Set(merged.parkings.filter(p => p.osmRef).map(p => `p-osm-${p.osmRef.replace('way/', '')}`));
  for (const p of merged.parkings) if (p.osmRef) {
    const osm = imported.parkings.find(x => x.id === `p-osm-${p.osmRef.replace('way/', '')}`);
    if (osm) { p.outline = osm.outline; if (p.lat == null && !p.coordsFromOfficial) { p.lat = osm.lat; p.lon = osm.lon; } }
  }
  merged.parkings = merged.parkings.filter(p => !claimed.has(p.id));
  attachAll(merged);
  const pruned = pruneGraph(merged);
  merged.meta = { ...(merged.meta || {}), osmImported: TODAY, bbox: BBOX, osmAttribution: '© OpenStreetMap contributors, ODbL 1.0' };
  fs.writeFileSync(DATA, formatData(merged));
  const c = k => merged[k].length;
  console.log(`buildings ${c('buildings')}, entrances ${c('entrances')} (public: ${merged.entrances.filter(e => e.publicAccess === 'yes').length}), parkings ${c('parkings')}, safety zones ${c('safetyZones')}, graph ${merged.graph.nodes.length} nodes / ${merged.graph.edges.length} edges (pruned ${pruned})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e); process.exit(1); });
