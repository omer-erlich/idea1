// Attaching point records (parkings, entrances, destinations, crowd tips) to the walking graph.
// Used by the import script AND at runtime for approved crowd tips, so both behave the same.
import { haversine, projectOnSegment, polylineLength, round6 } from './geo.js';

const genProv = (why, confidence = 'low') => ({ verified: false, lastVerified: null, source: 'generated', confidence, note: why });

function edgeLine(nodesById, e) {
  return e.polyline && e.polyline.length >= 2 ? e.polyline : [[nodesById.get(e.from).lat, nodesById.get(e.from).lon], [nodesById.get(e.to).lat, nodesById.get(e.to).lon]];
}

/** Nearest point on any usable outdoor edge. */
export function nearestEdgePoint(graph, p, { maxDist = 80, filter } = {}) {
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  let best = null;
  for (const e of graph.edges) {
    if (e.indoor || e.public === false || e.kind === 'connector-indoor' || e.kind === 'connector' || e.kind === 'passage') continue;
    if (filter && !filter(e)) continue;
    if (!nodesById.has(e.from) || !nodesById.has(e.to)) continue;
    // never snap onto a stub that ends at a door / barrier / special point (dead ends for everyone else)
    const fa = nodesById.get(e.from), fb = nodesById.get(e.to);
    if (fa.kind !== 'junction' && fa.kind !== 'lift' || fb.kind !== 'junction' && fb.kind !== 'lift') continue;
    const line = edgeLine(nodesById, e);
    for (let i = 1; i < line.length; i++) {
      const pr = projectOnSegment(p, line[i - 1], line[i]);
      if (pr.dist <= maxDist && (!best || pr.dist < best.dist)) best = { edge: e, seg: i, point: pr.point, t: pr.t, dist: pr.dist, line };
    }
  }
  return best;
}

/**
 * Split edge at a point (segment index `seg`, point on that segment).
 * Returns the id of the node at the split point (may be an existing endpoint).
 */
export function splitEdgeAt(graph, hit, idPrefix = 'split') {
  const { edge: e, seg, point, line } = hit;
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const a = nodesById.get(e.from), b = nodesById.get(e.to);
  if (haversine(point, [a.lat, a.lon]) < 1.5) return a.id;
  if (haversine(point, [b.lat, b.lon]) < 1.5) return b.id;
  const nid = `${idPrefix}:${e.id}:${seg}:${Math.round(hit.t * 1000)}`;
  if (!nodesById.has(nid)) {
    const [lat, lon] = round6(point);
    graph.nodes.push({ id: nid, lat, lon, kind: 'junction', prov: genProv('split point') });
  }
  const l1 = [...line.slice(0, seg), point], l2 = [point, ...line.slice(seg)];
  const base = { ...e };
  delete base.id; delete base.polyline; delete base.length;
  const e1 = { ...base, id: e.id + 'a', from: e.from, to: nid, polyline: l1.length > 2 ? l1.map(round6) : undefined, length: Math.round(polylineLength(l1) * 10) / 10 };
  const e2 = { ...base, id: e.id + 'b', from: nid, to: e.to, polyline: l2.length > 2 ? l2.map(round6) : undefined, length: Math.round(polylineLength(l2) * 10) / 10 };
  const idx = graph.edges.indexOf(e);
  graph.edges.splice(idx, 1, e1, e2);
  return nid;
}

/**
 * Ensure a graph node exists for a point record and connect it to the outdoor network.
 * Returns the node id or null if nothing walkable is near.
 */
export function attachPoint(graph, { id, lat, lon, kind, extra = {}, maxDist = 80, connectorProv, mainNetwork } = {}) {
  if (lat == null || lon == null) return null;
  let node = graph.nodes.find(n => n.id === id);
  if (!node) { node = { id, lat, lon, kind, ...extra }; graph.nodes.push(node); }
  else Object.assign(node, { lat, lon, kind, ...extra });
  // already connected?
  if (graph.edges.some(e => e.from === id || e.to === id)) return id;
  const hit = nearestEdgePoint(graph, [lat, lon], { maxDist, filter: e => e.from !== id && e.to !== id && (!mainNetwork || (mainNetwork.has(e.from) && mainNetwork.has(e.to))) });
  if (!hit) return id; // isolated – routing will report "no route"
  const target = splitEdgeAt(graph, hit);
  graph.edges.push({
    id: `conn:${id}`, from: id, to: target, kind: 'connector', indoor: false, stairs: false, wheelchair: true, public: true,
    length: Math.round(hit.dist * 10) / 10, prov: connectorProv || genProv('straight-line link to nearest path (estimated)'),
  });
  return id;
}

