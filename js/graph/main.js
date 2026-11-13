// Internal graph viewer for data/topology.json
import { Layout, project } from './layout.js';

const NS = 'http://www.w3.org/2000/svg';
const $ = (s, r = document) => r.querySelector(s);
const el = (name, attrs = {}, parent) => { const e = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.append(e); return e; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const KIND = {
  clinic: { he: 'מרפאה / מכון', color: '#2563eb' }, room: { he: 'חדר', color: '#60a5fa' },
  elevator: { he: 'מעלית', color: '#7c3aed' }, stairs: { he: 'מדרגות', color: '#a78bfa' },
  admin: { he: 'משרד / מודיעין', color: '#f97316' }, lobby: { he: 'לובי', color: '#0d9488' },
  hall: { he: 'מסדרון / אזור', color: '#94a3b8' }, floor: { he: 'קומה', color: '#475569', shape: 'sq' },
  entrance: { he: 'כניסה לבניין', color: '#16a34a' }, parking: { he: 'חניה', color: '#eab308', shape: 'sq' },
  junction: { he: 'צומת / כביש', color: '#64748b' }, busstop: { he: 'תחנת אוטובוס', color: '#0ea5e9', shape: 'sq' }, other: { he: 'ציון דרך / אחר', color: '#ec4899' },
};
const EKIND = {
  hallway: { he: 'מסדרון', color: '#94a3b8', w: 2 }, passage: { he: 'מעבר בין בניינים (מבפנים)', color: '#0d9488', w: 4 },
  'floor-exit': { he: 'יציאה מקומה / מעלית', color: '#7c3aed', w: 2 }, stairs: { he: 'מדרגות', color: '#a78bfa', w: 2.5 },
  'moving-walkway': { he: 'מסוע', color: '#06b6d4', w: 3 }, road: { he: 'כביש', color: '#334155', w: 3.5 },
  path: { he: 'שביל / מדרכה', color: '#22c55e', w: 1.8 }, link: { he: 'חיבור (דלת ↔ לובי)', color: '#cbd5e1', w: 1.2 },
  elevator: { he: 'נסיעה במעלית', color: '#7c3aed', w: 2 },
};
const GROUP_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];
const SEPARATE_COLOR = '#9ca3af';
const CONF_HE = { text: 'טקסט רשמי של שיבא', osm: 'OpenStreetMap', inferred: 'משוער / לא מאומת' };

const S = { topo: null, L: null, view: { k: 0.4, x: 0, y: 0 }, kindOn: new Set(), ekindOn: new Set(), selected: null, hover: null, A: null, B: null, pathNodes: new Set(), pathEdges: new Set(), frozen: false, showLabels: true };
let svg, vp, gOutlines, gHulls, gEdges, gElabels, gNodes, gNlabels, nodeEls = new Map(), edgeEls = [], labelEls = new Map(), hullEls = new Map(), groupById = new Map(), buildingById = new Map(), rank = new Map(), adj = new Map();

const topo = await (await fetch('data/topology.json')).json();
S.topo = topo;
for (const k of Object.keys(KIND)) S.kindOn.add(k);
for (const k of Object.keys(EKIND)) S.ekindOn.add(k);
topo.groups.forEach((g, i) => { g.color = g.separate ? SEPARATE_COLOR : GROUP_COLORS[i % GROUP_COLORS.length]; groupById.set(g.id, g); });
topo.buildings.forEach(b => buildingById.set(b.id, b));
[...topo.nodes].sort((a, b) => b.imp - a.imp).forEach((n, i) => rank.set(n.id, i + 1));
for (const n of topo.nodes) adj.set(n.id, []);
for (const e of topo.edges) { adj.get(e.a).push({ to: e.b, e }); adj.get(e.b).push({ to: e.a, e }); }
S.L = new Layout(topo);
const nodeOf = id => S.L.byId.get(id);

