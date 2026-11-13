// Recommendation engine: for a destination and a time, evaluate every allowed parking spot,
// route on foot to the destination and return the best options.
import { buildGraph, findPath, pathCoords } from './router.js';
import { parkingStatusAt } from './time.js';
import { parkingSafetyProblems } from './safety.js';
import { generateSteps } from './steps.js';

export const STATUS_PENALTY_MIN = { ok: 0, paid: 1, risky: 8 };
export const UNVERIFIED_TIP_PENALTY_MIN = 3;
export const FLAGGED_PENALTY_MIN = 10;

export class Engine {
  constructor(data) {
    this.data = data;
    this.G = buildGraph(data);
    this.buildings = new Map((data.buildings || []).map(b => [b.id, b]));
    this.entrances = this.G.entrances;
    this.parkings = new Map((data.parkings || []).map(p => [p.id, p]));
    this.destinations = new Map((data.destinations || []).map(d => [d.id, d]));
  }

  /** Why a parking cannot be used right now (or null if it can). */
  parkingExclusion(p, when, opts = {}) {
    const safety = parkingSafetyProblems(p, this.data.safetyZones);
    if (safety.length) return { code: 'safety', reason: safety.join('; ') };
    if (p.lat == null || !p.nodeId || !this.G.nodes.has(p.nodeId)) return { code: 'no-coords', reason: 'אין עדיין מיקום מדויק' };
    const { status, rule } = parkingStatusAt(p, when);
    if (status === 'forbidden') return { code: 'forbidden', reason: rule?.note || 'לא מומלץ בשעה זו', status };
    if (status === 'unknown' && !p.official) return { code: 'unknown', reason: 'אין מידע על השעה הזו', status };
    if (status === 'risky' && opts.avoidRisky) return { code: 'risky', reason: 'מסומן כמסוכן בשעה זו', status };
    return null;
  }

  /**
   * @param destId destination id
   * @param when {day, minutes}
   * @param opts {accessible, avoidRisky, limit = 3, votes: Map(targetId -> {flagged})}
   * @returns {options: [...], excluded: [...], destination}
   */
  recommend(destId, when, opts = {}) {
    const dest = this.destinations.get(destId);
    if (!dest) return { destination: null, options: [], excluded: [] };
    const limit = opts.limit ?? 3;
    const options = [], excluded = [];
    for (const p of this.parkings.values()) {
      const ex = this.parkingExclusion(p, when, opts);
      if (ex) { excluded.push({ parking: p, ...ex }); continue; }
      const st = parkingStatusAt(p, when);
      const status = st.status === 'unknown' ? 'paid' : st.status; // official lot without a specific rule
      const path = dest.nodeId ? findPath(this.G, p.nodeId, dest.nodeId, when, opts) : null;
      if (!path) { excluded.push({ parking: p, code: 'no-route', reason: 'אין מסלול הליכה ידוע בשעה זו' }); continue; }
      const walkMin = path.seconds / 60;
      const flagged = !!opts.votes?.get(p.id)?.flagged;
      let score = walkMin + (STATUS_PENALTY_MIN[status] ?? 0);
      if (!p.official && !p.prov?.verified) score += UNVERIFIED_TIP_PENALTY_MIN;
      if (flagged) score += FLAGGED_PENALTY_MIN;
      options.push(this._option(p, dest, path, status, st.rule, walkMin, score, flagged));
    }
    options.sort((a, b) => a.score - b.score);
    const top = options.slice(0, limit);
    // Always include the official main garage as a fallback.
    const main = [...this.parkings.values()].find(p => p.mainOfficial);
    if (main && !top.some(o => o.parking.id === main.id)) {
      const o = options.find(o => o.parking.id === main.id);
      if (o) top.push({ ...o, fallback: true });
      else top.push({ parking: main, destination: dest, fallback: true, noRoute: true, status: 'paid', warnings: ['לא נמצא מסלול הליכה ממופה מהחניון הזה – השתמשו בהוראות ההגעה הרשמיות'], steps: [], coords: [] });
    }
    return { destination: dest, options: top, excluded };
  }

  _option(p, dest, path, status, rule, walkMin, score, flagged) {
    const doors = path.nodeIds.map(id => this.G.nodes.get(id)).filter(n => n.kind === 'door');
    // the entrance used = last door where we go from outdoors to indoors
    let entrance = null;
    for (let i = 0; i < path.edges.length; i++) {
      const n = this.G.nodes.get(path.nodeIds[i + 1]);
      if (n.kind === 'door' && !path.edges[i].edge.indoor && path.edges[i + 1]?.edge.indoor) entrance = this.entrances.get(n.entranceId);
    }
    if (!entrance && doors.length) entrance = this.entrances.get(doors[doors.length - 1].entranceId);
    const routeNote = (this.data.routeNotes || []).find(r => r.parkingId === p.id && r.destinationId === dest.id && (!r.entranceId || r.entranceId === entrance?.id));
    const steps = generateSteps(this.G, path, { parking: p, destination: dest, buildings: this.buildings, entrances: this.entrances, routeNote });
    const warnings = [];
    if (!p.official) warnings.push('unofficial');
    if (status === 'risky') warnings.push('risky');
    if (flagged) warnings.push('flagged');
    const lowConf = path.edges.filter(u => u.edge.prov?.confidence === 'low' || u.edge.prov?.confidence === 'placeholder').reduce((s, u) => s + u.edge.length, 0);
    if (lowConf > 0.3 * path.meters) warnings.push('estimated-route');
    if (entrance && entrance.hours == null) warnings.push('entrance-hours-unknown');
    return {
      parking: p, destination: dest, entrance, status, rule, flagged,
      walkMinutes: Math.max(1, Math.round(walkMin)), meters: Math.round(path.meters), score,
      path, coords: pathCoords(this.G, path), steps, warnings,
      // conservative: the weakest link decides
      lastVerified: p.prov?.lastVerified ? oldest([p.prov.lastVerified, entrance?.prov?.lastVerified]) : null,
    };
  }
}

function oldest(dates) {
  const d = dates.filter(Boolean).sort();
  return d.length ? d[0] : null;
}