/**
 * Connect a destination node to the public doors of its building with estimated indoor edges.
 * Falls back to an outdoor connector when the building has no mapped doors.
 */
export function attachDestination(graph, dest, entrances) {
  if (dest.lat == null) return null;
  const id = dest.nodeId || `dest:${dest.id}`;
  let node = graph.nodes.find(n => n.id === id);
  if (!node) { node = { id, lat: dest.lat, lon: dest.lon, kind: 'destination', buildingId: dest.buildingId, floor: dest.floor }; graph.nodes.push(node); }
  if (graph.edges.some(e => e.from === id || e.to === id)) return id;
  // building with a public interior hub: connect to the hub only
  const hub = dest.buildingId && graph.nodes.find(n => n.id === `hub:${dest.buildingId}`);
  if (hub) {
    graph.edges.push({ id: `in:${dest.id}:hub`, from: hub.id, to: id, kind: 'connector-indoor', indoor: true, stairs: false, wheelchair: true, public: true,
      length: Math.max(15, Math.round(haversine([dest.lat, dest.lon], [hub.lat, hub.lon]) * 1.4 * 10) / 10), prov: genProv('estimated indoor walk inside the building') });
    return id;
  }
  const doors = entrances.filter(e => dest.buildingId && e.buildingId === dest.buildingId && e.nodeId);
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  let added = 0;
  for (const ent of doors) {
    const dn = nodesById.get(ent.nodeId);
    if (!dn) continue;
    const straight = haversine([dest.lat, dest.lon], [dn.lat, dn.lon]);
    graph.edges.push({
      id: `in:${dest.id}:${ent.id}`, from: ent.nodeId, to: id, kind: 'connector-indoor', indoor: true, stairs: false,
      wheelchair: true, public: true, length: Math.round(straight * 1.4 * 10) / 10,
      prov: genProv('estimated indoor walk: straight line x1.4, real corridor unknown'),
    });
    added++;
  }
  if (!added) attachPoint(graph, { id, lat: dest.lat, lon: dest.lon, kind: 'destination' });
  return id;
}

/**
 * Largest set of junctions connected by public outdoor edges without passing through doors/barriers.
 * Points are attached only to this network so they never end up on an isolated fragment.
 */
export function mainNetwork(graph) {
  const kinds = new Set(['junction', 'lift']);
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const adj = new Map();
  for (const e of graph.edges) {
    if (e.public === false || e.indoor) continue;
    const a = nodesById.get(e.from), b = nodesById.get(e.to);
    if (!a || !b || !kinds.has(a.kind) || !kinds.has(b.kind) || a.public === false || b.public === false) continue;
    if (!adj.has(a.id)) adj.set(a.id, []);
    if (!adj.has(b.id)) adj.set(b.id, []);
    adj.get(a.id).push(b.id); adj.get(b.id).push(a.id);
  }
  let best = new Set();
  const seen = new Set();
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const comp = new Set([start]); const stack = [start]; seen.add(start);
    while (stack.length) for (const y of adj.get(stack.pop())) if (!seen.has(y)) { seen.add(y); comp.add(y); stack.push(y); }
    if (comp.size > best.size) best = comp;
  }
  return best;
}

/**
 * Buildings whose ground floor is a public thoroughfare (e.g. a hospital lobby) get a "hub" node
 * linked to every door. Official indoor passages between buildings connect hubs.
 */
export function attachHub(graph, building, entrances) {
  const id = `hub:${building.id}`;
  if (!graph.nodes.some(n => n.id === id)) {
    const [lat, lon] = building.hubPoint || building.center;
    graph.nodes.push({ id, lat, lon, kind: 'junction', indoor: true, buildingId: building.id, name: building.name, prov: genProv('lobby / interior hub (position approximate)') });
  }
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const hub = nodesById.get(id);
  for (const ent of entrances.filter(e => e.buildingId === building.id && e.nodeId && nodesById.has(e.nodeId))) {
    const dn = nodesById.get(ent.nodeId);
    const eid = `hub:${building.id}:${ent.id}`;
    if (graph.edges.some(e => e.id === eid)) continue;
    graph.edges.push({ id: eid, from: dn.id, to: id, kind: 'connector-indoor', indoor: true, stairs: false, wheelchair: true, public: true,
      length: Math.round(haversine([dn.lat, dn.lon], [hub.lat, hub.lon]) * 1.3 * 10) / 10, prov: genProv('estimated indoor walk door → lobby') });
  }
  return id;
}