function init() {
  svg = $('#g-svg');
  vp = el('g', { id: 'vp' }, svg);
  gOutlines = el('g', {}, vp); gHulls = el('g', {}, vp); gEdges = el('g', {}, vp); gElabels = el('g', {}, vp); gNodes = el('g', {}, vp); gNlabels = el('g', {}, vp);
  buildScene();
  buildSidebar();
  bindInteraction();
  const m = topo.meta;
  $('#g-stats').textContent = `${m.nodes} צמתים · ${m.edges} קווים · ${m.clinics.placed} מרפאות ממוקמות` + (m.clinics.unplaced ? ` · ${m.clinics.unplaced} ללא מיקום ידוע` : '');
  if (innerWidth <= 700) $('#g-side').classList.add('closed');
  fit();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ scene
function nodeRadius(n) { return n.r; }

function buildScene() {
  // real building outlines (optional underlay)
  for (const b of topo.buildings) {
    if (!b.outline) continue;
    const g = groupById.get(b.group);
    const pts = b.outline.map(([la, lo]) => project(la, lo).join(',')).join(' ');
    el('polygon', { class: 'outline', points: pts, fill: g.color, stroke: g.color, display: 'none' }, gOutlines).dataset.b = b.id;
  }
  for (const e of S.L.edges) {
    const k = EKIND[e.ref.kind] || EKIND.hallway;
    const cls = ['edge'];
    if (e.ref.est) cls.push('est');
    if (e.ref.conf === 'inferred') cls.push('inferred');
    const line = el('line', { class: cls.join(' '), stroke: k.color, 'stroke-width': k.w, 'stroke-opacity': e.ref.kind === 'link' ? 0.6 : 0.85 }, gEdges);
    const hit = el('line', { class: 'edge hit' }, gEdges);
    const lab = el('text', { class: 'elabel' }, gElabels);
    lab.textContent = fmtSec(e.ref.sec);
    hit.addEventListener('click', ev => { ev.stopPropagation(); showEdge(e); });
    hit.addEventListener('pointerenter', ev => tip(ev, `${EKIND[e.ref.kind]?.he || e.ref.kind} · ${fmtSec(e.ref.sec)}${e.ref.est ? ' (משוער)' : ''}`));
    hit.addEventListener('pointerleave', () => tip());
    edgeEls.push({ e, line, hit, lab });
  }
  for (const n of S.L.nodes) {
    const k = KIND[n.ref.kind] || KIND.other;
    const r = nodeRadius(n);
    const c = k.shape === 'sq'
      ? el('rect', { class: 'node', x: -r, y: -r, width: r * 2, height: r * 2, rx: 3, fill: k.color }, gNodes)
      : n.ref.kind === 'elevator'
        ? el('polygon', { class: 'node', points: `0,${-r * 1.25} ${r * 1.25},0 0,${r * 1.25} ${-r * 1.25},0`, fill: k.color }, gNodes)
        : el('circle', { class: 'node', r, fill: k.color }, gNodes);
    if (n.ref.kind === 'entrance' && n.ref.publicAccess !== 'yes') c.classList.add('noconn');
    c.addEventListener('pointerdown', ev => startDrag(ev, n));
    c.addEventListener('pointerenter', ev => { S.hover = n; hoverHighlight(n); tip(ev, `${n.ref.label}${n.ref.floor != null && n.ref.kind !== 'floor' ? ` · קומה ${n.ref.floor}` : ''}`); });
    c.addEventListener('pointerleave', () => { S.hover = null; hoverHighlight(null); tip(); });
    c.addEventListener('dblclick', () => { n.pinned = false; c.classList.remove('pinned'); S.L.reheat(0.3); });
    nodeEls.set(n.id, c);
    const t = el('text', { class: 'nlabel' }, gNlabels);
    t.textContent = n.ref.label;
    labelEls.set(n.id, t);
  }
  for (const b of topo.buildings) {
    const g = groupById.get(b.group);
    const path = el('path', { class: 'hull' + (g.separate ? ' separate' : ''), fill: g.color, 'fill-opacity': g.separate ? 0.1 : 0.16, stroke: g.color }, gHulls);
    path.addEventListener('click', () => focusBuilding(b.id));
    const text = el('text', { class: 'hull-label', fill: g.separate ? '#6b7280' : g.color }, gHulls);
    text.textContent = (g.separate ? '⛔ ' : '') + b.name.split('(')[0].trim();
    hullEls.set(b.id, { path, text });
  }
  applyFilters();
}

const fmtSec = s => (s >= 90 ? `${Math.round(s / 6) / 10} דק'` : `${s} ש'`);

// ------------------------------------------------------------------ rendering loop
let frameNo = 0;
function frame() {
  const L = S.L;
  const vis = n => nodeVisible(n);
  if (!S.frozen && L.running) for (let i = 0; i < 2; i++) L.tick(vis);
  draw(L.running || frameNo++ % 30 === 0);
  requestAnimationFrame(frame);
}

function nodeVisible(n) { return S.kindOn.has(n.ref.kind in KIND ? n.ref.kind : 'other'); }

function draw(full) {
  const k = S.view.k;
  vp.setAttribute('transform', `translate(${S.view.x},${S.view.y}) scale(${k})`);
  const weightsOn = $('#o-weights').checked && k > 3;
  const focus = S.selected || S.hover;
  const fs = 12 / k;
  const imp0 = Math.max(0, 0.6 - 0.2 * Math.log2(Math.max(k, 0.25) / 0.5));
  const cands = [];
  for (const n of S.L.nodes) {
    const c = nodeEls.get(n.id);
    if (c.style.display === 'none') continue;
    c.setAttribute('transform', `translate(${n.x},${n.y})`);
    const t = labelEls.get(n.id);
    const forced = n === S.selected || n === S.hover || n.id === S.A || n.id === S.B || S.pathNodes.has(n.id) || matchSet.has(n.id);
    const show = S.showLabels && (n.imp >= imp0 || forced);
    if (show) cands.push({ n, t, prio: forced ? 10 : n.imp }); else t.style.display = 'none';
  }
  // greedy label placement in screen space: most important first, skip anything that would overlap
  cands.sort((a, b) => b.prio - a.prio);
  const placed = [], CELLS = new Map();
  for (const { n, t, prio } of cands) {
    const w = (n.ref.label.length * 6.3 + 8), h = 15;
    const sx = n.x * k + S.view.x - w / 2, sy = (n.y + nodeRadius(n) + fs * 0.2) * k + S.view.y;
    let ok = true;
    if (prio < 10) {
      for (let gx = Math.floor(sx / 120); gx <= Math.floor((sx + w) / 120) && ok; gx++) for (let gy = Math.floor(sy / 40); gy <= Math.floor((sy + h) / 40) && ok; gy++) {
        for (const q of CELLS.get(gx + ',' + gy) || []) if (sx < q[0] + q[2] && sx + w > q[0] && sy < q[1] + q[3] && sy + h > q[1]) { ok = false; break; }
      }
    }
    if (!ok) { t.style.display = 'none'; continue; }
    const box = [sx, sy, w, h];
    for (let gx = Math.floor(sx / 120); gx <= Math.floor((sx + w) / 120); gx++) for (let gy = Math.floor(sy / 40); gy <= Math.floor((sy + h) / 40); gy++) { const key = gx + ',' + gy; (CELLS.get(key) || CELLS.set(key, []).get(key)).push(box); }
    t.style.display = ''; t.setAttribute('x', n.x); t.setAttribute('y', n.y + nodeRadius(n) + fs * 1.05); t.setAttribute('font-size', fs); t.style.strokeWidth = 3.5 / k;
  }
  for (const { e, line, hit, lab } of edgeEls) {
    if (line.style.display === 'none') continue;
    const x1 = e.a.x, y1 = e.a.y, x2 = e.b.x, y2 = e.b.y;
    line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    hit.setAttribute('x1', x1); hit.setAttribute('y1', y1); hit.setAttribute('x2', x2); hit.setAttribute('y2', y2);
    hit.setAttribute('stroke-width', 10 / k);
    const showW = weightsOn || S.pathEdges.has(e.ref.id) || (focus && (e.a === focus || e.b === focus));
    lab.style.display = showW ? 'block' : 'none';
    if (showW) { lab.setAttribute('x', (x1 + x2) / 2); lab.setAttribute('y', (y1 + y2) / 2 - 2 / k); lab.setAttribute('font-size', 11 / k); lab.style.strokeWidth = 3 / k; }
  }
  if (full) drawHulls(fs);
}

function drawHulls(fs) {
  const show = $('#o-hulls').checked;
  for (const [bid, { path, text }] of hullEls) {
    const list = S.L.buildings.get(bid)?.filter(nodeVisible) || [];
    if (!show || !list.length) { path.style.display = 'none'; text.style.display = 'none'; continue; }
    const pad = 16;
    const pts = [];
    for (const n of list) { const r = nodeRadius(n) + pad; for (let a = 0; a < 8; a++) pts.push([n.x + Math.cos(a * Math.PI / 4) * r, n.y + Math.sin(a * Math.PI / 4) * r]); }
    const h = hull(pts);
    path.style.display = ''; text.style.display = '';
    path.setAttribute('d', 'M' + h.map(p => p.map(v => v.toFixed(1)).join(',')).join('L') + 'Z');
    let cx = 0, miny = Infinity;
    for (const p of h) { cx += p[0]; miny = Math.min(miny, p[1]); }
    text.setAttribute('x', cx / h.length); text.setAttribute('y', miny - 6 / S.view.k);
    text.setAttribute('font-size', 15 / S.view.k);
    text.style.strokeWidth = 4 / S.view.k;
  }
}

function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

// ------------------------------------------------------------------ filters, highlight
let matchSet = new Set();
function applyFilters() {
  const estOnly = $('#o-estonly')?.checked;
  for (const [id, c] of nodeEls) { const n = nodeOf(id); const on = nodeVisible(n); c.style.display = on ? '' : 'none'; labelEls.get(id).style.display = on ? '' : 'none'; }
  for (const { e, line, hit, lab } of edgeEls) {
    const on = nodeVisible(e.a) && nodeVisible(e.b) && S.ekindOn.has(e.ref.kind);
    for (const x of [line, hit]) x.style.display = on ? '' : 'none';
    if (!on) lab.style.display = 'none';
    line.style.opacity = estOnly && !(e.ref.est || e.ref.conf === 'inferred') ? 0.1 : '';
    line.classList.toggle('path-hl', S.pathEdges.has(e.ref.id));
  }
  for (const o of gOutlines.children) o.style.display = $('#o-outline').checked ? '' : 'none';
  S.L.reheat(0.25);
}

function hoverHighlight(n) {
  if (!n) { for (const c of nodeEls.values()) c.classList.remove('dim'); for (const { line } of edgeEls) line.classList.remove('dim'); return; }
  const near = new Set([n.id, ...adj.get(n.id).map(x => x.to)]);
  for (const [id, c] of nodeEls) c.classList.toggle('dim', !near.has(id));
  for (const { e, line } of edgeEls) line.classList.toggle('dim', e.a !== n && e.b !== n);
}

// ------------------------------------------------------------------ interaction
function toWorld(px, py) { return [(px - S.view.x) / S.view.k, (py - S.view.y) / S.view.k]; }
function bindInteraction() {
  const pts = new Map();
  let pan = null, pinch = null;
  svg.addEventListener('pointerdown', ev => {
    if (ev.target !== svg && !ev.target.classList?.contains('hull')) return;
    svg.setPointerCapture(ev.pointerId);
    pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pts.size === 1) { pan = { x: ev.clientX, y: ev.clientY, vx: S.view.x, vy: S.view.y, moved: false }; svg.classList.add('panning'); }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: S.view.k }; pan = null; }
  });
  svg.addEventListener('pointermove', ev => {
    if (!pts.has(ev.pointerId)) return;
    pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pinch && pts.size === 2) { const [a, b] = [...pts.values()]; zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, true); }
    else if (pan) { const dx = ev.clientX - pan.x, dy = ev.clientY - pan.y; if (Math.abs(dx) + Math.abs(dy) > 3) pan.moved = true; S.view.x = pan.vx + dx; S.view.y = pan.vy + dy; }
  });
  const up = ev => { pts.delete(ev.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { svg.classList.remove('panning'); if (pan && !pan.moved && ev.target === svg) closeDetail(); pan = null; } };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', ev => { ev.preventDefault(); zoomAt(ev.clientX, ev.clientY - svg.getBoundingClientRect().top, S.view.k * Math.exp(-ev.deltaY * 0.0016)); }, { passive: false });
  window.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeDetail(); });
}

