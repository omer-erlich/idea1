// Campus router: ONE walking graph for outdoors + indoors (data/topology.json), three ways to start:
//   mode "car"  – suggest parking lots (time rules, safety exclusions, risk penalties), walk from the lot
//   mode "bus"  – suggest bus stops near the campus, walk from the stop
//   mode "here" – the user tells us where they are (GPS is unreliable indoors) – start from that graph node
// The system never navigates the car itself (Waze / Google Maps deep links do that).
import createGraph from '../../vendor/ngraph/ngraph.graph.es.js';
import { aStar } from '../../vendor/ngraph/ngraph.path.es.js';
import { haversine, pointInPolygon } from './geo.js';
import { isOpenAt, parkingStatusAt, windowMatches } from './time.js';
import { parkingSafetyProblems } from './safety.js';
import { generateTopoSteps } from './topo-steps.js';

export const INFERRED_PENALTY_SEC = 25;      // prefer confirmed links, but still allow unconfirmed ones (flagged)
export const DOOR_SEC = 4;
export const STATUS_PENALTY_MIN = { ok: 0, paid: 1, risky: 8 };
export const UNVERIFIED_TIP_PENALTY_MIN = 3;
export const TIP_BONUS_CAP_MIN = 6;   // a local tip can re-rank safe, open options by at most this many minutes
export const FLAGGED_PENALTY_MIN = 10;
const WALK_MPS = 1.1;

const INDOOR_PLACE_KINDS = new Set(['lobby', 'hall', 'elevator', 'stairs', 'admin', 'other', 'clinic', 'room', 'floor']);

export class CampusRouter {
  /** @param topo data/topology.json  @param sheba data/sheba.json (parking rules, entrances, safety zones, destinations) */
  constructor(topo, sheba) {
    this.T = topo; this.sheba = sheba;
    this.nodes = new Map(topo.nodes.map(n => [n.id, n]));
    this.buildings = new Map(topo.buildings.map(b => [b.id, b]));
    this.entrances = new Map((sheba.entrances || []).map(e => [`door:${e.id}`, e]));
    this.parkings = new Map((sheba.parkings || []).map(p => [`park:${p.id}`, p]));
    this.g = createGraph();
    for (const n of topo.nodes) this.g.addNode(n.id, n);
    for (const e of topo.edges) {
      this.g.addLink(e.a, e.b, { edge: e, fwd: true });
      this.g.addLink(e.b, e.a, { edge: e, fwd: false });
    }
  }

  // ---------------------------------------------------------------- rules
  nodeOpen(n, when) {
    if (!n) return false;
    if (n.kind === 'entrance') {
      if (n.publicAccess !== 'yes') return false;                 // an entrance is only used if known to be public
      if (n.hours && !isOpenAt(n.hours, when).open) return false;
    }
    return true;
  }
  edgeOpen(e, opts) {
    if (opts.accessible && (e.stairs || e.kind === 'stairs' || e.wheelchair === false)) return false;   // steps and wheelchair-unfriendly segments
    if (opts.noInferred && e.conf === 'inferred') return false;
    return true;
  }
  edgeCost(e) { return e.sec + (e.conf === 'inferred' ? INFERRED_PENALTY_SEC : 0); }

