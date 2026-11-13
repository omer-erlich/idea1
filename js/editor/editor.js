// ?edit=1 – submit a tip (anyone) / on-site editor with JSON export (owner).
import { $, $$, esc, toast, store } from '../util.js';
import { createMap, pinIcon } from '../ui/map.js';
import { backendEnabled, CONFIG } from '../config.js';
import { submitTip, uploadPendingPhoto } from '../backend.js';
import { safetyZoneAt, textFlags, SAFETY_KINDS } from '../engine/safety.js';
import { haversine } from '../engine/geo.js';
import { applyTips } from '../data.js';
import { formatData } from '../engine/format.js';
import { compressImage, blobToDataUrl, dataUrlToBlob } from './photo.js';
import { windowsEditor, seg, bindSeg } from './forms.js';

const KINDS = [
  ['parking', '🅿️ חניה'], ['entrance', '🚪 כניסה'], ['path', '🚶 מסלול / קיצור'],
  ['rule', '🕒 שעות לחניה'], ['destination', '🏁 יעד'], ['correction', '✏️ תיקון'],
];
const TYPE_OPTS = [['lot', 'מגרש'], ['garage', 'חניון מקורה'], ['street', 'ברחוב']];
const LIMITS = { name: 80, note: 300, step: 200, text: 1000 };

const E = { base: null, kind: 'parking', point: null, points: [], photo: null, map: null, layer: null, refLayer: null, rules: null, hours: null, existing: null };

export function start({ base, params }) {
  E.base = base;
  E.kind = KINDS.some(k => k[0] === params.get('kind')) ? params.get('kind') : 'parking';
  const root = $('#screen-editor');
  $('#screen-picker').hidden = true; root.hidden = false;
  $('#btn-home').hidden = false;
  $('#btn-home').onclick = () => { location.href = location.pathname; };
  $('#title').textContent = 'הוספת טיפ';
  root.innerHTML = `
    <h2>מכירים דרך טובה יותר?</h2>
    <p>חניה קרובה, דלת פתוחה לקהל, קיצור דרך או תיקון – ספרו לנו. <b>הטיפ יופיע באתר רק אחרי בדיקה.</b> לא נאסף שום מידע אישי.</p>
    ${backendEnabled() ? '' : '<p class="notice">השליחה לשרת עוד לא הוגדרה באתר הזה. אפשר לשמור טיוטה במכשיר ולייצא אותה (למטה).</p>'}
    <div id="ed-map" class="map" style="height:45dvh"></div>
    <div class="actions"><button type="button" id="ed-gps" class="btn btn-secondary btn-wide">📍 השתמש במיקום שלי</button></div>
    <p id="ed-point" class="muted small" aria-live="polite"></p>
    ${seg('kind', KINDS, E.kind)}
    <form id="ed-form" class="form" novalidate autocomplete="off" style="margin-top:12px">
      <div id="ed-fields" class="form"></div>
      <label class="hp" aria-hidden="true">אתר<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <div id="ed-photo-wrap">
        <label>תמונה (לא חובה)<input type="file" id="ed-photo" accept="image/*" capture="environment"></label>
        <p class="small muted">📷 בלי פנים של אנשים ובלי לוחיות רישוי. התמונה מוקטנת במכשיר ונמחק ממנה מידע המיקום של המצלמה.</p>
        <img id="ed-photo-prev" alt="תצוגה מקדימה" style="max-width:100%;border-radius:10px" hidden>
      </div>
      <div id="ed-safety" class="danger-box">
        <label class="toggle"><input type="checkbox" id="ed-safe"> <span>אני מאשר/ת: זה <b>לא</b> נתיב חירום או אמבולנסים, <b>לא</b> חניית נכים ו<b>לא</b> דרך גישה לכבאות.</span></label>
      </div>
      <p id="ed-errors" class="flag" aria-live="assertive"></p>
      <div class="actions">
        ${backendEnabled() ? '<button type="submit" class="btn btn-primary btn-wide btn-big">שליחה לבדיקה</button>' : ''}
        <button type="button" id="ed-draft" class="btn btn-secondary btn-wide">שמירה כטיוטה במכשיר</button>
      </div>
    </form>
    <details id="ed-export" class="card" style="margin-top:16px">
      <summary><b>טיוטות וייצוא JSON</b> (לבעל האתר)</summary>
      <div id="ed-drafts"></div>
      <label class="toggle"><input type="checkbox" id="ed-verified"> <span>בדקתי את זה בשטח היום (יסומן "אומת")</span></label>
      <div class="actions">
        <button type="button" id="ed-dl" class="btn btn-primary btn-wide">⬇️ הורדת sheba.json מעודכן</button>
        <button type="button" id="ed-copy" class="btn btn-secondary">📋 העתקת הטיוטות</button>
        <button type="button" id="ed-clear" class="btn btn-secondary">🗑 מחיקת טיוטות</button>
      </div>
      <p class="small muted">את הקובץ שומרים במקום data/sheba.json במאגר ועושים commit. תמונות יורדות כקבצים נפרדים לתיקייה photos/.</p>
    </details>
    <details class="card"><summary>מה עדיין חסר? (TODO)</summary><ul id="ed-todo" class="small"></ul></details>`;

  E.map = createMap($('#ed-map'), { data: base, zoom: 17 });
  E.layer = window.L.layerGroup().addTo(E.map);
  drawReference();
  E.map.on('click', ev => addPoint([ev.latlng.lat, ev.latlng.lng]));
  $('#ed-gps').onclick = useGps;
  bindSeg(root, 'kind', k => { E.kind = k; E.point = null; E.points = []; E.existing = null; renderFields(); redraw(); });
  $('#ed-photo').onchange = onPhoto;
  $('#ed-form').onsubmit = ev => { ev.preventDefault(); send(); };
  $('#ed-draft').onclick = saveDraft;
  $('#ed-dl').onclick = exportJson;
  $('#ed-copy').onclick = () => { navigator.clipboard?.writeText(JSON.stringify(store.get('drafts', []), null, 1)).then(() => toast('הועתק'), () => toast('ההעתקה נכשלה')); };
  $('#ed-clear').onclick = () => { if (confirm('למחוק את כל הטיוטות?')) { store.set('drafts', []); renderDrafts(); } };
  renderFields();
  renderDrafts();
  renderTodo();
  // deep links: ?edit=1&kind=correction&target=p-central / &id=p-mri-night
  const target = params.get('target') || params.get('id');
  if (target) { const sel = $('#ed-existing') || $('#ed-target'); if (sel) { sel.value = target; sel.dispatchEvent(new Event('change')); } }
}

