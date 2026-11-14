// Turn-by-turn steps (Hebrew) from a path on the campus graph.
// Outdoors: street walks with direction + distance. Indoors: a chain of LANDMARKS ("עגלת קפה", "מעליות מערביות") with
// floor changes spelled out – GPS is unreliable inside, so every indoor step carries an `ask` the UI uses to confirm progress:
//   ask: 'see'    → "do you see <landmark>?"        ask: 'floor' → "which floor are you on?"      ask: 'arrive' → "did you get in?"
import { bearing, turnAngle } from './geo.js';
import { cardinal, fmtDistance, turnPhrase } from './steps.js';

const NOT_INDOOR = new Set(['parking', 'junction', 'busstop']);
const isIndoorNode = n => !!n.building && !NOT_INDOOR.has(n.kind) && n.kind !== 'entrance';

const shortLabel = l => String(l || '').split('·')[0].replace(/^תחנה:\s*/, '').trim();

function hopBearings(R, h) {
  const A = R.nodes.get(h.from), B = R.nodes.get(h.to);
  let line = h.edge.poly && h.edge.poly.length > 2 ? h.edge.poly : [[A.lat, A.lon], [B.lat, B.lon]];
  if (h.edge.poly && !h.fwd) line = line.slice().reverse();
  return { start: bearing(line[0], line[1]), end: bearing(line[line.length - 2], line[line.length - 1]) };
}

