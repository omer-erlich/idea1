// Turn-by-turn step generation (Hebrew) from a routed path.
// Human-written notes win: node.landmark / edge.note / routeNotes override generated text.
import { bearing, turnAngle, haversine } from './geo.js';
import { pt } from './router.js';

const CARDINALS = ['צפונה', 'צפון-מזרחה', 'מזרחה', 'דרום-מזרחה', 'דרומה', 'דרום-מערבה', 'מערבה', 'צפון-מערבה'];
export const cardinal = b => CARDINALS[Math.round(b / 45) % 8];

export function fmtDistance(m) {
  if (m < 12) return 'כמה מטרים';
  if (m < 100) return `כ-${Math.round(m / 10) * 10} מ'`;
  return `כ-${Math.round(m / 25) * 25} מ'`;
}

export function turnPhrase(angle) {
  const a = Math.abs(angle);
  if (a < 30) return 'המשיכו ישר';
  if (a < 60) return angle > 0 ? 'פנו קלות ימינה' : 'פנו קלות שמאלה';
  if (a < 150) return angle > 0 ? 'פנו ימינה' : 'פנו שמאלה';
  return 'הסתובבו לאחור';
}

/** Breakpoint nodes: places where we must start a new step. */
function isSpecial(n) {
  return n.kind === 'door' || n.kind === 'lift' || n.kind === 'stairs' || n.kind === 'destination' || !!n.landmark || !!n.photo;
}

/**
 * @param G graph from buildGraph
 * @param path from findPath
 * @param ctx { parking, destination, buildings: Map, entrances: Map, routeNote }
 * @returns [{ text, lat, lon, indoor, meters, photo?, nodeId, generated }]
 */