// ---------------------------------------------------------------- map
function drawReference() {
  const L = window.L;
  E.refLayer = L.layerGroup().addTo(E.map);
  for (const e of E.base.graph.edges) {
    if (e.prov?.source === 'generated') continue;
    const a = node(e.from), b = node(e.to); if (!a || !b) continue;
    L.polyline(e.polyline || [[a.lat, a.lon], [b.lat, b.lon]], { color: e.indoor ? '#7c3aed' : '#16a34a', weight: 2, opacity: .55, dashArray: e.indoor ? '3 5' : null, interactive: false }).addTo(E.refLayer);
  }
  for (const z of E.base.safetyZones || []) {
    const style = { color: '#dc2626', weight: 2, fillOpacity: .25, interactive: false };
    if (z.polygon) L.polygon(z.polygon, style).addTo(E.refLayer);
    else if (z.line) L.polyline(z.line, { ...style, weight: 10, opacity: .35 }).addTo(E.refLayer);
    else if (z.center) L.circle(z.center, { ...style, radius: z.radius || 10 }).addTo(E.refLayer);
  }
  for (const p of E.base.parkings) if (p.lat != null) L.marker([p.lat, p.lon], { icon: pinIcon('🅿️', p.name), title: p.name || '' }).on('click', () => pickExisting('parking', p.id)).addTo(E.refLayer);
  for (const en of E.base.entrances) if (en.lat != null) L.marker([en.lat, en.lon], { icon: pinIcon(en.publicAccess === 'yes' ? '🚪' : '❔', en.name), title: `${en.name} (${en.publicAccess})` }).on('click', () => pickExisting('entrance', en.id)).addTo(E.refLayer);
}
const node = id => E._nodes?.get(id) || (E._nodes = new Map(E.base.graph.nodes.map(n => [n.id, n]))).get(id);

function pickExisting(kind, id) {
  if (E.kind !== kind && !(E.kind === 'rule' && kind === 'parking') && E.kind !== 'correction') return;
  const sel = $('#ed-existing') || $('#ed-target') || $('#ed-parking');
  if (sel) { sel.value = id; sel.dispatchEvent(new Event('change')); }
}