  /** Shortest path (Dijkstra on seconds). Returns {nodeIds, hops, seconds, cost} or null. */
  findPath(fromId, toId, when, opts = {}) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;
    if (fromId === toId) return { nodeIds: [fromId], hops: [], seconds: 0, cost: 0, meters: 0 };
    const ends = new Set([fromId, toId]);
    const finder = aStar(this.g, {
      oriented: true,
      blocked: (next, cur, link) => !this.edgeOpen(link.data.edge, opts) || (!ends.has(next.id) && !this.nodeOpen(next.data, when)),
      distance: (next, cur, link) => this.edgeCost(link.data.edge) + (next.data.kind === 'entrance' ? DOOR_SEC : 0),
    });
    const raw = finder.find(fromId, toId);
    if (!raw.length || raw.length < 2) return null;
    const nodeIds = raw.map(n => n.id).reverse();
    if (nodeIds[0] !== fromId || nodeIds[nodeIds.length - 1] !== toId) return null;
    const hops = [];
    let seconds = 0, cost = 0, meters = 0;
    for (let i = 1; i < nodeIds.length; i++) {
      let best = null;
      this.g.forEachLinkedNode(nodeIds[i - 1], (other, link) => {
        if (other.id !== nodeIds[i]) return;
        const e = link.data.edge;
        if (!this.edgeOpen(e, opts)) return;
        if (!best || this.edgeCost(e) < this.edgeCost(best.edge)) best = { edge: e, fwd: link.data.fwd };
      }, true);
      if (!best) return null;
      hops.push({ ...best, from: nodeIds[i - 1], to: nodeIds[i] });
      seconds += best.edge.sec + (this.nodes.get(nodeIds[i]).kind === 'entrance' ? DOOR_SEC : 0);
      cost += this.edgeCost(best.edge);
      meters += best.edge.m ?? best.edge.sec * WALK_MPS;
    }
    return { nodeIds, hops, seconds, cost, meters };
  }

  // ---------------------------------------------------------------- geometry of a path (for the map)
  /** Legs: contiguous pieces drawn in one style. type = outdoor | indoor ; measured = true when the geometry comes from OSM. */
  legsOf(path) {
    const legs = [];
    for (const h of path.hops) {
      const A = this.nodes.get(h.from), B = this.nodes.get(h.to), e = h.edge;
      if (A.lat == null || B.lat == null) continue;
      let line = e.poly && e.poly.length > 2 ? e.poly.map(p => [p[0], p[1]]) : [[A.lat, A.lon], [B.lat, B.lon]];
      if (e.poly && !h.fwd) line = line.slice().reverse();
      if (line.length > 2) { line[0] = [A.lat, A.lon]; line[line.length - 1] = [B.lat, B.lon]; }
      if (haversine(line[0], line[line.length - 1]) < 0.5 && line.length === 2) continue;   // elevator / floor changes: same point
      const type = e.indoor ? 'indoor' : 'outdoor';
      const measured = !e.est && e.conf === 'osm';
      const last = legs[legs.length - 1];
      if (last && last.type === type && last.measured === measured) last.coords.push(...line.slice(1));
      else legs.push({ type, measured, coords: line.slice() });
    }
    return legs;
  }

  // ---------------------------------------------------------------- options
  /** Path that must pass through `viaId` (used by local tips: "park here, then use THAT door"). Every leg still obeys the normal door/edge rules. */
  findPathVia(fromId, viaId, toId, when, opts = {}) {
    const a = this.findPath(fromId, viaId, when, opts), b = this.findPath(viaId, toId, when, opts);
    if (!a || !b) return null;
    return { nodeIds: [...a.nodeIds, ...b.nodeIds.slice(1)], hops: [...a.hops, ...b.hops], seconds: a.seconds + b.seconds, cost: a.cost + b.cost, meters: a.meters + b.meters };
  }

  _option(kind, startId, destId, dest, when, opts, extra = {}) {
    const path = (extra.via && this.findPathVia(startId, extra.via, destId, when, opts)) || this.findPath(startId, destId, when, opts);
    if (!path) return null;
    const legs = this.legsOf(path);
    const inferred = path.hops.filter(h => h.edge.conf === 'inferred');
    const estSec = path.hops.filter(h => h.edge.est).reduce((s, h) => s + h.edge.sec, 0);
    const firstDoor = path.hops.find(h => h.edge.kind === 'link' && this.nodes.get(h.from).kind === 'entrance');
    const entranceNode = firstDoor ? this.nodes.get(firstDoor.from) : null;
    const entrance = entranceNode ? { ...(this.entrances.get(entranceNode.id) || {}), id: entranceNode.id, name: entranceNode.label.split('·')[0].trim(), lat: entranceNode.lat, lon: entranceNode.lon, hours: entranceNode.hours ?? null } : null;
    const warnings = [];
    if (inferred.length) warnings.push('inferred-link');
    if (estSec > 0.5 * path.seconds) warnings.push('estimated-route');
    if (entrance && entrance.hours == null) warnings.push('entrance-hours-unknown');
    const o = {
      kind, startId, destId, destination: dest, path, legs, coords: legs.flatMap(l => l.coords),
      walkMinutes: Math.max(1, Math.round(path.seconds / 60)), meters: Math.round(path.meters), seconds: path.seconds, cost: path.cost,
      entrance, warnings, ...extra,
    };
    o.steps = generateTopoSteps(this, path, { kind, dest, start: this.nodes.get(startId), parking: extra.parking, stop: extra.stop });
    o.indoor = this.indoorSegments(path);
    return o;
  }

  /**
   * Owner / local tips (data/local-tips.json): "for this destination in these hours, park HERE and use THAT door".
   * A tip only re-ranks an option that already passed safety, rules and door-hours checks; it never opens a closed door,
   * never overrides an exclusion and never removes the official main garage. Unverified tips are always labelled.
   * The bonus needs the route to really use the tip's entrance, and that entrance to be public and not KNOWN to be closed now (unknown hours just show a warning; feedback from users corrects mistakes).
   */
  _applyLocalTip(o, p, dest, when, opts) {
    const tip = (opts.tips || []).find(t => t.parking === p.id && (t.destinations || []).includes(dest?.id) && (t.when || []).some(w => windowMatches(w, when)));
    if (!tip) return;
    const door = tip.entrance ? this.nodes.get(tip.entrance) : null;
    const usesDoor = !!door && o.path.nodeIds.includes(door.id);
    const open = !!door && door.publicAccess === 'yes' && (door.hours == null || isOpenAt(door.hours, when).open);   // unknown hours are fine (shown as a warning); KNOWN closed is not
    o.tip = { id: tip.id, noteHe: tip.noteHe || '', status: tip.status || 'unverified', provenance: tip.provenance || 'owner', confidence: tip.confidence || 'low', doorName: door?.label || null };
    if (!usesDoor) { o.tip.noBonusReason = 'route-skips-door'; return; }
    if (!open) { o.tip.noBonusReason = door?.publicAccess !== 'yes' ? 'door-not-public' : 'door-closed'; return; }
    o.tip.bonusMin = Math.min(tip.bonusMin ?? 0, TIP_BONUS_CAP_MIN);
    o.score -= o.tip.bonusMin;
    o.tipOption = true;
  }

  parkingExclusion(p, when, opts = {}) {
    const safety = parkingSafetyProblems(p, this.sheba.safetyZones);
    if (safety.length) return { code: 'safety', reason: safety.join('; ') };
    if (!this.nodes.has(`park:${p.id}`)) return { code: 'no-coords', reason: 'אין עדיין מיקום מדויק' };
    const { status, rule } = parkingStatusAt(p, when);
    if (status === 'forbidden') return { code: 'forbidden', reason: rule?.note || 'לא מומלץ בשעה זו', status };
    if (status === 'unknown' && !p.official) return { code: 'unknown', reason: 'אין מידע על השעה הזו', status };
    if (status === 'risky' && opts.avoidRisky) return { code: 'risky', reason: 'מסומן כמסוכן בשעה זו', status };
    return null;
  }

  /**
   * @param destId graph node id of the destination (clinic / lobby / area)
   * @param dest  {name, floor, buildingId?} shown in the UI
   * @param opts  {mode: 'car'|'bus'|'here', startNodeId?, accessible, avoidRisky, votes, limit}
   */
  recommend(destId, dest, when, opts = {}) {
    const mode = opts.mode || 'car';
    const limit = opts.limit ?? 3;
    const options = [], excluded = [];
    if (mode === 'here') {
      if (!opts.startNodeId) return { mode, destination: dest, options: [], excluded, needsStart: true };
      const o = this._option('here', opts.startNodeId, destId, dest, when, opts, { from: this.nodes.get(opts.startNodeId) });
      if (o) { o.score = o.cost / 60; options.push(o); }
      return { mode, destination: dest, options, excluded };
    }
    if (mode === 'bus') {
      const seenName = new Set();
      const stops = [...this.nodes.values()].filter(n => n.kind === 'busstop');
      for (const st of stops) {
        const o = this._option('bus', st.id, destId, dest, when, opts, { stop: st, from: st });
        if (!o) { excluded.push({ stop: st, code: 'no-route' }); continue; }
        o.score = o.cost / 60;
        options.push(o);
      }
      options.sort((a, b) => a.score - b.score);
      const top = [];
      for (const o of options) { const key = o.stop.label; if (seenName.has(key)) continue; seenName.add(key); top.push(o); if (top.length >= limit) break; }
      return { mode, destination: dest, options: top, excluded };
    }
    // car
    for (const p of this.sheba.parkings || []) {
      const ex = this.parkingExclusion(p, when, opts);
      if (ex) { excluded.push({ parking: p, ...ex }); continue; }
      const st = parkingStatusAt(p, when);
      const status = st.status === 'unknown' ? 'paid' : st.status;
      // a matching local tip names a door: route through it when that door is public and not known closed now (the tip then only re-ranks, see _applyLocalTip)
      const tipDoor = (opts.tips || []).find(t => t.parking === p.id && t.entrance && (t.destinations || []).includes(dest?.id) && (t.when || []).some(w => windowMatches(w, when)));
      const via = tipDoor && this.nodeOpen(this.nodes.get(tipDoor.entrance), when) ? tipDoor.entrance : null;
      const o = this._option('parking', `park:${p.id}`, destId, dest, when, opts, { parking: p, from: this.nodes.get(`park:${p.id}`), status, rule: st.rule, via });
      if (!o) { excluded.push({ parking: p, code: 'no-route', reason: 'אין מסלול הליכה ידוע בשעה זו' }); continue; }
      const flagged = !!opts.votes?.get(p.id)?.flagged;
      o.flagged = flagged;
      o.score = o.cost / 60 + (STATUS_PENALTY_MIN[status] ?? 0) + (!p.official && !p.prov?.verified ? UNVERIFIED_TIP_PENALTY_MIN : 0) + (flagged ? FLAGGED_PENALTY_MIN : 0);
      this._applyLocalTip(o, p, dest, when, opts);
      if (status === 'risky') o.warnings.push('risky');
      if (!p.official) o.warnings.push('unofficial');
      if (flagged) o.warnings.push('flagged');
      o.lastVerified = oldest([p.prov?.lastVerified, o.entrance?.prov?.lastVerified]);
      options.push(o);
    }
    options.sort((a, b) => a.score - b.score);
    const top = options.slice(0, limit);
    const main = (this.sheba.parkings || []).find(p => p.mainOfficial);
    if (main && !top.some(o => o.parking.id === main.id)) {
      const o = options.find(x => x.parking.id === main.id);
      if (o) top.push({ ...o, fallback: true });
    }
    return { mode, destination: dest, options: top, excluded };
  }

  // ---------------------------------------------------------------- indoor timeline (building → floor → places)
  indoorSegments(path) {
    const segs = [];
    let cur = null;
    path.nodeIds.forEach((id, i) => {
      const n = this.nodes.get(id);
      const indoor = n.building && !['parking', 'junction', 'busstop'].includes(n.kind);
      if (!indoor) { cur = null; return; }
      if (!cur || cur.building !== n.building) { cur = { building: n.building, buildingName: this.buildings.get(n.building)?.name?.split('(')[0].trim() || n.building, nodes: [] }; segs.push(cur); }
      if (n.kind === 'floor') return;
      const hop = path.hops[i - 1];
      cur.nodes.push({ id: n.id, label: n.label, kind: n.kind, floor: n.floor, via: hop ? hop.edge.kind : null, sec: hop ? hop.edge.sec : 0, est: hop ? !!hop.edge.est : false, conf: hop?.edge.conf });
    });
    return segs.filter(s => s.nodes.length);
  }

  // ---------------------------------------------------------------- "where am I?" helpers (GPS is unreliable indoors)
  buildingAt(lat, lon, slackM = 25) {
    const hits = [];
    for (const b of this.buildings.values()) {
      if (b.outline && pointInPolygon([lat, lon], b.outline)) hits.push({ id: b.id, name: b.name, inside: true, dist: 0 });
      else if (b.center) { const d = haversine([lat, lon], b.center); const r = b.outline ? 45 : 35; if (d <= r + slackM) hits.push({ id: b.id, name: b.name, inside: false, dist: Math.round(d) }); }
    }
    return hits.sort((a, b) => (b.inside - a.inside) || a.dist - b.dist);
  }
  /**
   * "Are you here?" – mixes the GPS fix (position + accuracy) with what we KNOW about the campus (building footprints,
   * doors, bus stops, parking lots). Returns ranked guesses; the user confirms or says no. GPS is trusted outdoors and
   * only as a hint inside buildings, so a building guess leads to "which floor?" and never claims a room.
   */
  suggestHere(lat, lon, accuracyM = 30) {
    const R = Math.min(120, Math.max(35, accuracyM * 1.5));
    const poor = accuracyM > 80;
    const out = [];
    for (const b of this.buildingAt(lat, lon, Math.min(60, accuracyM)).slice(0, 3)) {
      const conf = b.inside ? (accuracyM <= 25 ? 0.9 : 0.7) : Math.max(0.2, 0.6 - b.dist / 150);
      out.push({ type: 'building', id: b.id, label: b.name.split('(')[0].trim(), dist: b.dist, inside: b.inside, confidence: poor ? conf * 0.6 : conf });
    }
    for (const n of this.nodes.values()) {
      if (!['entrance', 'busstop', 'parking', 'junction'].includes(n.kind) || n.lat == null) continue;
      if (n.kind === 'junction' && n.label === 'צומת') continue;                    // unnamed junctions are useless as a guess
      const d = haversine([lat, lon], [n.lat, n.lon]);
      if (d > R) continue;
      const conf = Math.max(0.15, 0.85 - (d / R) * 0.6);
      out.push({ type: 'node', node: n, label: n.label.split('·')[0].replace(/^תחנה:\s*/, '').trim(), dist: Math.round(d), confidence: poor ? conf * 0.6 : conf });
    }
    out.sort((a, b) => b.confidence - a.confidence || a.dist - b.dist);
    return { suggestions: out.slice(0, 5), accuracy: Math.round(accuracyM), poor };
  }

  /** Nearest outdoor node (junction / door / parking / bus stop). */
  snapOutdoor(lat, lon, maxM = 150) {
    let best = null, bd = maxM;
    for (const n of this.nodes.values()) {
      if (!['junction', 'entrance', 'parking', 'busstop'].includes(n.kind) || n.lat == null) continue;
      const d = haversine([lat, lon], [n.lat, n.lon]);
      if (d < bd) { bd = d; best = n; }
    }
    return best ? { node: best, dist: Math.round(bd) } : null;
  }
  /** Places inside one building, grouped by floor (for the "where are you?" picker). */
  placesIn(buildingId) {
    const byFloor = new Map();
    for (const n of this.nodes.values()) {
      if (n.building !== buildingId || !INDOOR_PLACE_KINDS.has(n.kind) || n.kind === 'floor') continue;
      const f = n.floor ?? '0';
      if (!byFloor.has(f)) byFloor.set(f, []);
      byFloor.get(f).push(n);
    }
    const prio = { lobby: 0, elevator: 1, stairs: 1, hall: 2, admin: 2, other: 3, room: 4, clinic: 5 };
    return [...byFloor.entries()].sort((a, b) => +a[0] - +b[0]).map(([floor, list]) => ({ floor, places: list.sort((x, y) => (prio[x.kind] - prio[y.kind]) || (y.imp - x.imp)) }));
  }
  floorsOf(buildingId) { return this.placesIn(buildingId).map(f => f.floor); }
  /** Best node for "I'm on floor F of building B" – the floor node itself, else its elevator. */
  floorNode(buildingId, floor) {
    const id = `${buildingId}/F${floor}`;
    return this.nodes.has(id) ? this.nodes.get(id) : null;
  }
  search(q, limit = 12, kinds = null) {
    const nq = norm(q);
    if (nq.length < 2) return [];
    return [...this.nodes.values()].filter(n => (!kinds || kinds.has(n.kind)) && norm(n.label).includes(nq)).sort((a, b) => (b.imp ?? 0) - (a.imp ?? 0)).slice(0, limit);
  }
}

export const norm = s => String(s || '').normalize('NFKD').replace(/[֑-ׇ]/g, '').replace(/["'״׳`\-–_.,()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
function oldest(dates) { const d = dates.filter(Boolean).sort(); return d.length ? d[0] : null; }
