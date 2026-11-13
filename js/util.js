// Small DOM / text helpers.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escape for safe insertion into HTML. ALL user/crowd text goes through this. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Normalise Hebrew/English text for search: no niqqud, quotes, dashes; lower case. */
export function norm(s) {
  return String(s || '').normalize('NFKD').replace(/[\u0591-\u05C7]/g, '').replace(/["'״׳`\-–_.,()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function toast(msg, ms = 3000) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms);
}

export function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

export const store = {
  get(k, def = null) { try { const v = localStorage.getItem('spg.' + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem('spg.' + k, JSON.stringify(v)); } catch {} },
};

export const wazeUrl = (lat, lon) => `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
export const gmapsUrl = (lat, lon) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
