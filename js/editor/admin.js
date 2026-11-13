// ?admin=1 – review queue for crowd tips (owner only; enforced server-side by RLS + is_admin()).
import { $, $$, esc, toast, fmtDate } from '../util.js';
import { createMap, pinIcon } from '../ui/map.js';
import { backendEnabled } from '../config.js';
import * as api from '../backend.js';
import { safetyZoneAt, textFlags, SAFETY_KINDS } from '../engine/safety.js';
import { applyTips, voteMap } from '../data.js';
import { formatData } from '../engine/format.js';

const A = { base: null, pending: [], published: [], votes: new Map(), map: null, layer: null };
const FLAG_TEXT = {
  'mentions-emergency-or-disabled': 'מזכיר חירום / אמבולנס / נכים / כיבוי',
  'mentions-non-public': 'מזכיר "עובדים בלבד" / אין כניסה',
  'entrance-not-public': 'כניסה שלא סומנה כפתוחה לקהל',
  'path-through-safety-zone': 'המסלול עובר באזור בטיחות',
};

export async function start({ base }) {
  A.base = base;
  document.body.classList.add('plain');
  const root = $('#screen-admin');
  $('#screen-picker').hidden = true; root.hidden = false;
  $('#btn-home').hidden = false; $('#btn-home').onclick = () => { location.href = location.pathname; };
  $('#title').textContent = 'ניהול טיפים';
  if (!backendEnabled()) {
    root.innerHTML = '<h2>ניהול טיפים</h2><p class="notice">השרת (Supabase) עוד לא מוגדר. ראו README → "הפעלת טיפים מהציבור". עד אז אפשר לערוך ישירות ב-<a href="?edit=1">עורך</a> ולייצא JSON.</p>';
    return;
  }
  api.captureSessionFromHash();
  if (!api.adminSession()) return renderLogin(root);
  let ok = false;
  try { ok = await api.isAdmin(); } catch { ok = false; }
  if (!ok) { api.logout(); return renderLogin(root, 'החשבון הזה אינו מנהל, או שפג תוקף ההתחברות.'); }
  root.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><h2 style="flex:1">ממתינים לאישור <span id="ad-count"></span></h2><button id="ad-logout" class="link-btn">התנתקות</button></div>
    <div id="ad-map" class="map" style="height:40dvh"></div>
    <div id="ad-pending"></div>
    <h2>טיפים שפורסמו</h2>
    <div class="actions"><button id="ad-export" class="btn btn-secondary btn-wide">⬇️ הורדת sheba.json כולל כל הטיפים שפורסמו</button></div>
    <div id="ad-published"></div>`;
  $('#ad-logout').onclick = () => { api.logout(); location.reload(); };
  $('#ad-export').onclick = exportAll;
  A.map = createMap($('#ad-map'), { data: base, zoom: 16 });
  A.layer = window.L.layerGroup().addTo(A.map);
  for (const z of base.safetyZones || []) {
    const st = { color: '#dc2626', weight: 2, fillOpacity: 0.25, interactive: false };
    if (z.polygon) window.L.polygon(z.polygon, st).addTo(A.map);
    else if (z.line) window.L.polyline(z.line, { ...st, weight: 10 }).addTo(A.map);
    else if (z.center) window.L.circle(z.center, { ...st, radius: z.radius || 10 }).addTo(A.map);
  }
  await reload();
}

function renderLogin(root, msg) {
  root.innerHTML = `<h2>כניסת מנהל</h2>${msg ? `<p class="flag">${esc(msg)}</p>` : ''}
    <form id="ad-login" class="form"><label>אימייל<input type="text" inputmode="email" id="ad-email" autocomplete="email" required></label>
    <button class="btn btn-primary btn-big">שלחו לי קישור כניסה</button></form>
    <p class="small muted">רק חשבון שהוגדר כמנהל ב-Supabase יכול לאשר טיפים.</p>`;
  $('#ad-login').onsubmit = async e => {
    e.preventDefault();
    try { await api.sendMagicLink($('#ad-email').value.trim()); toast('נשלח קישור לאימייל. פתחו אותו בטלפון הזה.', 6000); }
    catch { toast('השליחה נכשלה'); }
  };
}

async function reload() {
  try {
    const [pending, published, votes] = await Promise.all([api.fetchPending(), api.fetchAllPublished(), api.fetchVoteSummary().catch(() => [])]);
    A.pending = pending; A.published = published; A.votes = voteMap(votes, published);
  } catch (e) { toast('שגיאה בטעינה: ' + e.message); return; }
  renderPending(); renderPublished();
}

/** Client-side re-check of the safety rules (the server flags text; here we check geometry too). */
function checks(s) {
  const out = (s.flags || []).map(f => FLAG_TEXT[f] || f);
  const p = s.payload || {};
  const pts = p.points ? p.points.map(x => [x.lat, x.lon]) : p.lat != null ? [[p.lat, p.lon]] : [];
  for (const pt of pts) {
    const z = safetyZoneAt(pt, A.base.safetyZones);
    if (z) { out.push(`נמצא בתוך אזור ${SAFETY_KINDS[z.kind] || z.kind}`); break; }
  }
  for (const f of textFlags(JSON.stringify(p))) if (!out.includes(FLAG_TEXT[f])) out.push(FLAG_TEXT[f] || f);
  if (s.kind === 'entrance' && p.publicAccess !== 'yes') out.push('הכניסה לא מסומנת כפתוחה לקהל – לא לאשר');
  if (s.kind === 'parking' && (p.rules || []).some(r => r.status === 'ok') && !p.rules.some(r => r.note)) out.push('אין הערה/שילוט לכללי הזמן');
  return [...new Set(out)];
}

function summary(s) {
  const p = s.payload || {};
  const rows = [];
  if (p.name) rows.push(`<b>${esc(p.name)}</b>`);
  if (p.text) rows.push(esc(p.text));
  if (p.targetId) rows.push(`על: ${esc(p.targetId)}`);
  if (p.rules) rows.push('כללים: ' + p.rules.map(r => `${esc(r.from)}–${esc(r.to)} ${esc(r.status)}${r.note ? ' (' + esc(r.note) + ')' : ''}`).join('; '));
  if (p.hours) rows.push('שעות: ' + p.hours.map(r => `${esc(r.from)}–${esc(r.to)}`).join('; '));
  if (p.points) rows.push(`${p.points.length} נקודות: ` + p.points.map(x => esc(x.note || '')).filter(Boolean).join(' → '));
  if (p.note) rows.push(esc(p.note));
  return rows.join('<br>');
}

function renderPending() {
  const L = window.L;
  A.layer.clearLayers();
  $('#ad-count').textContent = `(${A.pending.length})`;
  $('#ad-pending').innerHTML = A.pending.length ? A.pending.map((s, i) => {
    const c = checks(s);
    return `<article class="card pending" id="sub-${i}">
      <div class="card-rank">${esc(s.kind)} · ${fmtDate(s.created_at)} ${s.photo_path ? '· 📷' : ''}</div>
      <p>${summary(s)}</p>
      ${c.length ? `<div class="danger-box"><b>לבדוק:</b><ul>${c.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '<p class="small muted">לא נמצאו בעיות אוטומטיות.</p>'}
      <img class="ad-photo" data-path="${esc(s.photo_path || '')}" alt="תמונה מהטיפ" style="max-width:100%;border-radius:10px" hidden>
      <details><summary>עריכה (JSON)</summary><textarea class="ad-json" style="width:100%;min-height:180px;direction:ltr;font-family:monospace">${esc(JSON.stringify(s.payload, null, 1))}</textarea></details>
      <div class="actions">
        <button class="btn btn-primary" data-act="approve" data-i="${i}">✅ אישור</button>
        <button class="btn btn-secondary" data-act="reject" data-i="${i}">❌ דחייה</button>
      </div></article>`;
  }).join('') : '<p class="muted">אין טיפים שממתינים.</p>';
  A.pending.forEach((s, i) => {
    const p = s.payload || {};
    const go = () => document.getElementById('sub-' + i).scrollIntoView({ behavior: 'smooth' });
    if (p.points?.length) L.polyline(p.points.map(x => [x.lat, x.lon]), { color: '#d97706', weight: 5 }).on('click', go).addTo(A.layer);
    else if (p.lat != null) L.marker([p.lat, p.lon], { icon: pinIcon(s.kind === 'parking' ? '🅿️' : s.kind === 'entrance' ? '🚪' : '📌', s.kind) }).on('click', go).addTo(A.layer);
  });
  $$('.ad-photo').forEach(async img => {
    if (!img.dataset.path) return;
    try { img.src = await api.signedPhotoUrl(img.dataset.path); img.hidden = false; } catch { /* photo optional */ }
  });
  $$('#ad-pending [data-act]').forEach(b => { b.onclick = () => act(b.dataset.act, +b.dataset.i, b.closest('article')); });
}

