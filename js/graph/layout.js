// Force layout that blends real geography with graph structure.
//   geo = 1 → every node sits at its real position (interior nodes crowd around their building centre)
//   geo = 0 → pure graph: edge length ∝ walking seconds, buildings stay cohesive
export const PPM = 1.8;                       // pixels per metre at geographic scale
const LAT0 = 32.0468, LON0 = 34.8445;

export function project(lat, lon) {
  return [(lon - LON0) * 111320 * Math.cos(LAT0 * Math.PI / 180) * PPM, -(lat - LAT0) * 110540 * PPM];
}

export class Layout {
  constructor(topo) {
    this.geo = 0.55;
    this.alpha = 1;
    this.running = true;
    const byBuilding = new Map();
    this.nodes = topo.nodes.map(n => {
      const o = { ref: n, id: n.id, building: n.building || null, imp: n.imp ?? 0.1, vx: 0, vy: 0, pinned: false, ax: null, ay: null };
      o.r = 3 + 12 * o.imp;
      if (n.lat != null) { const [x, y] = project(n.lat, n.lon); o.ax = x; o.ay = y; o.exact = n.geo === 'exact'; o.inside = n.geo === 'layout'; }   // 'layout' = schematic position inside the building footprint
      if (n.building) { if (!byBuilding.has(n.building)) byBuilding.set(n.building, []); byBuilding.get(n.building).push(o); }
      return o;
    });
    this.byId = new Map(this.nodes.map(n => [n.id, n]));
    // buildings without any known position are parked in a "dock" below the campus
    const placed = this.nodes.filter(n => n.ax != null);
    const xs = placed.map(n => n.ax), ys = placed.map(n => n.ay);
    const xmin = Math.min(...xs), ymax = Math.max(...ys);
    let dock = 0;
    this.unplacedBuildings = [];
    for (const [b, list] of byBuilding) {
      if (list.some(n => n.ax != null)) continue;
      const ax = xmin + 120 + dock++ * 260, ay = ymax + 220;
      this.unplacedBuildings.push(b);
      for (const n of list) { n.ax = ax; n.ay = ay; n.exact = false; n.docked = true; }
    }
    const rnd = mulberry(7);
    for (const n of this.nodes) {
      if (n.ax == null) { n.ax = 0; n.ay = 0; }
      const spread = n.exact ? 4 : 28 + Math.sqrt((byBuilding.get(n.building) || []).length) * 12;
      n.x = n.ax + (rnd() - 0.5) * spread * 2;
      n.y = n.ay + (rnd() - 0.5) * spread * 2;
    }
    this.edges = topo.edges.map(e => {
      const a = this.byId.get(e.a), b = this.byId.get(e.b);
      return { ref: e, a, b, len: e.m ? e.m * PPM * 0.9 : e.indoor ? Math.max(26, e.sec * 2.4) : Math.max(18, e.sec * 1.9) };
    });
    this.buildings = byBuilding;
    this.bounds = { xmin, ymax };
  }

  reheat(a = 1) { this.alpha = Math.max(this.alpha, a); this.running = true; }

  tick(visible) {
    if (!this.running) return false;
    const N = this.nodes, a = this.alpha, geo = this.geo;
    const vis = n => visible(n);
    // repulsion (spatial hash)
    const CELL = 110, grid = new Map();
    for (const n of N) { if (!vis(n)) continue; const k = Math.floor(n.x / CELL) + ',' + Math.floor(n.y / CELL); (grid.get(k) || grid.set(k, []).get(k)).push(n); }
    for (const n of N) {
      if (!vis(n)) continue;
      const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
      for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const cell = grid.get(gx + ',' + gy); if (!cell) continue;
        for (const m of cell) {
          if (m === n) continue;
          let dx = n.x - m.x, dy = n.y - m.y, d2 = dx * dx + dy * dy;
          if (d2 > CELL * CELL) continue;
          if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.5; }
          const d = Math.sqrt(d2), min = n.r + m.r + 3;
          let f = 16 * (n.r + m.r + 8) / (d2 + 30);
          if (d < min) f += (min - d) * 0.35;
          n.vx += dx / d * f * a; n.vy += dy / d * f * a;
        }
      }
    }
    // springs
    for (const e of this.edges) {
      if (!vis(e.a) || !vis(e.b)) continue;
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const k = e.ref.indoor ? 0.045 : 0.03 + 0.03 * geo;
      const f = (d - e.len) / d * k * a;
      e.a.vx += dx * f; e.a.vy += dy * f; e.b.vx -= dx * f; e.b.vy -= dy * f;
    }
    // geographic anchors
    const ga = (0.004 + 0.1 * geo * geo) * a;
    for (const n of N) { if (!vis(n)) continue; const k = n.docked ? 0.08 * a : n.exact ? ga * 1.6 : n.inside ? ga * 0.7 : ga * 0.3; n.vx += (n.ax - n.x) * k; n.vy += (n.ay - n.y) * k; }
    // building cohesion
    for (const list of this.buildings.values()) {
      let cx = 0, cy = 0, c = 0;
      for (const n of list) if (vis(n)) { cx += n.x; cy += n.y; c++; }
      if (c < 2) continue;
      cx /= c; cy /= c;
      const k = (0.012 + 0.02 * (1 - geo)) * a;
      for (const n of list) if (vis(n)) { n.vx += (cx - n.x) * k; n.vy += (cy - n.y) * k; }
    }
    // integrate
    for (const n of N) {
      if (!vis(n)) continue;
      if (n.pinned) { n.vx = n.vy = 0; continue; }
      n.vx *= 0.58; n.vy *= 0.58;
      const sp = Math.hypot(n.vx, n.vy); if (sp > 28) { n.vx *= 28 / sp; n.vy *= 28 / sp; }
      n.x += n.vx; n.y += n.vy;
    }
    this.alpha *= 0.982;
    if (this.alpha < 0.012) this.running = false;
    return true;
  }
}

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
