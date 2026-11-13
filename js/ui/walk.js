// Walking navigation (Google-Maps style): instruction banner on top, map, bottom bar with remaining time.
// Outdoors: steps advance automatically by GPS. Indoors GPS is unreliable, so each step asks the user to CONFIRM
// ("do you see the coffee cart?", "which floor are you on?") and offers "I'm not sure where I am" → re-localise + re-route.
import { $, esc } from '../util.js';
import { t } from '../strings.js';
import { createMap, drawLegs, gpsIcon } from './map.js';
import { haversine } from '../engine/geo.js';

const ARRIVE_M = 15;          // distance to a step's end point that counts as "reached"
const MAX_ACCURACY_M = 35;    // ignore GPS fixes worse than this for auto-advance

let W = null;

function iconFor(s) {
  const x = s.text || '';
  if (s.arrival) return '🏁';
  if (s.kind === 'elevator' || /מעלית|מעליות/.test(x) && /לקומה/.test(x)) return '🛗';
  if (s.kind === 'stairs' || /מדרגות/.test(x)) return '🪜';
  if (/הסתובבו/.test(x)) return '↩️';
  if (s.kind === 'enter' || /היכנסו/.test(x)) return '🚪';
  if (s.kind === 'passage') return '↔️';
  if (/שמאלה/.test(x) && !s.indoor) return '⬅️';
  if (/ימינה/.test(x) && !s.indoor) return '➡️';
  return s.indoor ? '🏢' : '⬆️';
}