function zoomAt(cx, cy, k, absolute) {
  k = Math.max(0.08, Math.min(14, k));
  const top = absolute ? svg.getBoundingClientRect().top : 0;
  const py = absolute ? cy - top : cy;
  const [wx, wy] = toWorld(cx, py);
  S.view.k = k; S.view.x = cx - wx * k; S.view.y = py - wy * k;
}

let drag = null;
function startDrag(ev, n) {
  ev.stopPropagation(); ev.preventDefault();
  const c = nodeEls.get(n.id);
  c.setPointerCapture(ev.pointerId);
  drag = { n, x0: ev.clientX, y0: ev.clientY, moved: false };
  const move = e => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 4) { drag.moved = true; n.pinned = true; c.classList.add('pinned'); }
    if (drag.moved) { const r = svg.getBoundingClientRect(); const [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top); n.x = wx; n.y = wy; S.L.reheat(0.35); }
  };
  const end = e => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', end); c.removeEventListener('pointercancel', end); if (drag && !drag.moved) selectNode(n); drag = null; };
  c.addEventListener('pointermove', move); c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
}

function tip(ev, text) {
  const t = $('#g-tip');
  if (!text) { t.hidden = true; return; }
  const r = svg.getBoundingClientRect();
  t.textContent = text; t.hidden = false;
  t.style.left = Math.min(ev.clientX - r.left + 14, r.width - 290) + 'px'; t.style.top = (ev.clientY - r.top + 14) + 'px';
}

