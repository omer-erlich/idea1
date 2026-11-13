// Walking navigation (Google-Maps style): instruction banner on top, map, bottom bar with remaining time.
// Outdoor steps advance automatically when you get close; indoor steps advance by tapping (GPS is unreliable inside).
import { $ } from '../util.js';
import { createMap, drawRoute, gpsIcon } from './map.js';
import { haversine } from '../engine/geo.js';

const ARRIVE_M = 15;          // distance to a step's end point that counts as "reached"
const MAX_ACCURACY_M = 35;    // ignore GPS fixes worse than this for auto-advance
const M_PER_MIN = 66;         // 1.1 m/s

let W = null;

function iconFor(s) {
  const t = s.text || '';
  if (s.arrival) return '🏁';
  if (/מעלית/.test(t)) return '🛗';
  if (/מדרגות/.test(t)) return '🪜';
  if (/הסתובבו/.test(t)) return '↩️';
  if (/שמאלה/.test(t)) return '⬅️';
  if (/ימינה/.test(t)) return '➡️';
  if (/היכנסו|דלת|כניסה/.test(t)) return '🚪';
  return s.indoor ? '🏢' : '⬆️';
}

export function startWalk(option, { data, onExit }) {
  stopWalk();
  W = { option, steps: option.steps, i: 0, map: null, gps: null, acc: null, watch: null, wake: null, stepMarker: null, onExit, lastFix: null, follow: true };
  const L = window.L;
  W.map = createMap($('#walk-map'), { data, zoom: 18, zoomControl: false });
  drawRoute(W.map, option);
  W.stepMarker = L.circleMarker([0, 0], { radius: 11, color: '#ffbf00', weight: 4, fillOpacity: 0 }).addTo(W.map);
  W.map.on('dragstart', () => { W.follow = false; $('#walk-recenter').hidden = false; });
  setTimeout(() => W?.map.invalidateSize(), 60);

  $('#walk-prev').onclick = () => go(W.i - 1, true);
  $('#walk-next').onclick = () => (W.i >= W.steps.length - 1 ? exit() : go(W.i + 1, true));
  $('#walk-exit').onclick = exit;
  $('#walk-recenter').hidden = true;
  $('#walk-recenter').onclick = () => { W.follow = true; $('#walk-recenter').hidden = true; const t = W.lastFix || stepPoint(); if (t) W.map.panTo(t); };
  document.addEventListener('keydown', onKey);

  if ('geolocation' in navigator) {
    W.watch = navigator.geolocation.watchPosition(onFix, onGpsError, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    $('#walk-gps').textContent = 'מחפש מיקום GPS…';
  } else $('#walk-gps').textContent = 'אין GPS במכשיר – התקדמו בלחיצה על "הבא".';
  keepAwake();
  go(0, false);
}

const stepPoint = () => { const s = W.steps[W.i]; return s?.lat != null ? [s.lat, s.lon] : null; };
function onKey(e) { if (e.key === 'ArrowLeft') $('#walk-next').click(); else if (e.key === 'ArrowRight') $('#walk-prev').click(); else if (e.key === 'Escape') exit(); }

function go(i, manual) {
  if (!W) return;
  W.i = Math.max(0, Math.min(W.steps.length - 1, i));
  const s = W.steps[W.i];
  $('#walk-icon').textContent = iconFor(s);
  $('#walk-text').textContent = s.text;
  $('#walk-progress').textContent = `שלב ${W.i + 1} מתוך ${W.steps.length}`;
  const left = W.steps.slice(W.i).reduce((a, x) => a + (x.meters || 0), 0);
  $('#walk-remaining').textContent = s.arrival || (left === 0 && W.i === W.steps.length - 1) ? 'הגעתם 🎉' : `עוד כ-${Math.max(1, Math.round(left / M_PER_MIN))} דק' · ${left} מ'`;
  const ph = $('#walk-photo');
  if (s.photo) { ph.src = s.photo; ph.hidden = false; ph.alt = 'תמונה של המקום: ' + s.text; } else { ph.hidden = true; ph.removeAttribute('src'); }
  $('#walk-mode').textContent = s.arrival ? '🏁 הגעתם' : s.indoor ? '🏢 בפנים · לחצו "הבא"' : '🌤 בחוץ · מתקדם לבד לפי GPS';
  $('#walk-prev').disabled = W.i === 0;
  $('#walk-next').textContent = W.i >= W.steps.length - 1 ? 'סיום ✓' : 'הבא ›';
  if (s.lat != null) {
    W.stepMarker.setLatLng([s.lat, s.lon]);
    if (manual || !W.lastFix) W.map.panTo([s.lat, s.lon], { animate: true });
  }
  setTimeout(() => W?.map.invalidateSize(), 0);   // banner height changes with the text / photo
  if (!manual && navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(120);
}

function onFix(pos) {
  if (!W) return;
  const { latitude: lat, longitude: lon, accuracy } = pos.coords;
  const L = window.L;
  const first = !W.lastFix;
  W.lastFix = [lat, lon];
  if (!W.gps) { W.gps = L.marker([lat, lon], { icon: gpsIcon(), interactive: false, keyboard: false }).addTo(W.map); W.acc = L.circle([lat, lon], { radius: accuracy, weight: 1, fillOpacity: 0.1 }).addTo(W.map); }
  else { W.gps.setLatLng([lat, lon]); W.acc.setLatLng([lat, lon]).setRadius(accuracy); }
  if (W.follow && (first || accuracy < 60)) W.map.panTo([lat, lon], { animate: true });
  const s = W.steps[W.i];
  const far = s.lat != null ? Math.round(haversine([lat, lon], [s.lat, s.lon])) : null;
  $('#walk-gps').textContent = `דיוק GPS: ±${Math.round(accuracy)} מ'${far != null && !s.indoor ? ` · עוד כ-${far} מ' לנקודה הבאה` : ''}`;
  // auto-advance outdoors only
  if (!s.indoor && !s.arrival && s.lat != null && accuracy <= MAX_ACCURACY_M && far <= Math.max(ARRIVE_M, accuracy * 0.6)) go(W.i + 1, false);
}

function onGpsError(err) {
  $('#walk-gps').textContent = err.code === 1 ? 'אין הרשאת מיקום – אפשר להתקדם בלחיצה על "הבא".' : 'אין קליטת GPS כרגע – התקדמו בלחיצה על "הבא".';
}

async function keepAwake() {
  try { if ('wakeLock' in navigator) W.wake = await navigator.wakeLock.request('screen'); } catch { /* optional */ }
}

function exit() { const cb = W?.onExit; stopWalk(); cb?.(); }

export function stopWalk() {
  if (!W) return;
  if (W.watch != null) navigator.geolocation.clearWatch(W.watch);
  try { W.wake?.release(); } catch { /* ignore */ }
  document.removeEventListener('keydown', onKey);
  W.map.remove();
  W = null;
}