export function generateSteps(G, path, ctx) {
  if (ctx.routeNote && ctx.routeNote.steps?.length) {
    return ctx.routeNote.steps.map(s => ({ ...s, generated: false, lat: s.coords?.[0] ?? null, lon: s.coords?.[1] ?? null }));
  }
  const N = id => G.nodes.get(id);
  const steps = [];
  const legs = [];
  // 1. split the path into legs of similar edges
  let cur = null;
  path.edges.forEach((u, i) => {
    const a = N(path.nodeIds[i]), b = N(path.nodeIds[i + 1]);
    const e = u.edge;
    const coords = edgeCoords(G, u, a, b);
    const h0 = bearing(coords[0], coords[1]);
    const h1 = bearing(coords[coords.length - 2], coords[coords.length - 1]);
    const type = e.kind === 'lift' ? 'lift' : e.stairs ? 'stairs' : e.indoor ? 'indoor' : 'outdoor';
    const startsNew = !cur || cur.type !== type || isSpecial(a) || !!e.note || !!cur.note ||
      (type === 'outdoor' && (Math.abs(turnAngle(cur.endHeading, h0)) >= 35 || (cur.name || '') !== (e.name || '')));
    if (startsNew) {
      cur = { type, from: a, to: b, meters: 0, startHeading: h0, endHeading: h1, name: e.name || '', note: e.note || '', photo: e.photo || null, edges: [] };
      legs.push(cur);
    }
    cur.to = b; cur.meters += e.length; cur.endHeading = h1; cur.edges.push(e);
  });

  // 1b. merge very short plain outdoor legs into the following leg (removes "turn left, 5 m" noise)
  for (let i = legs.length - 2; i >= 0; i--) {
    const a = legs[i], b = legs[i + 1];
    if (a.type === 'outdoor' && b.type === 'outdoor' && a.meters < 20 && !a.note && !b.note && !isSpecial(a.to)) {
      b.from = a.from; b.meters += a.meters; b.startHeading = a.startHeading; b.edges = [...a.edges, ...b.edges];
      legs.splice(i, 1);
    }
  }

  // 2. turn legs into Hebrew instructions
  let prevHeading = null;
  legs.forEach((leg, i) => {
    const prev = legs[i - 1];
    let text;
    const entering = leg.from.kind === 'door' && leg.type === 'indoor';
    const exiting = leg.from.kind === 'door' && prev && prev.type === 'indoor' && leg.type !== 'indoor';
    if (leg.note) text = leg.note;
    else if (leg.type === 'lift') text = `עלו/רדו במעלית לקומה ${leg.to.floor ?? ctx.destination?.floor ?? ''}`.trim();
    else if (leg.type === 'stairs') text = `השתמשו במדרגות (${fmtDistance(leg.meters)})`;
    else if (i === 0) {
      text = `מהחניה (${ctx.parking?.name || 'נקודת ההתחלה'}) צאו ולכו ${cardinal(leg.startHeading)}, ${fmtDistance(leg.meters)}`;
    } else if (leg.type === 'indoor') {
      // indoor geometry is mostly estimated: never invent left/right turns inside buildings
      const estimated = leg.edges.every(e => e.kind === 'connector-indoor' || e.prov?.source === 'generated');
      const inside = estimated ? 'המשיכו בתוך הבניין לפי השילוט' : `המשיכו במסדרון ${fmtDistance(leg.meters)}`;
      text = entering ? `היכנסו ל${buildingName(ctx, leg.from) || 'בניין'} דרך ${doorName(G, leg.from)}, ו${inside}` : inside;
    } else {
      const lead = exiting ? `צאו מהבניין דרך ${doorName(G, leg.from)}, ` : '';
      const along = leg.name ? ` לאורך ${leg.name}` : '';
      text = `${lead}${turnPhrase(turnAngle(prevHeading, leg.startHeading))}${along}, ${fmtDistance(leg.meters)}`;
    }
    // landmark on the node where this leg ends is shown as part of this step
    const end = leg.to;
    if (!leg.note && end.landmark) text += ` — ${end.landmark}`;
    if (end.kind === 'door' && leg.type !== 'indoor' && !(legs[i + 1]?.type === 'indoor')) {
      // passing through a door into a non-indoor leg (rare) – mention it
      text += ` (דרך ${doorName(G, end)})`;
    }
    const lastCoord = pt(end);
    steps.push({
      text, lat: lastCoord[0], lon: lastCoord[1],
      indoor: leg.edges.some(e => e.indoor) || leg.type === 'lift',
      meters: Math.round(leg.meters),
      photo: end.photo || leg.photo || null,
      nodeId: end.id, generated: !leg.note,
    });
    prevHeading = leg.endHeading;
  });

  // 3. "enter building" step if the last outdoor leg ends at a door and the next leg is indoor is covered above;
  //    add the arrival step.
  const d = ctx.destination;
  if (d) {
    const last = steps[steps.length - 1];
    steps.push({
      text: `הגעתם: ${d.name}${d.floor != null && d.floor !== '' ? `, קומה ${d.floor}` : ''}${d.hint ? ' — ' + d.hint : ''}`,
      lat: last ? last.lat : d.lat, lon: last ? last.lon : d.lon,
      indoor: true, meters: 0, photo: d.photo || null, nodeId: d.nodeId, generated: true, arrival: true,
    });
  }
  return steps;
}

function edgeCoords(G, u, a, b) {
  let line = u.edge.polyline && u.edge.polyline.length >= 2 ? u.edge.polyline.slice() : [pt(G.nodes.get(u.edge.from)), pt(G.nodes.get(u.edge.to))];
  if (!u.forward) line.reverse();
  line[0] = pt(a); line[line.length - 1] = pt(b);
  if (line.length === 2 && haversine(line[0], line[1]) < 0.01) line[1] = [line[1][0] + 1e-7, line[1][1]];
  return line;
}

function doorName(G, node) {
  const ent = node.entranceId ? G.entrances.get(node.entranceId) : null;
  return ent?.name || node.name || 'הכניסה';
}

function buildingName(ctx, node) {
  const ent = node.entranceId ? ctx.entrances?.get(node.entranceId) : null;
  const bid = ent?.buildingId || node.buildingId;
  return bid ? ctx.buildings?.get(bid)?.name : null;
}
