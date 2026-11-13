// Time-dependent pedestrian routing on the campus graph.
// Graph storage and A* come from ngraph.graph / ngraph.path (MIT, vendored ES modules).
import createGraph from '../../vendor/ngraph/ngraph.graph.es.js';
import { aStar } from '../../vendor/ngraph/ngraph.path.es.js';
import { haversine } from './geo.js';
import { isOpenAt } from './time.js';

export const WALK_SPEED = 1.1;       // m/s outdoors (hospital visitors, not hikers)
export const INDOOR_SPEED = 1.0;     // m/s
export const STAIRS_FACTOR = 2.0;    // stairs cost double
export const LIFT_SECONDS = 60;      // average wait + ride
export const DOOR_SECONDS = 5;

/**
 * Build an in-memory graph from the dataset.
 * data.graph.nodes: [{id, lat, lon, kind, entranceId?, public?, wheelchair?, ...}]
 * data.graph.edges: [{id, from, to, length, indoor, stairs, wheelchair, public, hours, oneway, ...}]
 */
export function buildGraph(data) {
  const g = createGraph({ multigraph: true });
  const nodes = new Map(), edges = new Map();
  const entrances = new Map((data.entrances || []).map(e => [e.id, e]));
  for (const n of data.graph?.nodes || []) {
    if (n.lat == null || n.lon == null) continue; // placeholders without coordinates are not routable
    nodes.set(n.id, n);
    g.addNode(n.id, n);
  }
  for (const e of data.graph?.edges || []) {
    if (!nodes.has(e.from) || !nodes.has(e.to)) continue;
    const len = e.length ?? haversine(pt(nodes.get(e.from)), pt(nodes.get(e.to)));
    const ed = { ...e, length: len };
    edges.set(e.id, ed);
    g.addLink(e.from, e.to, { edge: ed, forward: true });
    if (!e.oneway) g.addLink(e.to, e.from, { edge: ed, forward: false });
  }
  return { g, nodes, edges, entrances };
}

export const pt = n => [n.lat, n.lon];

/** Can a person pass through node `n` at time `when`? */
export function nodeOpen(G, n, when, opts = {}) {
  if (!n) return false;
  if (n.public === false) return false;
  if (n.kind === 'door') {
    const ent = n.entranceId ? G.entrances.get(n.entranceId) : null;
    // An entrance is only usable if it is known to be open to the public.
    if (!ent || ent.publicAccess !== 'yes') return false;
    if (!isOpenAt(ent.hours, when).open) return false;
    if (opts.accessible && ent.wheelchair === false) return false;
  }
  if (n.hours && !isOpenAt(n.hours, when).open) return false;
  if (opts.accessible && n.wheelchair === false) return false;
  return true;
}

/** Can a person walk along edge `e` at time `when`? */
export function edgeOpen(e, when, opts = {}) {
  if (!e || e.public === false) return false;
  if (e.hours && !isOpenAt(e.hours, when).open) return false;
  if (opts.accessible && (e.stairs || e.wheelchair === false)) return false;
  return true;
}

/** Walking cost of an edge in seconds. */
export function edgeSeconds(e) {
  if (e.kind === 'lift') return LIFT_SECONDS;
  let s = (e.length * (e.lengthFactor || 1)) / (e.indoor ? INDOOR_SPEED : WALK_SPEED);
  if (e.stairs) s *= STAIRS_FACTOR;
  return s + (e.extraSeconds || 0);
}

/**
 * Shortest walking path between two node ids at time `when`.
 * Returns null if unreachable, else { nodeIds, edges: [{edge, forward}], seconds, meters }.
 */
export function findPath(G, fromId, toId, when, opts = {}) {
  if (!G.nodes.has(fromId) || !G.nodes.has(toId)) return null;
  if (fromId === toId) return { nodeIds: [fromId], edges: [], seconds: 0, meters: 0 };
  const endpoints = new Set([fromId, toId]);
  const finder = aStar(G.g, {
    oriented: true,
    // ngraph calls blocked(nextNode, currentNode, link)
    blocked(next, cur, link) {
      const e = link.data.edge;
      if (!edgeOpen(e, when, opts)) return true;
      if (!endpoints.has(next.id) && !nodeOpen(G, next.data, when, opts)) return true;
      if (!endpoints.has(cur.id) && !nodeOpen(G, cur.data, when, opts)) return true;
      return false;
    },
    distance(next, cur, link) {
      const e = link.data.edge;
      return edgeSeconds(e) + (next.data.kind === 'door' ? DOOR_SECONDS : 0);
    },
    heuristic(a, b) { return haversine(pt(a.data), pt(b.data)) / WALK_SPEED; },
  });
  const raw = finder.find(fromId, toId);
  // ngraph returns [to ... from]; a 1-node result means "no path".
  if (!raw.length || raw.length < 2) return null;
  const nodeIds = raw.map(n => n.id).reverse();
  if (nodeIds[0] !== fromId || nodeIds[nodeIds.length - 1] !== toId) return null;
  const used = [];
  let seconds = 0, meters = 0;
  for (let i = 1; i < nodeIds.length; i++) {
    const best = bestLink(G, nodeIds[i - 1], nodeIds[i], when, opts);
    if (!best) return null; // should not happen
    used.push(best);
    seconds += edgeSeconds(best.edge) + (G.nodes.get(nodeIds[i]).kind === 'door' ? DOOR_SECONDS : 0);
    meters += best.edge.length;
  }
  return { nodeIds, edges: used, seconds, meters };
}

function bestLink(G, a, b, when, opts) {
  let best = null;
  G.g.forEachLinkedNode(a, (other, link) => {
    if (other.id !== b) return;
    const e = link.data.edge;
    if (!edgeOpen(e, when, opts)) return;
    if (!best || edgeSeconds(e) < edgeSeconds(best.edge)) best = { edge: e, forward: link.data.forward };
  }, true);
  return best;
}

/** Ordered coordinates of a path (expanding each edge's polyline in the walking direction). */
export function pathCoords(G, path) {
  const out = [];
  path.edges.forEach((u, i) => {
    const a = G.nodes.get(path.nodeIds[i]), b = G.nodes.get(path.nodeIds[i + 1]);
    let line = u.edge.polyline && u.edge.polyline.length >= 2 ? u.edge.polyline.slice() : [pt(G.nodes.get(u.edge.from)), pt(G.nodes.get(u.edge.to))];
    if (!u.forward) line.reverse();
    line[0] = pt(a); line[line.length - 1] = pt(b);
    if (out.length) line = line.slice(1);
    out.push(...line);
  });
  return out;
}
