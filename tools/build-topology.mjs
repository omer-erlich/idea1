#!/usr/bin/env node
// Builds data/topology.json (+ data/topology.graphml) – the "human perspective" graph of the campus:
//   nodes  = clinics, rooms, lobbies, admin desks, elevators/stairs, floors, doors, parking, big junctions
//   edges  = hallways, passages between buildings, elevator rides / floor exits, roads & paths (weights in seconds)
// Inputs: data/sheba.json (OSM + official), data/topology-seed.json (hand-curated indoor structure),
//         data/clinics-directory.json (optional; from tools/build-directory.mjs)
//
//   node tools/build-topology.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { haversine, pointInPolygon, round6, simplify } from '../js/engine/geo.js';
import { attachPoint, mainNetwork } from '../js/engine/attach.js';
import { parseLocation } from './lib/parse-location.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const INDOOR_KINDS = new Set(['hallway', 'passage', 'stairs', 'elevator', 'floor-exit', 'moving-walkway', 'link']);
const CONF_FOR_GROUPS = new Set(['osm', 'text']);          // inferred links never merge buildings into one complex

export function buildTopology({ sheba, seed, directory = [], busStops: busStopsIn = [] }) {
  const W = seed.weights;
  const nodes = new Map();
  const edges = [];
  const edgeKeys = new Set();
  const problems = [];
  let seq = 0;

  const addNode = n => { if (!nodes.has(n.id)) nodes.set(n.id, n); return nodes.get(n.id); };
  const addEdge = e => {
    if (e.a === e.b) return null;
    if (!nodes.has(e.a) || !nodes.has(e.b)) { problems.push(`edge ${e.a} — ${e.b}: missing node`); return null; }
    const key = [e.a, e.b].sort().join('|') + '|' + e.kind;
    if (edgeKeys.has(key)) return null;
    edgeKeys.add(key);
    const edge = { id: e.id || `e${++seq}`, a: e.a, b: e.b, kind: e.kind, sec: Math.max(1, Math.round(e.sec)), est: e.est !== false, conf: e.conf || 'inferred', indoor: INDOOR_KINDS.has(e.kind), src: e.src || null, note: e.note || null };
    if (e.m != null) edge.m = Math.round(e.m);
    if (e.name) edge.name = e.name;
    if (e.stairs) edge.stairs = true;
    if (e.poly && e.poly.length > 2) edge.poly = e.poly;      // true geometry for drawing the route on the map
    edges.push(edge);
    return edge;
  };

  // ------------------------------------------------------------------ buildings
  const shebaB = new Map(sheba.buildings.map(b => [b.id, b]));
  const osmToKey = new Map();
  const buildings = new Map();
  for (const sb of seed.buildings) {
    const ob = sb.osm ? shebaB.get(sb.osm) : null;
    buildings.set(sb.id, { id: sb.id, name: sb.name, osm: sb.osm, center: ob?.center || null, outline: ob?.outline || null, anchor: sb.anchor, lobby: sb.lobby, floors: [...sb.floors], geoApprox: !ob });
    if (sb.osm) osmToKey.set(sb.osm, sb.id);
  }
  for (const sb of seed.buildings) {
    if (!sb.geoHint) continue;
    const near = buildings.get(sb.geoHint.near)?.center;
    if (!near) continue;
    const b = buildings.get(sb.id);
    b.center = round6([near[0] + sb.geoHint.dym / 110540, near[1] + sb.geoHint.dxm / (111320 * Math.cos(near[0] * Math.PI / 180))]);
    b.geoNote = sb.geoHint.note;
  }
  const bOfPoint = p => {
    for (const b of sheba.buildings) if (b.outline && pointInPolygon(p, b.outline) && osmToKey.has(b.id)) return osmToKey.get(b.id);
    let best = null, bd = 12;
    for (const b of sheba.buildings) { if (!osmToKey.has(b.id)) continue; for (const q of b.outline || []) { const d = haversine(p, q); if (d < bd) { bd = d; best = b; } } }
    return best ? osmToKey.get(best.id) : null;
  };

  // ------------------------------------------------------------------ seed nodes
  for (const s of seed.nodes) {
    const b = buildings.get(s.building);
    if (!b) { problems.push(`seed node ${s.id}: unknown building ${s.building}`); continue; }
    addNode({ id: s.id, label: s.label, kind: s.kind, building: s.building, floor: s.floor ?? null, lat: b.center?.[0] ?? null, lon: b.center?.[1] ?? null, geo: b.center ? 'building' : null,
      conf: s.conf || 'text', src: s.src || null, note: s.note || null, serves: s.serves, exits: s.exits });
  }

  // ------------------------------------------------------------------ floors, elevators, floor exits
  const FLOOR_LABEL = f => (f === '0' ? 'קומת כניסה (0)' : `קומה ${f}`);
  const elevatorsOf = b => [...nodes.values()].filter(n => n.building === b && (n.kind === 'elevator' || n.kind === 'stairs') && n.serves);
  function ensureFloor(b, f) {
    const id = `${b}/F${f}`;
    if (nodes.has(id)) return id;
    const bld = buildings.get(b);
    addNode({ id, label: FLOOR_LABEL(f), kind: 'floor', building: b, floor: f, lat: bld.center?.[0] ?? null, lon: bld.center?.[1] ?? null, geo: bld.center ? 'building' : null, conf: 'text', src: 'floor declared in seed / clinic location text' });
    const exitSec = Math.abs(+f);
    const serving = elevatorsOf(b).filter(e => e.serves.includes(f));
    if (f === '0' && bld.lobby && nodes.has(bld.lobby)) addEdge({ a: bld.lobby, b: id, kind: 'link', sec: 5, conf: 'text', src: 'ground floor' });
    for (const e of serving) {
      const target = e.exits?.[f] || id;
      addEdge({ a: e.id, b: target, kind: 'floor-exit', sec: W.floor_exit_base_sec + W.floor_exit_per_level_sec * exitSec, conf: e.conf === 'text' ? 'text' : 'inferred', src: e.src, note: `יציאה לקומה ${f}` });
      if (target !== id) addEdge({ a: target, b: id, kind: 'hallway', sec: 12, conf: 'text', src: e.src });
    }
    if (!serving.length && f !== '0') {
      const all = elevatorsOf(b);
      if (all.length) for (const e of all) addEdge({ a: e.id, b: id, kind: 'floor-exit', sec: W.floor_exit_base_sec + W.floor_exit_per_level_sec * exitSec, conf: 'inferred', src: 'floor not mentioned in elevator list – assumed reachable' });
      else if (bld.lobby) addEdge({ a: bld.lobby, b: id, kind: 'stairs', sec: 30 + 10 * exitSec, conf: 'inferred', src: 'no elevator known – assumed stairs' });
    }
    return id;
  }
  for (const b of buildings.values()) for (const f of b.floors) ensureFloor(b.id, f);
  for (const n of [...nodes.values()]) {                      // wing nodes "tower/F2/W" hang under their floor
    const m = /^([a-z0-9]+)\/F(-?\d+)\/([A-Z]+)$/.exec(n.id);
    if (m) { const fid = ensureFloor(m[1], m[2]); addEdge({ a: fid, b: n.id, kind: 'hallway', sec: 12, conf: n.conf, src: n.src }); }
  }

  // ------------------------------------------------------------------ seed edges
  for (const e of seed.edges) {
    const needFloor = id => { const m = /^([a-z0-9]+)\/F(-?\d+)$/.exec(id); if (m && buildings.has(m[1])) ensureFloor(m[1], m[2]); };
    needFloor(e.a); needFloor(e.b);
    addEdge({ a: e.a, b: e.b, kind: e.kind, sec: e.sec, est: e.est, conf: e.conf, src: e.src, note: e.note });
  }

  // ------------------------------------------------------------------ doors (OSM entrances)
  for (const en of sheba.entrances || []) {
    if (en.lat == null || !osmToKey.has(en.buildingId)) continue;
    const bk = osmToKey.get(en.buildingId), bld = buildings.get(bk);
    const id = `door:${en.id}`;
    addNode({ id, label: `${en.name || 'כניסה'} · ${bld.name.split('(')[0].trim()}`, kind: 'entrance', building: bk, floor: en.floor ?? '0', lat: en.lat, lon: en.lon, geo: 'exact',
      conf: en.prov?.source === 'osm' ? 'osm' : 'text', src: en.prov?.osm ? `OSM ${en.prov.osm}` : en.prov?.source, publicAccess: en.publicAccess, hours: en.hours || null, note: en.note || null });
    if (bld.lobby && nodes.has(bld.lobby)) addEdge({ a: id, b: bld.lobby, kind: 'link', sec: 6, conf: 'osm', src: 'door → building lobby (estimated)' });
  }

  // ------------------------------------------------------------------ OSM indoor corridors (cross-building evidence)
  const gNode = new Map(sheba.graph.nodes.map(n => [n.id, n]));
  const topoIdOfGraphNode = id => {
    if (id.startsWith('door:') && nodes.has(id)) return id;
    const n = gNode.get(id); if (!n) return null;
    const tid = `osm:${id}`;
    if (!nodes.has(tid)) {
      const bk = bOfPoint([n.lat, n.lon]);
      addNode({ id: tid, label: 'מסדרון פנימי (OSM)', kind: 'hall', building: bk || null, floor: '0', lat: n.lat, lon: n.lon, geo: 'exact', conf: 'osm', src: `OSM ${n.prov?.osm || id}` });
      const bld = bk && buildings.get(bk);
      if (bld && nodes.has(bld.anchor)) addEdge({ a: tid, b: bld.anchor, kind: 'link', sec: 5, conf: 'osm', src: 'corridor end → building (estimated)' });
    }
    return tid;
  };
  for (const e of sheba.graph.edges) {
    if (!(e.kind === 'corridor' && e.indoor)) continue;
    const A = gNode.get(e.from), B = gNode.get(e.to); if (!A || !B) continue;
    const ba = A.id.startsWith('door:') ? nodes.get(A.id)?.building : bOfPoint([A.lat, A.lon]);
    const bb = B.id.startsWith('door:') ? nodes.get(B.id)?.building : bOfPoint([B.lat, B.lon]);
    if (!ba && !bb) continue;                                                  // not part of the hospital buildings we model
    if (ba === bb && e.length < 25) continue;                                  // tiny stubs
    const a = topoIdOfGraphNode(e.from), b = topoIdOfGraphNode(e.to);
    if (a && b) addEdge({ a, b, poly: e.polyline, kind: ba && bb && ba !== bb ? 'passage' : 'hallway', sec: e.length / W.indoor_mps, m: e.length, est: false, conf: 'osm', src: `OSM ${e.prov?.osm || e.id} (${Math.round(e.length)} מ')`, note: 'מסדרון פנימי ממופה ב-OSM' });
  }

  // ------------------------------------------------------------------ outdoor network (simplified roads / paths)
  const keepEdge = e => !e.indoor && e.public !== false && ['footway', 'road'].includes(e.kind)
    && !(e.hw === 'service' && ['parking_aisle', 'driveway', 'emergency_access'].includes(e.svc))
    && !['cycleway', 'track', 'proposed', 'construction'].includes(e.hw);
  const tmp = { nodes: [], edges: [] };
  const usedIds = new Set();
  for (const e of sheba.graph.edges) if (keepEdge(e)) { tmp.edges.push({ ...e }); usedIds.add(e.from); usedIds.add(e.to); }
  for (const n of sheba.graph.nodes) if (usedIds.has(n.id)) tmp.nodes.push({ ...n });
  const main = mainNetwork(tmp);
  const parkings = (sheba.parkings || []).filter(p => p.lat != null && !(p.id.startsWith('p-osm-') && p.access === 'private'));
  for (const p of parkings) attachPoint(tmp, { id: `park:${p.id}`, lat: p.lat, lon: p.lon, kind: 'parking', maxDist: 120, mainNetwork: main });
  const busStops = (busStopsIn || []).filter(b => !b.nearDuplicateOf);
  const busKey = b => (String(b.id ?? b.osmId).startsWith('bus:') ? String(b.id) : `bus:${b.id ?? b.osmId}`);
  for (const b of busStops) attachPoint(tmp, { id: busKey(b), lat: b.lat, lon: b.lon, kind: 'busstop', maxDist: 60, mainNetwork: main });
  const doorIds = [...nodes.values()].filter(n => n.kind === 'entrance').map(n => n.id);
  for (const id of doorIds) {
    const n = nodes.get(id);
    const onWay = tmp.edges.some(e => e.from === id || e.to === id);
    if (!onWay) attachPoint(tmp, { id, lat: n.lat, lon: n.lon, kind: 'door', maxDist: 60, mainNetwork: main });
    else if (!tmp.nodes.some(x => x.id === id)) tmp.nodes.push({ id, lat: n.lat, lon: n.lon, kind: 'door' });
  }

  // buildings with no mapped door: link the lobby to the nearest path (estimate – flagged "inferred")
  for (const b of buildings.values()) {
    if (!b.center || !nodes.has(b.lobby)) continue;
    if ([...nodes.values()].some(n => n.kind === 'entrance' && n.building === b.id)) continue;
    attachPoint(tmp, { id: `bld:${b.id}`, lat: b.center[0], lon: b.center[1], kind: 'door', maxDist: 90, mainNetwork: main });
  }

  // adjacency + contraction of plain degree-2 chains into single weighted edges
  const tn = new Map(tmp.nodes.map(n => [n.id, n]));
  const adj = new Map();
  for (const e of tmp.edges) {
    if (!tn.has(e.from) || !tn.has(e.to)) continue;
    for (const [x, y] of [[e.from, e.to], [e.to, e.from]]) { if (!adj.has(x)) adj.set(x, []); adj.get(x).push({ to: y, e }); }
  }
  const isSpecial = id => id.startsWith('park:') || id.startsWith('door:') || id.startsWith('bld:') || id.startsWith('bus:');
  const keep = new Set([...adj.keys()].filter(id => isSpecial(id) || adj.get(id).length >= 3 || adj.get(id).length === 1));
  const ROAD_RANK = { secondary: 5, secondary_link: 4, tertiary: 4, tertiary_link: 3, residential: 3, unclassified: 3, service: 2, footway: 1, pedestrian: 1, steps: 1, path: 1 };
  const visited = new Set();
  let chains = [];
  const namesAt = new Map();
  const rankAt = new Map();
  for (const id of keep) {
    for (const first of adj.get(id) || []) {
      if (visited.has(first.e)) continue;
      let cur = first.to, prevId = id, len = 0, rank = 0, steps = 0, count = 0;
      const names = new Set();
      const pts = [[tn.get(id).lat, tn.get(id).lon]];
      const absorb = (ed, fromId, toId) => {
        len += ed.length; if (ed.name) names.add(ed.name); rank = Math.max(rank, ROAD_RANK[ed.hw] || 1); if (ed.stairs) steps++; count++; visited.add(ed);
        const A = tn.get(fromId), B = tn.get(toId);
        let seg = ed.polyline && ed.polyline.length >= 2 ? ed.polyline.slice() : [[A.lat, A.lon], [B.lat, B.lon]];
        if (ed.from !== fromId) seg.reverse();
        pts.push(...seg.slice(1));
      };
      absorb(first.e, id, cur);
      while (!keep.has(cur)) {
        const nxt = adj.get(cur).find(x => !visited.has(x.e));
        if (!nxt) break;
        prevId = cur; absorb(nxt.e, cur, nxt.to); cur = nxt.to;
      }
      if (cur === id) continue;
      for (const x of [id, cur]) {
        if (!namesAt.has(x)) namesAt.set(x, new Set());
        for (const nm of names) namesAt.get(x).add(nm);
        rankAt.set(x, Math.max(rankAt.get(x) || 0, rank));
      }
      chains.push({ a: id, b: cur, len, names: [...names], rank, stairs: steps === count && steps > 0, pts });
    }
  }
  // a human sees one crossing, not five OSM nodes: merge junctions closer than MERGE_M, drop dead-end stubs
  const MERGE_M = 25;
  const mp = new Map();
  const mfind = x => { if (!mp.has(x)) mp.set(x, x); while (mp.get(x) !== x) { mp.set(x, mp.get(mp.get(x))); x = mp.get(x); } return x; };
  for (const c of chains) if (c.len <= MERGE_M && !isSpecial(c.a) && !isSpecial(c.b)) mp.set(mfind(c.a), mfind(c.b));
  const members = new Map();
  for (const c of chains) for (const x of [c.a, c.b]) { const r = isSpecial(x) ? x : mfind(x); if (!members.has(r)) members.set(r, new Set()); members.get(r).add(x); }
  for (const [r, set] of members) {
    if (set.size === 1 && set.has(r)) continue;
    const pts = [...set].map(x => tn.get(x)).filter(Boolean);
    tn.set(r, { id: r, lat: pts.reduce((a, q) => a + q.lat, 0) / pts.length, lon: pts.reduce((a, q) => a + q.lon, 0) / pts.length, kind: 'junction' });
    const nm = new Set(); let rk = 0, dg = 0;
    for (const x of set) { for (const q of namesAt.get(x) || []) nm.add(q); rk = Math.max(rk, rankAt.get(x) || 0); dg += adj.get(x)?.length || 0; }
    namesAt.set(r, nm); rankAt.set(r, rk); adj.set(r, adj.get(r) || new Array(Math.min(dg, 6)).fill(0));
  }
  const bestPair = new Map();
  for (const c of chains) {
    const a = isSpecial(c.a) ? c.a : mfind(c.a), b = isSpecial(c.b) ? c.b : mfind(c.b);
    if (a === b) continue;
    const k = [a, b].sort().join('|');
    const prev = bestPair.get(k);
    if (!prev || c.len < prev.len) bestPair.set(k, { ...c, a, b });
  }
  chains = [...bestPair.values()];
  // roads far from anything we model are just noise for a hospital-walking graph
  const TRIM_M = 170;
  const anchorPts = [...buildings.values()].filter(b => b.center).map(b => b.center)
    .concat(parkings.map(p => [p.lat, p.lon])).concat([...nodes.values()].filter(n => n.kind === 'entrance').map(n => [n.lat, n.lon]));
  const nearModel = id => { if (isSpecial(id)) return true; const g = tn.get(id); return !!g && anchorPts.some(q => haversine([g.lat, g.lon], q) <= TRIM_M); };
  chains = chains.filter(c => nearModel(c.a) && nearModel(c.b));
  for (let changed = true; changed;) {                       // prune non-special dead ends repeatedly
    changed = false;
    const deg = new Map();
    for (const c of chains) for (const x of [c.a, c.b]) deg.set(x, (deg.get(x) || 0) + 1);
    const before = chains.length;
    chains = chains.filter(c => !((deg.get(c.a) === 1 && !isSpecial(c.a)) || (deg.get(c.b) === 1 && !isSpecial(c.b))));
    if (chains.length !== before) changed = true;
  }
  const chainDeg = new Map();
  for (const c of chains) for (const x of [c.a, c.b]) chainDeg.set(x, (chainDeg.get(x) || 0) + 1);

  // drop outdoor fragments that touch neither a door nor a parking lot
  const uf = new Map();
  const find = x => { while (uf.get(x) !== x) { uf.set(x, uf.get(uf.get(x))); x = uf.get(x); } return x; };
  for (const c of chains) for (const x of [c.a, c.b]) if (!uf.has(x)) uf.set(x, x);
  for (const c of chains) uf.set(find(c.a), find(c.b));
  const useful = new Set();
  for (const id of uf.keys()) if (isSpecial(id)) useful.add(find(id));
  // parking nodes
  const parkingById = new Map(parkings.map(p => [`park:${p.id}`, p]));
  for (const [pid, p] of parkingById) {
    if (!uf.has(pid)) continue;
    addNode({ id: pid, label: p.name || 'חניה (OSM, ללא מידע)', kind: 'parking', building: null, floor: null, lat: p.lat, lon: p.lon, geo: 'exact', conf: p.prov?.source === 'osm' ? 'osm' : 'text',
      src: p.prov?.osm ? `OSM ${p.prov.osm}` : p.prov?.url || p.prov?.source, official: !!p.official, mainOfficial: !!p.mainOfficial, note: p.note || null });
  }
  for (const b of busStops) {
    const id = busKey(b);
    if (!uf.has(id)) continue;
    const refs = [...new Set((b.lines || []).map(l => l.ref).filter(Boolean))];
    addNode({ id, label: `תחנה: ${b.name || 'אוטובוס'}`, kind: 'busstop', building: null, floor: null, lat: b.lat, lon: b.lon, geo: 'exact', conf: String(b.id).startsWith('gov:') ? 'text' : 'osm', src: b.src || `OSM node ${b.osmId}`,
      lines: refs.length ? refs : undefined, note: refs.length ? `קווים (${String(b.id).startsWith('gov:') ? 'משרד התחבורה' : 'OSM'}): ${refs.join(', ')}` : 'אין מידע על קווים בתחנה' });
  }
  for (const c of chains) {
    if (!useful.has(find(c.a))) continue;
    for (const id of [c.a, c.b]) {
      if (nodes.has(id) || id.startsWith('bld:')) continue;
      const g = tn.get(id);
      const names = [...(namesAt.get(id) || [])].slice(0, 2);
      addNode({ id: `j:${id}`, label: names.length ? `צומת ${names.join(' / ')}` : 'צומת', kind: 'junction', building: null, floor: null, lat: g.lat, lon: g.lon, geo: 'exact', conf: 'osm', src: 'OSM', big: (chainDeg.get(id) || 0) >= 4 || ((rankAt.get(id) || 0) >= 3 && (chainDeg.get(id) || 0) >= 3) });
    }
    const idOf = id => (id.startsWith('bld:') ? buildings.get(id.slice(4)).lobby : nodes.has(id) ? id : `j:${id}`);
    const guessed = c.a.startsWith('bld:') || c.b.startsWith('bld:');
    const endPt = id => { const n = nodes.get(idOf(id)); return n ? [n.lat, n.lon] : (tn.has(id) ? [tn.get(id).lat, tn.get(id).lon] : null); };
    const ptsA = endPt(c.a), ptsB = endPt(c.b);
    const poly = c.pts && ptsA && ptsB ? simplify([ptsA, ...c.pts.slice(1, -1), ptsB], 1.5).map(p => [+p[0].toFixed(5), +p[1].toFixed(5)]) : null;
    addEdge({ a: idOf(c.a), b: idOf(c.b), poly, kind: c.rank >= 3 ? 'road' : 'path', sec: c.len / W.walk_mps, m: c.len, est: guessed, conf: guessed ? 'inferred' : 'osm', name: c.names.slice(0, 2).join(' / ') || undefined, stairs: c.stairs,
      src: guessed ? 'כניסה לא ממופה ב-OSM – חיבור משוער לדרך הקרובה' : 'OSM (מסלול הליכה לאורך הדרך)' });
  }
  // official facts that tie parking to a building
  if (nodes.has('park:p-central') && nodes.has('central/lobby')) addEdge({ a: 'park:p-central', b: 'central/lobby', kind: 'link', sec: 8, conf: 'text', src: 'sheba.co.il/locations – "החניון המרכזי – מרכז הצומת"' });
  if (nodes.has('park:p-cancer') && nodes.has('cancer/elev')) addEdge({ a: 'park:p-cancer', b: 'cancer/elev', kind: 'link', sec: 20, conf: 'inferred', src: 'locations – חניון מרכז הסרטן הוא חלק מהמרכז (מקומה 3)', note: 'לא ידוע היכן יוצאים מהחניון להולכי רגל' });
  const unplacedParkings = (sheba.parkings || []).filter(p => p.lat == null).map(p => ({ id: p.id, name: p.name }));

  // ------------------------------------------------------------------ clinics (from Sheba's clinics lobby + their location text)
  const ADMIN_RE = /הנהלה|מזכירות|משרד|מנהלה|שירות\s*לקוחות|קבלה|מודיעין/;
  const areaRes = (seed.areaKeywords || []).map(k => ({ ...k, rx: new RegExp(k.re) }));
  const clinicStats = { total: directory.length, placed: 0, unplaced: 0 };
  const targetFor = loc => {
    for (const k of areaRes) {
      if (!k.node || !nodes.has(k.node) || nodes.get(k.node).building !== loc.building) continue;
      if (!k.rx.test(loc.text || '')) continue;
      if (k.floor && loc.floor != null && loc.floor !== k.floor) continue;
      return k.node;
    }
    if (loc.floor != null) {
      if (loc.wing && /^[WEN]$/.test(loc.wing) && nodes.has(`${loc.building}/F${loc.floor}/${loc.wing}`)) return `${loc.building}/F${loc.floor}/${loc.wing}`;
      return ensureFloor(loc.building, loc.floor);
    }
    return buildings.get(loc.building).lobby;
  };
  for (const c of directory) {
    const loc = c.location;
    if (!loc?.building || !buildings.has(loc.building)) { clinicStats.unplaced++; continue; }
    const target = targetFor(loc);
    const conf = loc.via === 'location-text' ? 'text' : 'inferred';
    const id = `clinic:${c.id}`;
    addNode({ id, label: c.name, kind: ADMIN_RE.test(c.name) ? 'admin' : 'clinic', building: loc.building, floor: loc.floor ?? nodes.get(target)?.floor ?? null, lat: nodes.get(target)?.lat ?? null, lon: nodes.get(target)?.lon ?? null, geo: 'building',
      conf, src: `clinics-lobby/${c.href}`, note: loc.text ? `מיקום באתר: ${loc.text}` : `לפי דף ההגעה/Waze (${loc.via})`, dept: c.dept, wing: loc.wing || undefined });
    addEdge({ a: target, b: id, kind: 'hallway', sec: 20, conf, src: 'מיקום מדף המרפאה באתר שיבא; אורך המסדרון משוער' });
    clinicStats.placed++;
  }


  // ------------------------------------------------------------------ interior layout: put indoor nodes INSIDE their building footprint
  // (no floor plans exist, so this is schematic – but routes drawn through these points stay inside the building
  //  instead of one straight line from door to clinic). Doors keep their real position and act as anchors.
  const INTERIOR_SKIP = new Set(['entrance', 'parking', 'junction', 'busstop']);
  const rng = (() => { let a = 12345; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  for (const b of buildings.values()) {
    if (!b.center) continue;
    const members = [...nodes.values()].filter(n => n.building === b.id);
    const inner = members.filter(n => !INTERIOR_SKIP.has(n.kind));
    if (!inner.length) continue;
    const kx = 111320 * Math.cos(b.center[0] * Math.PI / 180), ky = 110540;
    const toXY = ([la, lo]) => [(lo - b.center[1]) * kx, (la - b.center[0]) * ky];
    const outline = b.outline ? b.outline.map(toXY) : null;
    let area = 0;
    if (outline) for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) area += outline[j][0] * outline[i][1] - outline[i][0] * outline[j][1];
    const radius = outline ? Math.max(6, Math.sqrt(Math.abs(area) / 2 / Math.PI)) : 7 + Math.sqrt(inner.length) * 3;
    const P = new Map();
    for (const n of members) {
      if (n.kind === 'entrance' && n.geo === 'exact') P.set(n.id, { x: toXY([n.lat, n.lon])[0], y: toXY([n.lat, n.lon])[1], fixed: true });
      else if (!INTERIOR_SKIP.has(n.kind)) P.set(n.id, { x: (rng() - 0.5) * radius, y: (rng() - 0.5) * radius, fixed: false });
    }
    const links = edges.filter(e => P.has(e.a) && P.has(e.b));
    for (let it = 0; it < 260; it++) {
      const cool = 1 - it / 260;
      const list = [...P.entries()];
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {          // repulsion
        const [, A] = list[i], [, B] = list[j];
        let dx = A.x - B.x, dy = A.y - B.y, d2 = dx * dx + dy * dy;
        if (d2 > 144) continue;
        if (d2 < 0.01) { dx = rng() - 0.5; dy = rng() - 0.5; d2 = 0.3; }
        const d = Math.sqrt(d2), f = 3.2 / d2 * cool;
        if (!A.fixed) { A.x += dx / d * f; A.y += dy / d * f; }
        if (!B.fixed) { B.x -= dx / d * f; B.y -= dy / d * f; }
      }
      for (const e of links) {                                                                 // springs: 1 second ≈ 1 m, clamped to the footprint
        const A = P.get(e.a), B = P.get(e.b);
        const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 0.01;
        const rest = Math.min(Math.max(e.sec * 0.55, 2.5), radius * 0.9), k = 0.12 * cool + 0.02;
        const f = (d - rest) / d * k;
        if (!A.fixed) { A.x += dx * f; A.y += dy * f; }
        if (!B.fixed) { B.x -= dx * f; B.y -= dy * f; }
      }
      for (const [, A] of list) if (!A.fixed) { A.x *= 0.995; A.y *= 0.995; }                   // gravity to the centre
    }
    for (const [id, A] of P) {
      if (A.fixed) continue;
      let { x, y } = A;
      if (outline) for (let t = 0; t < 40 && !pointInPolygon([x, y], outline); t++) { x *= 0.88; y *= 0.88; }
      const n = nodes.get(id);
      n.lat = +(b.center[0] + y / ky).toFixed(6); n.lon = +(b.center[1] + x / kx).toFixed(6); n.geo = 'layout';
    }
  }

  // ------------------------------------------------------------------ importance (weighted betweenness centrality)
  const ids = [...nodes.keys()];
  const index = new Map(ids.map((id, i) => [id, i]));
  const nb = ids.map(() => []);
  for (const e of edges) { const i = index.get(e.a), j = index.get(e.b); nb[i].push([j, e.sec]); nb[j].push([i, e.sec]); }
  const bc = brandes(nb);
  const maxBc = Math.max(1, ...bc);
  for (const id of ids) {
    const n = nodes.get(id), i = index.get(id);
    n.deg = nb[i].length;
    n.bc = Math.round(bc[i]);
    n.imp = +(Math.sqrt(bc[i] / maxBc) * 0.9 + 0.1 * Math.min(1, nb[i].length / 10)).toFixed(3);
  }

  // ------------------------------------------------------------------ which buildings are connected through the inside?
  const nuf = new Map(ids.map(id => [id, id]));
  const nfind = x => { while (nuf.get(x) !== x) { nuf.set(x, nuf.get(nuf.get(x))); x = nuf.get(x); } return x; };
  for (const e of edges) if (e.indoor && CONF_FOR_GROUPS.has(e.conf)) nuf.set(nfind(e.a), nfind(e.b));
  const buf = new Map([...buildings.keys()].map(b => [b, b]));
  const bfind = x => { while (buf.get(x) !== x) { buf.set(x, buf.get(buf.get(x))); x = buf.get(x); } return x; };
  const compBuildings = new Map();
  for (const n of nodes.values()) if (n.building) { const c = nfind(n.id); if (!compBuildings.has(c)) compBuildings.set(c, new Set()); compBuildings.get(c).add(n.building); }
  for (const set of compBuildings.values()) { const arr = [...set]; for (let i = 1; i < arr.length; i++) buf.set(bfind(arr[i]), bfind(arr[0])); }
  const groupMap = new Map();
  for (const b of buildings.keys()) { const r = bfind(b); if (!groupMap.has(r)) groupMap.set(r, []); groupMap.get(r).push(b); }
  const groups = [...groupMap.values()].sort((x, y) => y.length - x.length || x[0].localeCompare(y[0])).map((members, i) => ({
    id: `g${i + 1}`, buildings: members, separate: members.length === 1, size: members.length,
    name: members.length === 1 ? buildings.get(members[0]).name : members.map(m => buildings.get(m).name.split('(')[0].trim()).join(' + '),
  }));
  const groupOf = new Map(groups.flatMap(g => g.buildings.map(b => [b, g.id])));
  const possibleLinks = edges.filter(e => e.indoor && !CONF_FOR_GROUPS.has(e.conf) && nodes.get(e.a).building && nodes.get(e.b).building && nodes.get(e.a).building !== nodes.get(e.b).building)
    .map(e => ({ a: e.a, b: e.b, from: nodes.get(e.a).building, to: nodes.get(e.b).building, src: e.src, note: e.note }));

  // ------------------------------------------------------------------ output
  const outNodes = [...nodes.values()].map(n => {
    const o = { ...n };
    if (o.lat != null) { o.lat = +o.lat.toFixed(6); o.lon = +o.lon.toFixed(6); }
    for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === null) delete o[k];
    return o;
  });
  const outBuildings = [...buildings.values()].map(b => ({ id: b.id, name: b.name, osm: b.osm || undefined, lobby: b.lobby, center: b.center, outline: b.outline, group: groupOf.get(b.id), floors: b.floors, geoApprox: b.geoApprox || undefined, geoNote: b.geoNote }));
  const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const topology = {
    meta: { generated: new Date().toISOString().slice(0, 10), nodes: outNodes.length, edges: edges.length, nodeKinds: count(outNodes, n => n.kind), edgeKinds: count(edges, e => e.kind), clinics: clinicStats,
      unplacedParkings, note: 'sec = estimated walking seconds unless est=false (OSM geometry). conf: text=official Sheba text, osm=OpenStreetMap, inferred=not confirmed. Groups use only osm/text indoor links.' },
    groups, possibleLinks, buildings: outBuildings, nodes: outNodes, edges,
  };
  return { topology, problems };
}