async function act(what, i, card) {
  const s = A.pending[i];
  try {
    if (what === 'reject') {
      const note = prompt('סיבה (לא חובה):') ?? null;
      await api.rejectSubmission(s.id, note);
    } else {
      let payload;
      try { payload = JSON.parse(card.querySelector('.ad-json').value); } catch { return toast('ה-JSON לא תקין'); }
      const c = checks({ ...s, payload });
      if (c.some(x => /בתוך אזור|לא לאשר/.test(x)) && !confirm('יש בעיית בטיחות:\n' + c.join('\n') + '\n\nלאשר בכל זאת?')) return;
      delete payload.safetyConfirmed; delete payload.clientFlags;
      if (s.kind === 'correction') { toast('תיקונים לא מתפרסמים אוטומטית – עדכנו את הנתונים בעורך ואז דחו/סגרו את הפנייה.'); return; }
      const photoUrl = s.photo_path ? await api.publishPhoto(s.photo_path) : null;
      await api.approveSubmission(s.id, payload, s.kind, photoUrl);
    }
    toast(what === 'reject' ? 'נדחה' : 'אושר ופורסם');
    await reload();
  } catch (e) { toast('שגיאה: ' + e.message); }
}

function renderPublished() {
  $('#ad-published').innerHTML = A.published.map(t => {
    const id = t.payload?.id || t.payload?.parkingId;
    const v = A.votes.get(id) || {};
    return `<article class="card"><div class="card-rank">${esc(t.kind)} · אושר ${fmtDate(t.approved_at)}${t.confirmed_at ? ` · נבדק שוב ${fmtDate(t.confirmed_at)}` : ''}</div>
      <p>${summary(t)}</p>
      <p class="small">👍 ${v.up || 0} · 👎 ${v.down || 0} ${v.flagged ? `<span class="flag">${v.stale ? 'לא אושר 6 חודשים' : 'הרבה דיווחים שלא עבד'}</span>` : ''}</p>
      <div class="actions"><button class="btn btn-secondary btn-small" data-confirm="${esc(t.id)}">✔️ בדקתי שוב – עדיין נכון</button><button class="btn btn-secondary btn-small" data-unpub="${esc(t.id)}">הסרה</button></div></article>`;
  }).join('') || '<p class="muted">עדיין אין.</p>';
  $$('[data-confirm]').forEach(b => { b.onclick = async () => { await api.confirmPublished(b.dataset.confirm); toast('עודכן'); reload(); }; });
  $$('[data-unpub]').forEach(b => { b.onclick = async () => { if (confirm('להסיר את הטיפ מהאתר?')) { await api.unpublish(b.dataset.unpub); reload(); } }; });
}

function exportAll() {
  const today = new Date().toISOString().slice(0, 10);
  const data = applyTips(A.base, A.published);
  data.meta = { ...data.meta, crowdMerged: today };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([formatData(data)], { type: 'application/json' }));
  a.download = 'sheba.json';
  document.body.append(a); a.click(); a.remove();
}