export function generateTopoSteps(R, path, ctx) {
  const N = id => R.nodes.get(id);
  const bname = id => R.buildings.get(id)?.name?.split('(')[0].trim() || 'הבניין';
  const steps = [];
  const destId = path.nodeIds[path.nodeIds.length - 1];
  let walk = null, prevHeading = null;

  const push = s => { steps.push({ indoor: false, kind: 'walk', ...s }); return steps[steps.length - 1]; };

  function flushWalk(endNode) {
    if (!walk) return;
    const w = walk; walk = null;
    const first = steps.length === 0;
    let lead;
    if (first) {
      const heading = cardinal(w.startBearing);
      if (ctx.kind === 'parking') lead = `מהחניה (${ctx.parking?.name || 'החניה'}) לכו ${heading}`;
      else if (ctx.kind === 'bus') lead = `מהתחנה (${shortLabel(ctx.stop?.label || ctx.start?.label)}) לכו ${heading}`;
      else lead = `מהמקום שבו אתם לכו ${heading}`;
    } else lead = turnPhrase(turnAngle(prevHeading ?? w.startBearing, w.startBearing));
    const along = w.names.size ? ` לאורך ${[...w.names].slice(0, 2).join(' / ')}` : '';
    const target = endNode.kind === 'entrance' ? ` עד ${shortLabel(endNode.label)}` : endNode.kind === 'junction' && endNode.label !== 'צומת' ? ` עד ${endNode.label}` : '';
    push({ text: `${lead}${along}, ${fmtDistance(w.meters)}${target}`, nodeId: endNode.id, lat: endNode.lat, lon: endNode.lon, meters: Math.round(w.meters), sec: Math.round(w.sec), floor: null });
    prevHeading = w.endBearing;
  }

  for (let i = 0; i < path.hops.length; i++) {
    const h = path.hops[i], e = h.edge, A = N(h.from), B = N(h.to);
    const outdoorWalk = !e.indoor && (e.kind === 'road' || e.kind === 'path');
    if (outdoorWalk) {
      const b = hopBearings(R, h);
      if (!walk) walk = { meters: 0, sec: 0, names: new Set(), startBearing: b.start, endBearing: b.end };
      walk.meters += e.m ?? e.sec * 1.1; walk.sec += e.sec; walk.endBearing = b.end;
      if (e.name) walk.names.add(e.name);
      if (e.stairs && !walk.stairs) walk.stairs = true;
      continue;
    }
    flushWalk(A);
    const isDest = h.to === destId;
    const text = {
      fallbackTarget: `המשיכו אל: ${shortLabel(B.label)}`,
    };

    if (e.kind === 'link' && A.kind === 'entrance' && B.building) {
      push({ text: `היכנסו ל${bname(B.building)} דרך ${shortLabel(A.label)}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'enter', ask: 'arrive', landmark: shortLabel(A.label), building: B.building });
    } else if (e.kind === 'link' && B.kind === 'entrance') {
      push({ text: `צאו מהבניין דרך ${shortLabel(B.label)}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: false, sec: e.sec, kind: 'exit' });
    } else if (e.kind === 'link' && (A.kind === 'parking' || A.kind === 'busstop')) {
      push({ text: steps.length === 0 ? `מהחניה עברו אל: ${shortLabel(B.label)}` : text.fallbackTarget, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: isIndoorNode(B), floor: B.floor, sec: e.sec, kind: 'indoor', ask: isIndoorNode(B) ? 'see' : undefined, landmark: shortLabel(B.label), building: B.building });
    } else if (e.kind === 'link' && B.kind === 'floor' || (e.kind === 'link' && A.kind === 'floor')) {
      continue;                                                   // lobby ↔ ground-floor node: no instruction needed
    } else if (e.kind === 'floor-exit' || e.kind === 'elevator') {
      // a ride whenever the floor changes – in either direction (elevator → floor, or floor → elevator's base floor)
      const lift = A.kind === 'elevator' || A.kind === 'stairs' ? A : B.kind === 'elevator' || B.kind === 'stairs' ? B : null;
      const from = +A.floor, to = +B.floor;
      const changes = Number.isFinite(from) && Number.isFinite(to) && from !== to;
      if (lift && changes) {
        const dir = to > from ? 'עלו' : 'רדו';
        push({ text: `${dir} ב${shortLabel(lift.label)} לקומה ${B.floor}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'elevator', ask: 'floor', expectFloor: String(B.floor), building: B.building, landmark: shortLabel(lift.label) });
      } else {
        push({ text: text.fallbackTarget, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'indoor', ask: 'see', landmark: shortLabel(B.label), building: B.building });
      }
    } else if (e.kind === 'stairs') {
      const from = +A.floor, to = +B.floor;
      const dir = Number.isFinite(from) && Number.isFinite(to) && to !== from ? (to > from ? 'עלו' : 'רדו') : 'המשיכו';
      const via = A.kind === 'stairs' ? A : B.kind === 'stairs' ? B : null;
      push({ text: `${dir} במדרגות${via ? ` (${shortLabel(via.label)})` : ''} אל: ${shortLabel(B.label)}${B.floor != null && B.kind !== 'floor' ? ` (קומה ${B.floor})` : ''}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: isIndoorNode(B), floor: B.floor, sec: e.sec, kind: 'stairs', ask: isIndoorNode(B) ? 'floor' : undefined, expectFloor: B.floor != null ? String(B.floor) : undefined, building: B.building, landmark: shortLabel(B.label) });
    } else if (e.kind === 'moving-walkway') {
      push({ text: `עלו על המסועים${e.note ? ` (${e.note})` : ''} אל: ${shortLabel(B.label)}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'indoor', ask: 'see', landmark: shortLabel(B.label), building: B.building });
    } else if (e.kind === 'passage') {
      const crossing = B.building && A.building && B.building !== A.building;
      const fa = +A.floor, fb = +B.floor;
      if (crossing && A.kind === 'floor' && B.kind === 'floor' && A.floor != null && B.floor != null && Number.isFinite(fa) && Number.isFinite(fb) && fa !== fb) {
        // e.g. garage floor 2 → floor 1 of another building
        push({ text: `מ${shortLabel(A.label)} עברו במעבר הפנימי לקומה ${B.floor} ב${bname(B.building)}${e.conf === 'inferred' ? ' (לא מאומת – אם אין מעבר, חזרו אל המעליות)' : ''}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'passage', ask: 'floor', expectFloor: String(B.floor), landmark: shortLabel(B.label), building: B.building });
        continue;
      }
      push({ text: `המשיכו במעבר הפנימי${crossing ? ` אל ${bname(B.building)}` : ''}${e.note ? ` – ${e.note}` : ''}${B.kind === 'hall' && /OSM/.test(B.label) ? '' : `: ${shortLabel(B.label)}`}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: true, floor: B.floor, sec: e.sec, kind: 'passage', ask: 'see', landmark: shortLabel(B.label), building: B.building || A.building });
    } else if (B.kind === 'floor') {
      // arriving at a floor node by hallway: the following hop (floor → area) carries the instruction
      continue;
    } else if (A.kind === 'floor' && steps.length && steps[steps.length - 1].kind === 'elevator' && steps[steps.length - 1].nodeId === A.id) {
      // elevator exit → floor → area: one combined step ("עלו … לקומה 5, צאו אל: קומה 5 – אגף מזרחי")
      const prev = steps[steps.length - 1];
      prev.text += `, ואז אל: ${shortLabel(B.label)}`; prev.nodeId = B.id; prev.lat = B.lat; prev.lon = B.lon; prev.landmark = shortLabel(B.label);
      continue;
    } else {
      const indoor = isIndoorNode(B) || B.kind === 'entrance';
      push({ text: `${text.fallbackTarget}${e.note ? ` – ${e.note}` : ''}`, nodeId: B.id, lat: B.lat, lon: B.lon, indoor: isIndoorNode(B), floor: B.floor, sec: e.sec, kind: indoor ? 'indoor' : 'walk', ask: isIndoorNode(B) ? 'see' : undefined, landmark: shortLabel(B.label), building: B.building });
    }
  }
  flushWalk(N(path.nodeIds[path.nodeIds.length - 1]));

  // arrival: replace the last "continue to <destination>" step
  const d = ctx.dest, last = N(destId);
  if (path.hops.length && steps.length && steps[steps.length - 1].nodeId === destId && steps[steps.length - 1].kind !== 'elevator' && steps[steps.length - 1].kind !== 'stairs' && !(steps[steps.length - 1].kind === 'passage' && steps[steps.length - 1].ask === 'floor')) steps.pop();
  steps.push({ text: `הגעתם: ${d?.name || shortLabel(last.label)}${(d?.floor ?? last.floor) != null && (d?.floor ?? last.floor) !== '' ? `, קומה ${d?.floor ?? last.floor}` : ''}${d?.hint ? ` — ${d.hint}` : ''}`,
    nodeId: destId, lat: last.lat, lon: last.lon, indoor: !!last.building, kind: 'arrive', arrival: true, floor: d?.floor ?? last.floor, sec: 0, meters: 0 });
  if (!steps.length) steps.push({ text: 'אתם כבר ביעד', nodeId: destId, lat: last.lat, lon: last.lon, indoor: true, kind: 'arrive', arrival: true });
  return steps;
}