/** Brandes' algorithm, weighted, undirected. nb[i] = [[j, w], ...] */
function brandes(nb) {
  const n = nb.length;
  const bc = new Array(n).fill(0);
  for (let s = 0; s < n; s++) {
    const S = [], P = Array.from({ length: n }, () => []), sigma = new Array(n).fill(0), dist = new Array(n).fill(Infinity), done = new Array(n).fill(false);
    sigma[s] = 1; dist[s] = 0;
    const heap = [[0, s]];
    const push = it => { heap.push(it); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    while (heap.length) {
      const [d, v] = pop();
      if (done[v] || d > dist[v] + 1e-9) continue;
      done[v] = true; S.push(v);
      for (const [w, wt] of nb[v]) {
        const alt = d + wt;
        if (alt < dist[w] - 1e-9) { dist[w] = alt; sigma[w] = sigma[v]; P[w] = [v]; push([alt, w]); }
        else if (Math.abs(alt - dist[w]) <= 1e-9 && !done[w]) { sigma[w] += sigma[v]; P[w].push(v); }
      }
    }
    const delta = new Array(n).fill(0);
    while (S.length) { const w = S.pop(); for (const v of P[w]) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]); if (w !== s) bc[w] += delta[w]; }
  }
  return bc.map(x => x / 2);
}