function addPoint(p, accuracy) {
  if (E.kind === 'path') {
    // snap to an existing graph node within 8 m so the shortcut joins the network
    let snap = null, best = 8;
    for (const n of E.base.graph.nodes) { const d = haversine(p, [n.lat, n.lon]); if (d < best) { best = d; snap = n; } }
    E.points.push({ lat: snap ? snap.lat : p[0], lon: snap ? snap.lon : p[1], nodeId: snap?.id, indoor: false, stairs: false, note: '' });
    renderPathPoints();
  } else E.point = p;
  redraw(accuracy);
}

function redraw(accuracy) {
  const L = window.L;
  E.layer.clearLayers();
  if (E.kind === 'path' && E.points.length) {
    L.polyline(E.points.map(x => [x.lat, x.lon]), { color: '#0b5cab', weight: 5 }).addTo(E.layer);
    E.points.forEach((x, i) => L.marker([x.lat, x.lon], { icon: L.divIcon({ className: '', html: `<div class="num-pin">${i + 1}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(E.layer));
    $('#ed-point').textContent = `${E.points.length} נקודות במסלול. הקישו על המפה כדי להוסיף נקודה.`;
  } else if (E.point) {
    L.marker(E.point, { icon: pinIcon('📌', 'המיקום שנבחר') }).addTo(E.layer);
    if (accuracy) L.circle(E.point, { radius: accuracy, weight: 1, fillOpacity: .1 }).addTo(E.layer);
    const z = safetyZoneAt(E.point, E.base.safetyZones);
    $('#ed-point').innerHTML = `מיקום: ${E.point[0].toFixed(6)}, ${E.point[1].toFixed(6)}${accuracy ? ` (±${Math.round(accuracy)} מ')` : ''}${z ? ` <span class="flag">⚠️ בתוך אזור ${esc(SAFETY_KINDS[z.kind] || z.kind)}</span>` : ''}`;
  } else $('#ed-point').textContent = E.kind === 'path' ? 'הקישו על המפה לפי סדר ההליכה (מהחניה ליעד).' : 'הקישו על המפה או השתמשו במיקום שלכם.';
}

function useGps() {
  if (!navigator.geolocation) return toast('אין GPS במכשיר');
  toast('מאתר מיקום…');
  navigator.geolocation.getCurrentPosition(pos => {
    const p = [pos.coords.latitude, pos.coords.longitude];
    addPoint(p, pos.coords.accuracy);
    E.map.setView(p, 19);
    if (pos.coords.accuracy > 25) toast(`הדיוק נמוך (±${Math.round(pos.coords.accuracy)} מ') – אפשר לתקן בהקשה על המפה`, 5000);
  }, () => toast('לא הצלחנו לקבל מיקום. הקישו על המפה.'), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
}

// ---------------------------------------------------------------- fields
const opt = (v, l, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(l)}</option>`;
const isTodo = r => r.lat == null || r.prov?.todo;
function recordOptions(list, label) {
  return [...list].sort((a, b) => isTodo(b) - isTodo(a) || (a.name || '').localeCompare(b.name || '', 'he'))
    .map(r => opt(r.id, `${isTodo(r) ? '❗ ' : ''}${r.name || r.id}${label ? ' ' + label(r) : ''}`)).join('');
}
function buildingOptions(sel) {
  return opt('', '—') + E.base.buildings.filter(b => b.name).sort((a, b) => a.name.localeCompare(b.name, 'he')).map(b => opt(b.id, b.name, b.id === sel)).join('');
}

function renderFields() {
  const f = $('#ed-fields');
  const k = E.kind;
  $('#ed-safety').hidden = !['parking', 'entrance', 'path'].includes(k);
  $('#ed-photo-wrap').hidden = k === 'rule';
  if (k === 'parking') {
    f.innerHTML = `<label>חניה קיימת או חדשה<select id="ed-existing">${opt('', '➕ חניה חדשה')}${recordOptions(E.base.parkings)}</select></label>
      <label>שם קצר<input type="text" id="ed-name" maxlength="${LIMITS.name}" placeholder="למשל: מגרש קטן מאחורי ה-MRI"></label>
      <label>סוג${seg('ptype', TYPE_OPTS, 'lot')}</label>
      <fieldset class="form"><legend><b>מתי מותר לחנות שם?</b> (כלל ראשון שמתאים קובע)</legend><div id="ed-rules"></div></fieldset>
      <label>הערה<textarea id="ed-note" maxlength="${LIMITS.note}" placeholder="שילוט, מחיר, מתי מתמלא…"></textarea></label>`;
    bindSeg(f, 'ptype');
    E.rules = windowsEditor($('#ed-rules'), [], { withStatus: true });
    $('#ed-existing').onchange = () => fillExisting('parking');
  } else if (k === 'entrance') {
    f.innerHTML = `<label>כניסה קיימת או חדשה<select id="ed-existing">${opt('', '➕ כניסה חדשה')}${recordOptions(E.base.entrances, r => r.publicAccess === 'yes' ? '' : '(לא מאומתת)')}</select></label>
      <label>שם / תיאור קצר<input type="text" id="ed-name" maxlength="${LIMITS.name}" placeholder="למשל: דלת אפורה משמאל לרמפת הפריקה"></label>
      <label>בניין<select id="ed-building">${buildingOptions()}</select></label>
      <label>קומה<input type="text" id="ed-floor" maxlength="6" inputmode="numeric" placeholder="0"></label>
      <label class="toggle"><input type="checkbox" id="ed-public"> <span>הכניסה <b>פתוחה לקהל הרחב</b> (לא רק לעובדים עם כרטיס)</span></label>
      <fieldset class="form"><legend><b>שעות פתיחה</b> (ריק = לא ידוע)</legend><div id="ed-hours"></div></fieldset>
      <label>הערה<textarea id="ed-note" maxlength="${LIMITS.note}" placeholder="נראית כמו דלת צוות אבל פתוחה לקהל…"></textarea></label>`;
    E.hours = windowsEditor($('#ed-hours'), []);
    $('#ed-existing').onchange = () => fillExisting('entrance');
  } else if (k === 'path') {
    f.innerHTML = `<p class="small">סמנו את הדרך נקודה אחרי נקודה. בכל נקודה אפשר לכתוב מה רואים ("פנו שמאלה ליד הקיוסק"), לסמן אם זה בתוך בניין, מדרגות או דלת.</p>
      <ol id="ed-points" class="form"></ol>
      <div class="actions"><button type="button" id="ed-undo" class="btn btn-secondary">↩️ בטל נקודה אחרונה</button></div>
      <label class="toggle"><input type="checkbox" id="ed-wheel" checked> <span>אפשר לעבור עם כיסא גלגלים / עגלה</span></label>
      <fieldset class="form"><legend><b>מתי הדרך פתוחה?</b> (ריק = תמיד / לא ידוע)</legend><div id="ed-hours"></div></fieldset>`;
    E.hours = windowsEditor($('#ed-hours'), []);
    $('#ed-undo').onclick = () => { E.points.pop(); renderPathPoints(); redraw(); };
    renderPathPoints();
  } else if (k === 'rule') {
    f.innerHTML = `<label>לאיזו חניה?<select id="ed-parking">${recordOptions(E.base.parkings)}</select></label>
      <fieldset class="form"><legend><b>כללי זמן</b> (כלל ראשון שמתאים קובע)</legend><div id="ed-rules"></div></fieldset>`;
    const load = () => { const p = E.base.parkings.find(x => x.id === $('#ed-parking').value); E.rules = windowsEditor($('#ed-rules'), p?.rules || [], { withStatus: true }); };
    $('#ed-parking').onchange = load; load();
  } else if (k === 'destination') {
    f.innerHTML = `<label>יעד קיים או חדש<select id="ed-existing">${opt('', '➕ יעד חדש')}${recordOptions(E.base.destinations)}</select></label>
      <label>שם<input type="text" id="ed-name" maxlength="${LIMITS.name}"></label>
      <label>שמות נוספים לחיפוש (מופרדים בפסיק)<input type="text" id="ed-aliases" maxlength="200"></label>
      <label>בניין<select id="ed-building">${buildingOptions()}</select></label>
      <label>קומה<input type="text" id="ed-floor" maxlength="6"></label>
      <label>איך מוצאים בפנים<textarea id="ed-note" maxlength="${LIMITS.note}"></textarea></label>`;
    $('#ed-existing').onchange = () => fillExisting('destination');
  } else {
    const all = [...E.base.parkings.map(p => ['🅿️', p]), ...E.base.entrances.filter(e => e.publicAccess === 'yes' || e.prov?.source !== 'osm').map(e => ['🚪', e]), ...E.base.destinations.map(d => ['🏁', d])];
    f.innerHTML = `<label>על מה התיקון?<select id="ed-target">${opt('', 'כללי / אחר')}${all.map(([i, r]) => opt(r.id, `${i} ${r.name || r.id}`)).join('')}</select></label>
      <label>מה לא נכון ומה נכון?<textarea id="ed-text" maxlength="${LIMITS.text}" required placeholder="למשל: הדלת נעולה אחרי 20:00"></textarea></label>`;
  }
  redraw();
}

function fillExisting(kind) {
  const id = $('#ed-existing').value;
  const list = { parking: E.base.parkings, entrance: E.base.entrances, destination: E.base.destinations }[kind];
  const r = list.find(x => x.id === id);
  E.existing = r || null;
  if (!r) return;
  if ($('#ed-name')) $('#ed-name').value = r.name || '';
  if ($('#ed-note')) $('#ed-note').value = kind === 'destination' ? r.hint || '' : r.note || '';
  if ($('#ed-floor')) $('#ed-floor').value = r.floor ?? '';
  if ($('#ed-building') && r.buildingId) $('#ed-building').value = r.buildingId;
  if ($('#ed-aliases')) $('#ed-aliases').value = (r.aliases || []).join(', ');
  if (kind === 'parking') {
    $$('[data-seg="ptype"] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === (r.type || 'lot')));
    E.rules = windowsEditor($('#ed-rules'), r.rules || [], { withStatus: true });
  }
  if (kind === 'entrance') { $('#ed-public').checked = r.publicAccess === 'yes'; E.hours = windowsEditor($('#ed-hours'), r.hours || []); }
  if (r.lat != null) { E.point = [r.lat, r.lon]; E.map.setView(E.point, 19); } else { E.point = null; toast('לרשומה הזו אין עדיין מיקום – סמנו אותו על המפה', 4000); }
  redraw();
}

function renderPathPoints() {
  const ol = $('#ed-points'); if (!ol) return;
  const ents = E.base.entrances;
  ol.innerHTML = E.points.map((p, i) => `<li class="rule-row" data-i="${i}">
    <b style="grid-column:1/-1">נקודה ${i + 1}${p.nodeId ? ' <span class="small muted">(מחוברת למפה)</span>' : ''}</b>
    <label style="grid-column:1/-1">מה עושים כאן?<input type="text" class="pnote" maxlength="${LIMITS.step}" value="${esc(p.note)}" placeholder="${i === 0 ? 'נקודת התחלה' : 'למשל: היכנסו בדלת האפורה'}"></label>
    <label class="toggle"><input type="checkbox" class="pin" ${p.indoor ? 'checked' : ''}> בתוך בניין</label>
    <label class="toggle"><input type="checkbox" class="pst" ${p.stairs ? 'checked' : ''}> מדרגות</label>
    <label style="grid-column:1/-1">זו דלת?<select class="pdoor">${opt('', 'לא')}${ents.filter(e => e.lat == null || haversine([p.lat, p.lon], [e.lat, e.lon]) < 40).map(e => opt(e.id, e.name, p.entranceId === e.id)).join('')}</select></label>
  </li>`).join('');
  $$('#ed-points li').forEach(li => {
    const p = E.points[+li.dataset.i];
    li.querySelector('.pnote').oninput = e => { p.note = e.target.value; };
    li.querySelector('.pin').onchange = e => { p.indoor = e.target.checked; };
    li.querySelector('.pst').onchange = e => { p.stairs = e.target.checked; };
    li.querySelector('.pdoor').onchange = e => { p.entranceId = e.target.value || undefined; };
  });
}

async function onPhoto(ev) {
  const file = ev.target.files[0];
  if (!file) { E.photo = null; $('#ed-photo-prev').hidden = true; return; }
  try {
    E.photo = await compressImage(file);
    const prev = $('#ed-photo-prev'); prev.src = URL.createObjectURL(E.photo); prev.hidden = false;
    toast(`התמונה הוקטנה ל-${Math.round(E.photo.size / 1024)}KB`);
  } catch { E.photo = null; toast('לא הצלחנו לקרוא את התמונה'); }
}

// ---------------------------------------------------------------- build + validate
const rid = p => `${p}-tip-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const val = id => ($('#' + id)?.value || '').trim();

function build() {
  const k = E.kind, errors = [], clientFlags = [];
  let payload;
  const needPoint = () => { if (!E.point) errors.push('בחרו מיקום על המפה או לפי GPS.'); };
  if (k === 'parking') {
    needPoint();
    if (!val('ed-name')) errors.push('כתבו שם קצר לחניה.');
    const rules = E.rules.read();
    if (!rules.length) errors.push('הוסיפו לפחות כלל זמן אחד.');
    const z = E.point && safetyZoneAt(E.point, E.base.safetyZones);
    if (z) errors.push(`המיקום נמצא בתוך אזור ${SAFETY_KINDS[z.kind] || z.kind}. אסור להמליץ לחנות שם – לא ניתן לשלוח.`);
    const type = $('[data-seg="ptype"] [aria-pressed="true"]')?.dataset.v || 'lot';
    payload = { id: E.existing?.id || rid('p'), name: val('ed-name').slice(0, LIMITS.name), type, lat: E.point?.[0], lon: E.point?.[1], rules, note: val('ed-note').slice(0, LIMITS.note) || null };
  } else if (k === 'entrance') {
    needPoint();
    if (!val('ed-name')) errors.push('כתבו שם / תיאור לכניסה.');
    if (!$('#ed-public').checked) errors.push('אנחנו מוסיפים רק כניסות שפתוחות לקהל הרחב. אם הכניסה לעובדים בלבד – אל תשלחו אותה.');
    const hours = E.hours.read();
    payload = { id: E.existing?.id || rid('ent'), name: val('ed-name').slice(0, LIMITS.name), buildingId: val('ed-building') || null, floor: val('ed-floor') || null, lat: E.point?.[0], lon: E.point?.[1], publicAccess: 'yes', hours: hours.length ? hours : null, note: val('ed-note').slice(0, LIMITS.note) || null };
  } else if (k === 'path') {
    if (E.points.length < 2) errors.push('סמנו לפחות 2 נקודות על המפה.');
    for (const p of E.points) { const z = safetyZoneAt([p.lat, p.lon], E.base.safetyZones); if (z) { clientFlags.push('path-through-safety-zone'); break; } }
    const hours = E.hours.read();
    payload = { id: rid('path'), wheelchair: $('#ed-wheel').checked && !E.points.some(p => p.stairs), hours: hours.length ? hours : null,
      points: E.points.map(p => ({ lat: p.lat, lon: p.lon, nodeId: p.nodeId, entranceId: p.entranceId, indoor: p.indoor, stairs: p.stairs, note: (p.note || '').slice(0, LIMITS.step) || undefined })) };
  } else if (k === 'rule') {
    const rules = E.rules.read();
    if (!rules.length) errors.push('הוסיפו לפחות כלל זמן אחד.');
    payload = { parkingId: val('ed-parking'), rules };
  } else if (k === 'destination') {
    needPoint();
    if (!val('ed-name')) errors.push('כתבו שם ליעד.');
    payload = { id: E.existing?.id || rid('dest'), name: val('ed-name').slice(0, LIMITS.name), aliases: val('ed-aliases').split(/[,،]/).map(s => s.trim()).filter(Boolean).slice(0, 12), buildingId: val('ed-building') || null, floor: val('ed-floor') || null, hint: val('ed-note').slice(0, LIMITS.note) || null, lat: E.point?.[0], lon: E.point?.[1] };
  } else {
    if (!val('ed-text')) errors.push('כתבו מה צריך לתקן.');
    payload = { targetId: val('ed-target') || null, text: val('ed-text').slice(0, LIMITS.text), lat: E.point?.[0] ?? null, lon: E.point?.[1] ?? null };
  }
  if (['parking', 'entrance', 'path'].includes(k)) {
    if (!$('#ed-safe').checked) errors.push('סמנו את אישור הבטיחות.');
    payload.safetyConfirmed = $('#ed-safe').checked;
  }
  clientFlags.push(...textFlags(JSON.stringify(payload)));
  if (clientFlags.length) payload.clientFlags = [...new Set(clientFlags)];
  return { kind: k, payload, errors };
}

function showErrors(errors) { $('#ed-errors').innerHTML = errors.map(esc).join('<br>'); if (errors.length) $('#ed-errors').scrollIntoView({ block: 'center' }); }

async function send() {
  const { kind, payload, errors } = build();
  showErrors(errors); if (errors.length) return;
  const btn = $('#ed-form [type=submit]'); btn.disabled = true; btn.textContent = 'שולח…';
  try {
    const photoPath = E.photo ? await uploadPendingPhoto(E.photo) : null;
    await submitTip({ kind, payload, photoPath, honeypot: $('#ed-form [name=website]').value });
    toast('תודה! הטיפ נשלח ויופיע אחרי בדיקה.', 5000);
    E.point = null; E.points = []; E.photo = null; renderFields(); $('#ed-safe').checked = false; $('#ed-photo').value = ''; $('#ed-photo-prev').hidden = true;
  } catch (e) {
    const m = e.message || '';
    showErrors([/rate_limit/.test(m) ? 'שלחתם הרבה טיפים בזמן קצר. נסו שוב בעוד שעה.' : /safety/.test(m) ? 'חסר אישור בטיחות.' : 'השליחה נכשלה (אולי אין קליטה). שמרו כטיוטה ונסו שוב אחר כך.']);
  } finally { btn.disabled = false; btn.textContent = 'שליחה לבדיקה'; }
}

// ---------------------------------------------------------------- drafts + export (owner)
async function saveDraft() {
  const { kind, payload, errors } = build();
  showErrors(errors); if (errors.length) return;
  const drafts = store.get('drafts', []);
  const d = { id: 'draft-' + Date.now().toString(36), kind, payload, created: new Date().toISOString() };
  if (E.photo) d.photo = await blobToDataUrl(E.photo);
  drafts.push(d);
  store.set('drafts', drafts);
  if (store.get('drafts', []).length !== drafts.length) { delete d.photo; drafts[drafts.length - 1] = d; store.set('drafts', drafts); toast('הטיוטה נשמרה בלי התמונה (אין מספיק מקום במכשיר)'); }
  else toast('נשמר כטיוטה במכשיר');
  renderDrafts();
}

function renderDrafts() {
  const drafts = store.get('drafts', []);
  $('#ed-drafts').innerHTML = drafts.length ? `<ol class="small">${drafts.map((d, i) => `<li>${esc(KINDS.find(k => k[0] === d.kind)?.[1] || d.kind)}: ${esc(d.payload.name || d.payload.text || d.payload.parkingId || d.payload.id || '')}${d.photo ? ' 📷' : ''} <button class="link-btn" data-del="${i}">מחיקה</button></li>`).join('')}</ol>` : '<p class="small muted">אין טיוטות.</p>';
  $$('#ed-drafts [data-del]').forEach(b => b.onclick = () => { const ds = store.get('drafts', []); ds.splice(+b.dataset.del, 1); store.set('drafts', ds); renderDrafts(); });
}

async function exportJson() {
  const drafts = store.get('drafts', []).filter(d => d.kind !== 'correction');
  if (!drafts.length) return toast('אין טיוטות לייצוא');
  const today = new Date().toISOString().slice(0, 10);
  const verified = $('#ed-verified').checked;
  const tips = drafts.map(d => ({
    id: d.id, kind: d.kind, payload: { ...d.payload, safetyConfirmed: undefined, clientFlags: undefined },
    photo_url: d.photo ? `photos/${d.id}.jpg` : null,
    prov: { verified, lastVerified: verified ? today : null, source: 'owner', confidence: verified ? 'high' : 'medium', edited: today },
  }));
  const data = applyTips(E.base, tips);
  data.meta = { ...data.meta, ownerEdited: today };
  download('sheba.json', new Blob([formatData(data)], { type: 'application/json' }));
  for (const d of drafts) if (d.photo) download(`${d.id}.jpg`, await dataUrlToBlob(d.photo));
  toast('הקובץ ירד. החליפו את data/sheba.json במאגר (ותמונות לתיקייה photos/).', 6000);
}

function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function renderTodo() {
  const items = [
    ...E.base.parkings.filter(isTodo).map(r => ['parking', r]),
    ...E.base.entrances.filter(r => r.prov?.todo || (r.lat == null)).map(r => ['entrance', r]),
    ...E.base.destinations.filter(isTodo).map(r => ['destination', r]),
  ];
  $('#ed-todo').innerHTML = items.map(([k, r]) => `<li><a href="?edit=1&kind=${k}&id=${encodeURIComponent(r.id)}">${esc(r.name)}</a> – ${esc(r.prov?.todo || 'חסר מיקום')}</li>`).join('');
}
