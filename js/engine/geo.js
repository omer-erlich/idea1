// Small geometry helpers shared by the app, the import script and the tests.
// Coordinates are [lat, lon] arrays everywhere.

const R = 6371008.8;
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

export function haversine(a, b) {
  const dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function polylineLength(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i]);
  return d;
}

/** Initial bearing a->b in degrees, 0 = north, clockwise. */
export function bearing(a, b) {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Signed turn angle in degrees from heading h1 to h2: positive = right, negative = left. */
export function turnAngle(h1, h2) {
  let d = h2 - h1;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

// Local planar projection (metres) — accurate enough over a 2 km campus.
export function makeProjection(lat0) {
  const kx = 111320 * Math.cos(toRad(lat0)), ky = 110540;
  return {
    fwd: ([lat, lon]) => [lon * kx, lat * ky],
    inv: ([x, y]) => [y / ky, x / kx],
  };
}

const P = makeProjection(32.047);

/** Closest point on segment a-b to p. Returns {point, t, dist}. */
export function projectOnSegment(p, a, b) {
  const [px, py] = P.fwd(p), [ax, ay] = P.fwd(a), [bx, by] = P.fwd(b);
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const q = P.inv([ax + t * dx, ay + t * dy]);
  return { point: q, t, dist: haversine(p, q) };
}

/** Ray-casting point-in-polygon; polygon is [[lat,lon],...]. */
export function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j];
    if (((yi > p[0]) !== (yj > p[0])) && (p[1] < (xj - xi) * (p[0] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

/** Distance from p to a polyline (metres). */
export function distanceToPolyline(p, line) {
  if (line.length === 1) return haversine(p, line[0]);
  let best = Infinity;
  for (let i = 1; i < line.length; i++) best = Math.min(best, projectOnSegment(p, line[i - 1], line[i]).dist);
  return best;
}

export function centroid(pts) {
  let la = 0, lo = 0;
  for (const [a, b] of pts) { la += a; lo += b; }
  return [la / pts.length, lo / pts.length];
}

export function round6(p) { return [Math.round(p[0] * 1e6) / 1e6, Math.round(p[1] * 1e6) / 1e6]; }

/** Douglas-Peucker simplification in metres. */
export function simplify(pts, tol = 1.0) {
  if (pts.length < 3) return pts.slice();
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = projectOnSegment(pts[i], pts[s], pts[e]).dist;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = true; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