export function startWalk(option, { data, onExit, router, onRelocate, startIndex = 0 }) {
  stopWalk();
  W = { option, steps: option.steps, i: 0, map: null, gps: null, acc: null, watch: null, wake: null, stepMarker: null, onExit, lastFix: null, follow: true, router, onRelocate };
  const L = window.L;
  W.map = createMap($('#walk-map'), { data, zoom: 18, zoomControl: false });
  drawLegs(W.map, option);
  W.stepMarker = L.circleMarker([0, 0], { radius: 11, color: '#ffbf00', weight: 4, fillOpacity: 0 }).addTo(W.map);
  W.map.on('dragstart', () => { W.follow = false; $('#walk-recenter').hidden = false; });
  setTimeout(() => W?.map.invalidateSize(), 60);

  $('#walk-prev').onclick = () => go(W.i - 1, true);
  $('#walk-next').onclick = () => advance();
  $('#walk-exit').onclick = exit;
  $('#walk-recenter').hidden = true;
  $('#walk-recenter').onclick = () => { W.follow = true; $('#walk-recenter').hidden = true; const tt = W.lastFix || stepPoint(); if (tt) W.map.panTo(tt); };
  document.addEventListener('keydown', onKey);

  if ('geolocation' in navigator) {
    W.watch = navigator.geolocation.watchPosition(onFix, onGpsError, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    $('#walk-gps').textContent = 'מחפש מיקום GPS…';
  } else $('#walk-gps').textContent = 'אין GPS במכשיר – התקדמו בלחיצה על "הבא".';
  keepAwake();
  go(startIndex, false);
}

const stepPoint = () => { const s = W.steps[W.i]; return s?.lat != null ? [s.lat, s.lon] : null; };
function onKey(e) { if (e.key === 'ArrowLeft') $('#walk-next').click(); else if (e.key === 'ArrowRight') $('#walk-prev').click(); else if (e.key === 'Escape') exit(); }
function advance() { if (!W) return; if (W.i >= W.steps.length - 1) exit(); else go(W.i + 1, true); }

function go(i, manual) {
  if (!W) return;
  W.i = Math.max(0, Math.min(W.steps.length - 1, i));
  const s = W.steps[W.i];
  $('#walk-icon').textContent = iconFor(s);
  $('#walk-text').textContent = s.text;
  $('#walk-progress').textContent = `שלב ${W.i + 1} מתוך ${W.steps.length}`;
  const leftSec = W.steps.slice(W.i).reduce((a, x) => a + (x.sec ?? (x.meters || 0) / 1.1), 0);
  $('#walk-remaining').textContent = s.arrival ? 'הגעתם 🎉' : `עוד כ-${Math.max(1, Math.round(leftSec / 60))} דק'`;
  const ph = $('#walk-photo');
  if (s.photo) { ph.src = s.photo; ph.hidden = false; ph.alt = 'תמונה של המקום: ' + s.text; } else { ph.hidden = true; ph.removeAttribute('src'); }
  $('#walk-mode').textContent = s.arrival ? '🏁 הגעתם' : s.indoor ? '🏢 בפנים · אשרו כל שלב' : '🌤 בחוץ · מתקדם לבד';
  $('#walk-prev').disabled = W.i === 0;
  $('#walk-next').textContent = W.i >= W.steps.length - 1 ? 'סיום ✓' : 'הבא ›';
  renderConfirm(s);
  if (s.lat != null) {
    W.stepMarker.setLatLng([s.lat, s.lon]);
    if (manual || !W.lastFix) W.map.panTo([s.lat, s.lon], { animate: true });
  }
  setTimeout(() => W?.map.invalidateSize(), 0);   // banner height changes with the text / photo
  if (!manual && navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(120);
}

/** Live-view style prompt under the instruction. */
function renderConfirm(s) {
  const box = $('#walk-confirm');
  if (!box) return;
  if (s.arrival) { box.hidden = true; box.innerHTML = ''; return; }
  const lost = `<button class="link-btn" data-wc="lost">${t('lostLink')}</button>`;
  let html = '';
  if (s.ask === 'floor' && W.router && s.building) {
    const floors = W.router.floorsOf(s.building);
    html = `<p class="wc-q">${t('floorQ')} <span class="muted small">${t('floorExpected', { floor: esc(s.expectFloor) })}</span></p>
      <div class="seg wc-floors">${floors.map(f => `<button type="button" data-wc="floor" data-f="${esc(f)}" aria-pressed="${f === s.expectFloor}">${esc(f)}</button>`).join('')}</div>${lost}`;
  } else if (s.ask === 'arrive') {
    html = `<p class="wc-q">${t('arriveQ')}</p><div class="wc-btns"><button class="btn btn-primary" data-wc="yes">${t('arriveYes')}</button></div>${lost}`;
  } else if (s.ask === 'see') {
    html = `<p class="wc-q">${t('seeQ', { landmark: esc(s.landmark || '') })}</p><div class="wc-btns"><button class="btn btn-primary" data-wc="yes">${t('seeYes')}</button><button class="btn btn-secondary" data-wc="no">${t('seeNo')}</button></div>${lost}`;
  } else if (!s.indoor) html = `<div class="wc-foot">${lost}</div>`;
  box.hidden = !html;
  box.innerHTML = html;
  box.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const w = b.dataset.wc;
    if (w === 'yes') advance();
    else if (w === 'no' || w === 'lost') relocate({ building: s.building, floor: s.floor, reason: w });
    else if (w === 'floor') {
      if (b.dataset.f === s.expectFloor) advance();
      else relocate({ building: s.building, floor: b.dataset.f, reason: 'floor-mismatch' });
    }
  };
}

async function relocate(ctx) {
  if (!W?.onRelocate) return;
  const cb = W.onRelocate;
  const full = { ...ctx, index: W.i, option: W.option };
  stopWalkKeepScreen();
  await cb(full);
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
  const insideBuilding = W.router?.buildingAt(lat, lon, 0).some(b => b.inside);
  $('#walk-gps').textContent = insideBuilding || (s.indoor && accuracy > MAX_ACCURACY_M)
    ? t('gpsIndoorHint')
    : `דיוק GPS: ±${Math.round(accuracy)} מ'${far != null && !s.indoor ? ` · עוד כ-${far} מ' לנקודה הבאה` : ''}`;
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

function stopWalkKeepScreen() { stopWalk(); }

export function stopWalk() {
  if (!W) return;
  if (W.watch != null) navigator.geolocation.clearWatch(W.watch);
  try { W.wake?.release(); } catch { /* ignore */ }
  document.removeEventListener('keydown', onKey);
  W.map.remove();
  W = null;
}