function viewport() {
  const r = svg.getBoundingClientRect();
  const side = $('#g-side'); const open = !side.classList.contains('closed') && r.width > 700;
  const sideW = open ? side.getBoundingClientRect().width : 0;
  return { w: r.width, h: r.height, cx: (r.width - sideW) / 2, aw: r.width - sideW };   // RTL: the side panel sits on the right
}
function fit() {
  const list = S.L.nodes.filter(nodeVisible).filter(n => !n.docked);
  if (!list.length) return;
  const xs = list.map(n => n.x), ys = list.map(n => n.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const v = viewport();
  const k = Math.min((v.aw - 50) / Math.max(1, x1 - x0), (v.h - 50) / Math.max(1, y1 - y0));
  S.view.k = Math.max(0.1, Math.min(3, k)); S.view.x = v.cx - ((x0 + x1) / 2) * S.view.k; S.view.y = v.h / 2 - ((y0 + y1) / 2) * S.view.k;
}

function focusNode(n, k = 2.6) {
  const v = viewport();
  S.view.k = Math.max(S.view.k, k); S.view.x = v.cx - n.x * S.view.k; S.view.y = v.h / 2 - n.y * S.view.k;
}
function focusBuilding(bid) {
  const list = (S.L.buildings.get(bid) || []).filter(nodeVisible);
  if (!list.length) return;
  const xs = list.map(n => n.x), ys = list.map(n => n.y);
  const x0 = Math.min(...xs) - 30, x1 = Math.max(...xs) + 30, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30;
  const v = viewport();
  const k = Math.min(6, (v.aw * 0.9) / (x1 - x0), (v.h * 0.85) / (y1 - y0));
  S.view.k = k; S.view.x = v.cx - ((x0 + x1) / 2) * k; S.view.y = v.h / 2 - ((y0 + y1) / 2) * k;
}

// ------------------------------------------------------------------ details
function selectNode(n) {
  if (S.selected) nodeEls.get(S.selected.id)?.classList.remove('sel');
  S.selected = n;
  nodeEls.get(n.id).classList.add('sel');
  const t = n.ref, b = t.building ? buildingById.get(t.building) : null, g = b ? groupById.get(b.group) : null;
  const nbs = adj.get(n.id).slice().sort((x, y) => x.e.sec - y.e.sec);
  const gm = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.label + ' שיבא תל השומר')}`;
  const d = $('#g-detail');
  d.hidden = false;
  d.innerHTML = `<button class="gbtn close" id="d-close">✕</button>
    <h2>${esc(t.label)}</h2>
    <span class="pill ${esc(t.conf)}">${esc(CONF_HE[t.conf] || t.conf)}</span> <span class="pill">${esc(KIND[t.kind]?.he || t.kind)}</span>
    <table>
      <tr><td>בניין</td><td>${b ? esc(b.name) : '—'}${g ? (g.separate ? ' <span class="pill">⛔ אין מעבר פנימי ידוע</span>' : `<br><span class="small muted">מחובר מבפנים אל: ${esc(g.name)}</span>`) : ''}</td></tr>
      <tr><td>קומה</td><td>${t.floor != null ? esc(t.floor) : '—'}${t.wing ? ' · אגף ' + esc(t.wing) : ''}</td></tr>
      <tr><td>חשיבות ברשת</td><td>#${rank.get(t.id)} מתוך ${topo.nodes.length} (דרגה ${t.deg}, ציון ${t.bc})</td></tr>
      ${t.publicAccess ? `<tr><td>פתוח לקהל</td><td>${esc(t.publicAccess)}</td></tr>` : ''}
      ${t.note ? `<tr><td>הערה</td><td>${esc(t.note)}</td></tr>` : ''}
      <tr><td>מקור</td><td class="small">${esc(t.src || '—')}</td></tr>
      ${t.lat != null ? `<tr><td>מיקום</td><td class="small">${t.geo === 'exact' ? 'מדויק' : 'מרכז הבניין (משוער)'} · ${t.lat}, ${t.lon}</td></tr>` : ''}
    </table>
    <div class="btns"><button class="gbtn" id="d-a">קבע כמוצא</button><button class="gbtn" id="d-b">קבע כיעד</button><a class="gbtn" target="_blank" rel="noopener" href="${gm}">חיפוש במפות גוגל ↗</a></div>
    <b class="small">שכנים (${nbs.length})</b>
    <table>${nbs.map(x => `<tr><td><button class="nb" data-id="${esc(x.to)}">${esc(nodeOf(x.to).ref.label)}</button></td><td class="small">${esc(EKIND[x.e.kind]?.he || x.e.kind)}</td><td class="small">${fmtSec(x.e.sec)}${x.e.est ? '~' : ''}</td></tr>`).join('')}</table>`;
  $('#d-close').onclick = closeDetail;
  $('#d-a').onclick = () => setEnd('A', n.id); $('#d-b').onclick = () => setEnd('B', n.id);
  d.querySelectorAll('.nb').forEach(b => { b.onclick = () => { const m = nodeOf(b.dataset.id); focusNode(m, S.view.k); selectNode(m); }; });
}
function showEdge(e) {
  const r = e.ref, d = $('#g-detail');
  d.hidden = false;
  d.innerHTML = `<button class="gbtn close" id="d-close">✕</button><h2>${esc(EKIND[r.kind]?.he || r.kind)}</h2>
    <span class="pill ${esc(r.conf)}">${esc(CONF_HE[r.conf] || r.conf)}</span>
    <table><tr><td>מ–אל</td><td>${esc(e.a.ref.label)}<br>↔ ${esc(e.b.ref.label)}</td></tr>
    <tr><td>משקל</td><td>${fmtSec(r.sec)} ${r.m ? `· ${r.m} מ'` : ''} ${r.est ? '<span class="pill inferred">משוער – נא למדוד</span>' : '<span class="pill osm">נמדד לפי OSM</span>'}</td></tr>
    <tr><td>מבפנים</td><td>${r.indoor ? 'כן' : 'לא'}</td></tr>${r.name ? `<tr><td>שם</td><td>${esc(r.name)}</td></tr>` : ''}${r.note ? `<tr><td>הערה</td><td>${esc(r.note)}</td></tr>` : ''}
    <tr><td>מקור</td><td class="small">${esc(r.src || '—')}</td></tr></table>`;
  $('#d-close').onclick = closeDetail;
}
function closeDetail() { $('#g-detail').hidden = true; if (S.selected) nodeEls.get(S.selected.id)?.classList.remove('sel'); S.selected = null; }

// ------------------------------------------------------------------ sidebar
function buildSidebar() {
  const count = (arr, f) => arr.reduce((m, x) => { m[f(x)] = (m[f(x)] || 0) + 1; return m; }, {});
  const kc = count(topo.nodes, n => n.kind), ec = count(topo.edges, e => e.kind);
  const kinds = $('#g-kinds');
  for (const [k, v] of Object.entries(KIND)) {
    if (!kc[k]) continue;
    const row = document.createElement('div'); row.className = 'legend';
    row.innerHTML = `<span class="swatch ${v.shape === 'sq' ? 'sq' : ''}" style="background:${v.color}"></span><span>${v.he}</span><span class="cnt">${kc[k]}</span>`;
    row.onclick = () => { if (S.kindOn.has(k)) S.kindOn.delete(k); else S.kindOn.add(k); row.classList.toggle('off', !S.kindOn.has(k)); applyFilters(); };
    kinds.append(row);
  }
  const ek = $('#g-ekinds');
  for (const [k, v] of Object.entries(EKIND)) {
    if (!ec[k]) continue;
    const row = document.createElement('div'); row.className = 'legend';
    row.innerHTML = `<span class="swatch line" style="background:${v.color}"></span><span>${v.he}</span><span class="cnt">${ec[k]}</span>`;
    row.onclick = () => { if (S.ekindOn.has(k)) S.ekindOn.delete(k); else S.ekindOn.add(k); row.classList.toggle('off', !S.ekindOn.has(k)); applyFilters(); };
    ek.append(row);
  }
  const gp = $('#g-groups');
  for (const g of topo.groups) {
    if (g.separate) continue;
    const d = document.createElement('div'); d.className = 'gp'; d.style.borderColor = g.color;
    d.innerHTML = `<b style="color:${g.color}">● מתחם מחובר מבפנים (${g.size} בניינים)</b>${g.buildings.map(b => esc(buildingById.get(b).name)).join('<br>')}`;
    d.onclick = () => focusBuilding(g.buildings[0]);
    gp.append(d);
  }
  const sep = topo.groups.filter(g => g.separate);
  const d = document.createElement('div'); d.className = 'gp separate';
  d.innerHTML = `<b style="color:#6b7280">⛔ בניינים ללא מעבר פנימי ידוע (${sep.length})</b>` + sep.map(g => `<button class="nb gbtn" style="margin:2px" data-b="${esc(g.buildings[0])}">${esc(buildingById.get(g.buildings[0]).name.split('(')[0])}</button>`).join('') +
    `<div class="small muted" style="margin-top:6px">"אין מעבר ידוע" ≠ "אין מעבר" – ייתכן שחסר מידע. ${topo.possibleLinks.length ? 'קישורים לא מאומתים: ' + topo.possibleLinks.map(l => `${esc(buildingById.get(l.from).name.split('(')[0])} ↔ ${esc(buildingById.get(l.to).name.split('(')[0])}`).join('; ') : ''}</div>`;
  gp.append(d);
  d.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => focusBuilding(b.dataset.b); });

  for (const id of ['o-labels', 'o-weights', 'o-outline', 'o-hulls', 'o-estonly']) $('#' + id).addEventListener('change', () => { S.showLabels = $('#o-labels').checked; applyFilters(); });
  $('#g-geo').addEventListener('input', e => { S.L.geo = 1 - +e.target.value; S.L.reheat(0.7); });   // RTL: the minimum is on the right = geography
  $('#g-reheat').onclick = () => { for (const n of S.L.nodes) { n.pinned = false; nodeEls.get(n.id).classList.remove('pinned'); } S.L.reheat(1); };
  $('#g-freeze').onclick = e => { S.frozen = !S.frozen; e.target.textContent = S.frozen ? 'שחרר' : 'הקפא'; };
  $('#g-fit').onclick = () => fit();
  $('#g-toggle-side').onclick = () => $('#g-side').classList.toggle('closed');
  $('#g-search').addEventListener('input', onSearch);
  $('#p-go').onclick = runPath; $('#p-clear').onclick = clearPath;
  window.addEventListener('resize', () => fit());
}

function onSearch(ev) {
  const q = norm(ev.target.value);
  matchSet = new Set();
  const out = $('#g-results'); out.innerHTML = '';
  if (q.length < 2) return;
  const hits = S.L.nodes.filter(n => norm(n.ref.label).includes(q)).sort((a, b) => b.imp - a.imp);
  hits.slice(0, 200).forEach(n => matchSet.add(n.id));
  for (const n of hits.slice(0, 12)) {
    const b = document.createElement('button');
    b.innerHTML = `${esc(n.ref.label)}<div class="sub">${esc(KIND[n.ref.kind]?.he || n.ref.kind)}${n.ref.building ? ' · ' + esc(buildingById.get(n.ref.building)?.name.split('(')[0] || '') : ''}${n.ref.floor != null ? ' · קומה ' + esc(n.ref.floor) : ''}</div>`;
    b.onclick = () => { focusNode(n); selectNode(n); };
    out.append(b);
  }
  if (hits.length > 12) out.insertAdjacentHTML('beforeend', `<div class="small muted">ועוד ${hits.length - 12} (מודגשים בגרף)</div>`);
}
const norm = s => String(s || '').toLowerCase().replace(/["'״׳\-–.,()]/g, '').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ path tool (Dijkstra on seconds)
function setEnd(which, id) {
  S[which] = id;
  $('#g-path-ab').innerHTML = `מוצא: <b>${S.A ? esc(nodeOf(S.A).ref.label) : '—'}</b><br>יעד: <b>${S.B ? esc(nodeOf(S.B).ref.label) : '—'}</b>`;
}
function clearPath() { S.A = S.B = null; S.pathNodes = new Set(); S.pathEdges = new Set(); $('#g-path-ab').innerHTML = ''; $('#g-path-out').innerHTML = ''; for (const c of nodeEls.values()) c.classList.remove('pathnode'); applyFilters(); }
function runPath() {
  if (!S.A || !S.B) { $('#g-path-out').textContent = 'בחרו מוצא ויעד.'; return; }
  const noInf = $('#p-noinferred').checked, acc = $('#p-access').checked, noRoad = $('#p-noroad').checked;
  const dist = new Map([[S.A, 0]]), prev = new Map(), done = new Set();
  const heap = [[0, S.A]];
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [d, u] = heap.shift();
    if (done.has(u)) continue; done.add(u);
    if (u === S.B) break;
    for (const { to, e } of adj.get(u)) {
      if (noInf && e.conf === 'inferred') continue;
      if (acc && (e.kind === 'stairs' || e.stairs)) continue;
      if (noRoad && (e.kind === 'road' || e.kind === 'path')) continue;
      const nd = d + e.sec;
      if (nd < (dist.get(to) ?? Infinity)) { dist.set(to, nd); prev.set(to, { from: u, e }); heap.push([nd, to]); }
    }
  }
  for (const c of nodeEls.values()) c.classList.remove('pathnode');
  S.pathNodes = new Set(); S.pathEdges = new Set();
  if (!dist.has(S.B)) { $('#g-path-out').innerHTML = '<b>לא נמצא מסלול</b> עם האפשרויות שנבחרו.'; applyFilters(); return; }
  const steps = [];
  for (let at = S.B; at !== S.A;) { const p = prev.get(at); steps.unshift({ to: at, e: p.e }); S.pathEdges.add(p.e.id); S.pathNodes.add(at); at = p.from; }
  S.pathNodes.add(S.A);
  for (const id of S.pathNodes) nodeEls.get(id)?.classList.add('pathnode');
  const total = dist.get(S.B), est = steps.filter(s => s.e.est).length;
  $('#g-path-out').innerHTML = `<b>${fmtSec(Math.round(total))}</b> · ${steps.length} קטעים · ${est} מהם משוערים${steps.some(s => s.e.conf === 'inferred') ? ' · <span class="pill inferred">כולל קישור לא מאומת</span>' : ''}<ol style="padding-inline-start:18px;margin:6px 0">${steps.map(s => `<li>${esc(nodeOf(s.to).ref.label)} <span class="muted">(${esc(EKIND[s.e.kind]?.he || s.e.kind)}, ${fmtSec(s.e.sec)}${s.e.est ? '~' : ''})</span></li>`).join('')}</ol>`;
  applyFilters();
}

window.shebaGraph = { S, focusBuilding, focusNode, selectNode, fit };   // handy in the console and for tests
init();   // last: everything above (const/let) must be initialised first