export function toGraphML(t) {
  const esc = s => String(s ?? '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
  const keys = [['label', 'node', 'string'], ['kind', 'node', 'string'], ['building', 'node', 'string'], ['floor', 'node', 'string'], ['importance', 'node', 'double'], ['conf', 'node', 'string'],
    ['seconds', 'edge', 'double'], ['ekind', 'edge', 'string'], ['estimated', 'edge', 'boolean'], ['econf', 'edge', 'string']];
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
  for (const [k, f, ty] of keys) x += `  <key id="${k}" for="${f}" attr.name="${k}" attr.type="${ty}"/>\n`;
  x += '  <graph id="sheba" edgedefault="undirected">\n';
  for (const n of t.nodes) x += `    <node id="${esc(n.id)}"><data key="label">${esc(n.label)}</data><data key="kind">${n.kind}</data><data key="building">${esc(n.building)}</data><data key="floor">${esc(n.floor)}</data><data key="importance">${n.imp}</data><data key="conf">${n.conf}</data></node>\n`;
  for (const e of t.edges) x += `    <edge id="${esc(e.id)}" source="${esc(e.a)}" target="${esc(e.b)}"><data key="seconds">${e.sec}</data><data key="ekind">${e.kind}</data><data key="estimated">${e.est}</data><data key="econf">${e.conf}</data></edge>\n`;
  return x + '  </graph>\n</graphml>\n';
}

function main() {
  const sheba = read('data/sheba.json');
  const seed = read('data/topology-seed.json');
  const dirFile = path.join(ROOT, 'data/clinics-directory.json');
  const directory = fs.existsSync(dirFile) ? JSON.parse(fs.readFileSync(dirFile, 'utf8')).clinics : [];
  // official Ministry of Transport stops + lines win; OSM stops are only a fallback when that file is missing
  const govFile = path.join(ROOT, 'data/bus-stops-gov.json'), busFile = path.join(ROOT, 'data/bus-stops.json');
  const busStops = fs.existsSync(govFile) ? JSON.parse(fs.readFileSync(govFile, 'utf8')).stops : fs.existsSync(busFile) ? JSON.parse(fs.readFileSync(busFile, 'utf8')).stops : [];
  const { topology, problems } = buildTopology({ sheba, seed, directory, busStops });
  fs.writeFileSync(path.join(ROOT, 'data/topology.json'), JSON.stringify(topology));
  fs.writeFileSync(path.join(ROOT, 'data/topology.graphml'), toGraphML(topology));
  const m = topology.meta;
  console.log(`topology: ${m.nodes} nodes, ${m.edges} edges; clinics placed ${m.clinics.placed}/${m.clinics.total}`);
  console.log('node kinds:', JSON.stringify(m.nodeKinds));
  console.log('edge kinds:', JSON.stringify(m.edgeKinds));
  console.log('indoor-connected groups:'); for (const g of topology.groups) console.log(`  ${g.id}${g.separate ? ' (separate)' : ''}: ${g.name}`);
  if (topology.possibleLinks.length) console.log('unconfirmed possible links:', topology.possibleLinks.map(l => `${l.from}↔${l.to}`).join(', '));
  if (problems.length) { console.log('PROBLEMS:'); for (const p of problems) console.log('  ', p); process.exitCode = 1; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
