// Leaflet helpers. Leaflet is loaded as a classic script (window.L).
const CAMPUS_CENTER = [32.0468, 34.8445];

export function createMap(el, { zoom = 17, center = CAMPUS_CENTER, data, zoomControl = true } = {}) {
  const L = window.L;
  const map = L.map(el, { zoomControl, attributionControl: true, preferCanvas: true, tap: true }).setView(center, zoom);
  if (!zoomControl) map.attributionControl.setPosition('topleft');
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // Offline fallback / extra clarity: our own building outlines are always drawn (vector, no network needed).
  if (data?.buildings) {
    const g = L.layerGroup();
    for (const b of data.buildings) {
      if (!b.outline || b.outline.length < 3) continue;
      L.polygon(b.outline, { color: '#5b6573', weight: 1, fillColor: '#9aa5b4', fillOpacity: b.name ? 0.35 : 0.18, interactive: false }).addTo(g);
    }
    g.addTo(map);
  }
  tiles.on('tileerror', () => el.classList.add('tiles-offline'));
  return map;
}

export function pinIcon(emoji, label) {
  return window.L.divIcon({ className: '', html: `<div class="pin" role="img" aria-label="${label || ''}">${emoji}</div>`, iconSize: [26, 26], iconAnchor: [13, 24] });
}

export function gpsIcon() {
  return window.L.divIcon({ className: '', html: '<div class="gps-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
}

/** Draw a route option; returns a layer group. Outdoor = solid, indoor = dashed. */
export function drawRoute(map, option, { color = '#0b5cab', fit = true } = {}) {
  const L = window.L;
  const g = L.layerGroup().addTo(map);
  if (option.coords?.length) {
    const path = option.path;
    // split by indoor/outdoor along edges for styling
    let i = 0;
    for (const u of path?.edges || []) {
      const n = (u.edge.polyline?.length || 2) - 1;
      const seg = option.coords.slice(i, i + n + 1);
      i += n;
      if (seg.length >= 2) L.polyline(seg, { color, weight: 6, opacity: .9, dashArray: u.edge.indoor ? '2 10' : null, lineCap: 'round' }).addTo(g);
    }
    if (!path) L.polyline(option.coords, { color, weight: 6 }).addTo(g);
  }
  const p = option.parking;
  if (p?.lat != null) L.marker([p.lat, p.lon], { icon: pinIcon('🅿️', 'חניה'), keyboard: false }).addTo(g);
  const d = option.destination;
  if (d?.lat != null) L.marker([d.lat, d.lon], { icon: pinIcon('🏁', 'יעד'), keyboard: false }).addTo(g);
  const e = option.entrance;
  if (e?.lat != null) L.marker([e.lat, e.lon], { icon: pinIcon('🚪', 'כניסה'), keyboard: false }).addTo(g);
  const pts = [...(option.coords || [])];
  if (p?.lat != null) pts.push([p.lat, p.lon]);
  if (d?.lat != null) pts.push([d.lat, d.lon]);
  g._bounds = pts.length ? L.latLngBounds(pts) : null;   // used by the caller to fit with sheet-aware padding
  if (fit && g._bounds) map.fitBounds(g._bounds.pad(0.15), { maxZoom: 18 });
  return g;
}
