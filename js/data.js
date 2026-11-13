// Loading data: static campus file + approved crowd tips (+ votes), merged into one dataset.
import { attachAll } from './engine/attach.js';
import { haversine } from './engine/geo.js';
import { backendEnabled, CONFIG } from './config.js';
import { fetchPublished, fetchVoteSummary } from './backend.js';

const LS_TIPS = 'spg.cache.tips';
const LS_VOTES = 'spg.cache.votes';

export async function loadStatic() {
  const r = await fetch('data/sheba.json');
  if (!r.ok) throw new Error('data ' + r.status);
  return r.json();
}

/** Approved tips: network first, then the last copy we saw (works offline). */
export async function loadApprovedTips() {
  if (!backendEnabled()) return { tips: [], votes: [], offline: false };
  try {
    const [tips, votes] = await Promise.all([withTimeout(fetchPublished(), 6000), withTimeout(fetchVoteSummary(), 6000).catch(() => [])]);
    try { localStorage.setItem(LS_TIPS, JSON.stringify(tips)); localStorage.setItem(LS_VOTES, JSON.stringify(votes)); } catch {}
    return { tips, votes, offline: false };
  } catch {
    let tips = [], votes = [];
    try { tips = JSON.parse(localStorage.getItem(LS_TIPS) || '[]'); votes = JSON.parse(localStorage.getItem(LS_VOTES) || '[]'); } catch {}
    return { tips, votes, offline: true };
  }
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/** Vote summary → Map(targetId → {up, down, lastUp, flagged, stale, verifiedBy}) */
export function voteMap(votes, tips = []) {
  const m = new Map();
  const staleMs = CONFIG.STALE_MONTHS * 30.4 * 864e5;
  for (const v of votes || []) {
    const lastOk = v.last_up || null;
    m.set(v.target_id, {
      up: v.ups || 0, down: v.downs || 0, lastUp: lastOk,
      flagged: (v.downs || 0) >= CONFIG.FLAG_MIN_DOWNVOTES && (v.downs || 0) > (v.ups || 0),
    });
  }
  // stale = crowd tip not confirmed (by a vote or the admin) for N months
  for (const t of tips) {
    const id = t.payload?.id; if (!id) continue;
    const e = m.get(id) || { up: 0, down: 0, lastUp: null, flagged: false };
    const last = [e.lastUp, t.confirmed_at, t.approved_at].filter(Boolean).sort().pop();
    e.stale = last ? (Date.now() - new Date(last).getTime() > staleMs) : true;
    if (e.stale) e.flagged = true;
    m.set(id, e);
  }
  return m;
}

const crowdProv = (t) => t.prov || ({ verified: false, lastVerified: (t.confirmed_at || t.approved_at || '').slice(0, 10) || null, source: 'crowd', tipId: t.id, confidence: 'medium' });

/**
 * Apply approved tips to a copy of the static data and re-attach the graph.
 * Tip kinds: parking, entrance, destination, rule, path (door/passage/shortcut), routeNote. "correction" is admin-only.
 */
export function applyTips(base, tips) {
  const data = structuredClone(base);
  for (const t of tips || []) {
    const p = t.payload || {};
    const prov = crowdProv(t);
    const photo = t.photo_url || null;
    try {
      switch (t.kind) {
        case 'parking': { const ex = data.parkings.find(x => x.id === p.id); upsert(data.parkings, { ...p, official: ex ? !!ex.official : false, mainOfficial: ex?.mainOfficial || undefined, nodeId: keepNode(ex, p), prov }); break; }
        case 'entrance': { const ex = data.entrances.find(x => x.id === p.id); upsert(data.entrances, { ...p, nodeId: keepNode(ex, p), photo: photo || p.photo || ex?.photo || null, prov }); break; }
        case 'destination': { const ex = data.destinations.find(x => x.id === p.id); upsert(data.destinations, { ...p, nodeId: keepNode(ex, p), prov }); break; }
        case 'rule': {
          const target = data.parkings.find(x => x.id === p.parkingId);
          if (target) { target.rules = p.rules; target.prov = { ...target.prov, rulesFrom: prov.source, tipId: t.id, ...(prov.source === 'owner' ? { verified: prov.verified, lastVerified: prov.lastVerified } : {}) }; }
          break;
        }
        case 'path': applyPath(data, p, prov, photo); break;
        case 'routeNote': upsert(data.routeNotes, { ...p, prov }); break;
        default: break;
      }
    } catch (err) { console.warn('tip skipped', t.id, err); }
  }
  // generated connectors are rebuilt from scratch so new points attach correctly
  const removed = new Set(data.graph.nodes.filter(n => n.prov?.source === 'generated' && !n.id.startsWith('split:') && !n.id.startsWith('hub:')).map(n => n.id));
  data.graph.nodes = data.graph.nodes.filter(n => !removed.has(n.id));
  data.graph.edges = data.graph.edges.filter(e => !(e.prov?.source === 'generated' && (removed.has(e.from) || removed.has(e.to))));
  for (const x of [...data.parkings, ...data.entrances, ...data.destinations]) if ((x.prov?.source === 'crowd' || x.prov?.source === 'owner') && x.nodeId && !data.graph.nodes.some(n => n.id === x.nodeId)) x.nodeId = null;
  attachAll(data);
  return data;
}

/** Keep the existing graph node when an edited record did not move (e.g. only hours / access changed). */
function keepNode(ex, p) {
  if (!ex || ex.lat == null || p.lat == null || !ex.nodeId) return null;
  return haversine([ex.lat, ex.lon], [p.lat, p.lon]) < 2 ? ex.nodeId : null;
}

function upsert(list, rec) {
  const i = list.findIndex(x => x.id === rec.id);
  if (i >= 0) list[i] = { ...list[i], ...rec }; else list.push(rec);
}

/**
 * A crowd "path": ordered points, each optionally a door; consecutive points become edges.
 * payload: { id, points: [{lat, lon, nodeId?, entranceId?, indoor?, stairs?, landmark?}], wheelchair, hours, note }
 * Endpoints that do not reference an existing node are snapped to the network by attachAll.
 */
function applyPath(data, p, prov, photo) {
  const ids = [];
  p.points.forEach((pt, i) => {
    if (pt.nodeId && data.graph.nodes.some(n => n.id === pt.nodeId)) { ids.push(pt.nodeId); return; }
    const id = `${p.id}:pt${i}`;
    const node = { id, lat: pt.lat, lon: pt.lon, kind: pt.entranceId ? 'door' : 'junction', entranceId: pt.entranceId || undefined, landmark: pt.landmark || undefined, photo: i === p.points.length - 1 ? photo || undefined : undefined, prov };
    data.graph.nodes.push(node);
    if (pt.entranceId) { const ent = data.entrances.find(e => e.id === pt.entranceId); if (ent) { ent.nodeId = id; ent.lat = pt.lat; ent.lon = pt.lon; } }
    ids.push(id);
  });
  for (let i = 1; i < ids.length; i++) {
    const a = p.points[i - 1], b = p.points[i];
    data.graph.edges.push({ id: `${p.id}:e${i}`, from: ids[i - 1], to: ids[i], kind: b.indoor || a.indoor ? 'corridor' : 'footway', indoor: !!(a.indoor && b.indoor), stairs: !!b.stairs, wheelchair: p.wheelchair !== false && !b.stairs, public: true, hours: p.hours || null, note: b.note || undefined, prov });
  }
  // free ends: connect to the outdoor network (attachPoint skips nodes that already have edges, so connect explicitly)
  for (const end of [ids[0], ids[ids.length - 1]]) {
    const n = data.graph.nodes.find(x => x.id === end);
    if (n && n.prov?.source === 'crowd' && n.kind === 'junction') n.needsSnap = true;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Approved crowd tips → the campus graph (topology). A tip that adds a lot, a door or a shortcut path adds nodes/edges,
// so every new shortcut improves all routes. Estimated geometry is flagged (est, conf "inferred" for the glue edges).
const OUTDOOR_KINDS = new Set(['junction', 'entrance', 'parking', 'busstop']);

function nearestNode(topo, lat, lon, maxM, filter = () => true) {
  let best = null, bd = maxM;
  for (const n of topo.nodes) {
    if (n.lat == null || !filter(n)) continue;
    const d = haversine([lat, lon], [n.lat, n.lon]);
    if (d < bd) { bd = d; best = n; }
  }
  return best ? { node: best, dist: bd } : null;
}

export function applyTipsToTopology(topo, tips) {
  const T = structuredClone(topo);
  const byOsm = new Map((T.buildings || []).filter(b => b.osm).map(b => [b.osm, b]));
  const upsertNode = n => { const i = T.nodes.findIndex(x => x.id === n.id); if (i >= 0) T.nodes[i] = { ...T.nodes[i], ...n }; else T.nodes.push(n); };
  const edgeSeq = { n: 0 };
  const addEdge = (a, b, kind, sec, extra = {}) => { if (a === b) return; T.edges.push({ id: `tip:e${++edgeSeq.n}`, a, b, kind, sec: Math.max(2, Math.round(sec)), est: true, conf: 'inferred', indoor: ['hallway', 'link', 'passage', 'stairs'].includes(kind), src: 'crowd tip (approved)', ...extra }); };
  for (const t of tips || []) {
    const p = t.payload || {};
    try {
      if (t.kind === 'parking' && p.lat != null) {
        const id = `park:${p.id}`;
        upsertNode({ id, label: p.name || 'חניה', kind: 'parking', lat: p.lat, lon: p.lon, geo: 'exact', conf: 'text', src: 'crowd tip', official: false });
        const near = nearestNode(T, p.lat, p.lon, 150, n => OUTDOOR_KINDS.has(n.kind) && n.id !== id);
        if (near && !T.edges.some(e => e.a === id || e.b === id)) addEdge(id, near.node.id, 'path', near.dist / 1.1, { m: near.dist, indoor: false, note: 'חיבור משוער לדרך הקרובה' });
      } else if (t.kind === 'entrance' && p.lat != null) {
        const id = `door:${p.id}`;
        const bld = byOsm.get(p.buildingId) || (T.buildings || []).find(b => b.id === p.buildingId);
        upsertNode({ id, label: `${p.name || 'כניסה'}${bld ? ' · ' + bld.name.split('(')[0].trim() : ''}`, kind: 'entrance', building: bld?.id, floor: p.floor ?? '0', lat: p.lat, lon: p.lon, geo: 'exact', conf: 'text', src: 'crowd tip',
          publicAccess: p.publicAccess === 'yes' ? 'yes' : 'unknown', hours: p.hours || undefined });
        const near = nearestNode(T, p.lat, p.lon, 60, n => OUTDOOR_KINDS.has(n.kind) && n.id !== id);
        if (near && !T.edges.some(e => (e.a === id || e.b === id) && !e.indoor)) addEdge(id, near.node.id, 'path', near.dist / 1.1, { m: near.dist, indoor: false });
        if (bld?.lobby && T.nodes.some(n => n.id === bld.lobby) && !T.edges.some(e => (e.a === id || e.b === id) && e.kind === 'link')) addEdge(id, bld.lobby, 'link', 6, { conf: 'text' });
      } else if (t.kind === 'path' && Array.isArray(p.points) && p.points.length >= 2) {
        const ids = p.points.map((pt, i) => {
          const near = nearestNode(T, pt.lat, pt.lon, 6);
          if (near) return near.node.id;
          const id = `tip:${p.id}:${i}`;
          upsertNode({ id, label: pt.note || 'נקודה במסלול', kind: pt.entranceId ? 'entrance' : 'hall', lat: pt.lat, lon: pt.lon, geo: 'exact', conf: 'text', src: 'crowd tip', building: undefined });
          return id;
        });
        for (let i = 1; i < ids.length; i++) {
          const a = p.points[i - 1], b = p.points[i], indoor = !!(a.indoor && b.indoor);
          const d = haversine([a.lat, a.lon], [b.lat, b.lon]);
          addEdge(ids[i - 1], ids[i], b.stairs ? 'stairs' : indoor ? 'hallway' : 'path', d / (indoor ? 1 : 1.1), { m: d, conf: 'text', stairs: !!b.stairs, hours: undefined });
        }
        for (const end of [ids[0], ids[ids.length - 1]]) {          // glue free ends to the existing network
          if (!end.startsWith('tip:')) continue;
          const n = T.nodes.find(x => x.id === end);
          const near = nearestNode(T, n.lat, n.lon, 25, x => x.id !== end && !x.id.startsWith('tip:'));
          if (near) addEdge(end, near.node.id, 'link', near.dist / 1.1 + 2, { m: near.dist });
        }
      }
    } catch (err) { console.warn('tip skipped (topology)', t.id, err); }
  }
  return T;
}
