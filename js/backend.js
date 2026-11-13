// Minimal Supabase client (REST + Auth + Storage over fetch, no SDK).
import { CONFIG, backendEnabled } from './config.js';

const LS_TOKEN = 'spg.clientToken';
const SS_SESSION = 'spg.adminSession';

/** Random per-device token used only for rate limiting and "one vote per device". Not personal data. */
export function clientToken() {
  let t = null;
  try { t = localStorage.getItem(LS_TOKEN); } catch {}
  if (!t) {
    t = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
    try { localStorage.setItem(LS_TOKEN, t); } catch {}
  }
  return t;
}

function headers(extra = {}) {
  const s = adminSession();
  return {
    apikey: CONFIG.SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + (s?.access_token || CONFIG.SUPABASE_ANON_KEY),
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function req(path, opts = {}) {
  if (!backendEnabled()) throw new Error('backend-disabled');
  const r = await fetch(CONFIG.SUPABASE_URL + path, { ...opts, headers: headers(opts.headers) });
  if (r.status === 401 && adminSession()?.refresh_token && !opts._retried) {
    if (await refreshSession()) return req(path, { ...opts, _retried: true });
  }
  if (!r.ok) {
    let msg = r.status + '';
    try { const j = await r.json(); msg = j.message || j.msg || j.error_description || j.hint || msg; } catch {}
    throw new Error(msg);
  }
  const ct = r.headers.get('content-type') || '';
  return ct.includes('json') ? r.json() : r.text();
}

// ---------- public (anonymous) ----------
export const fetchPublished = () => req('/rest/v1/published_tips?select=id,kind,payload,photo_url,approved_at,confirmed_at&order=approved_at.asc');
export const fetchVoteSummary = () => req('/rest/v1/vote_summary?select=*');

export function submitTip({ kind, payload, photoPath = null, honeypot = '' }) {
  return req('/rest/v1/rpc/submit_tip', { method: 'POST', body: JSON.stringify({ p_kind: kind, p_payload: payload, p_photo_path: photoPath, p_client_token: clientToken(), p_hp: honeypot }) });
}
export function vote(targetId, value) {
  return req('/rest/v1/rpc/cast_vote', { method: 'POST', body: JSON.stringify({ p_target_id: targetId, p_value: value, p_client_token: clientToken() }) });
}
/** Upload a (compressed) photo for a pending tip. Returns the storage path. */
export async function uploadPendingPhoto(blob) {
  const path = `pending/${crypto.randomUUID ? crypto.randomUUID() : Date.now()}.jpg`;
  await req(`/storage/v1/object/tip-photos-pending/${path}`, { method: 'POST', body: blob, headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false' } });
  return path;
}

// ---------- admin ----------
export function adminSession() {
  try { return JSON.parse(sessionStorage.getItem(SS_SESSION) || 'null'); } catch { return null; }
}
function saveSession(s) { try { sessionStorage.setItem(SS_SESSION, JSON.stringify(s)); } catch {} }
export function logout() { try { sessionStorage.removeItem(SS_SESSION); } catch {} }

export function sendMagicLink(email) {
  const redirect = location.origin + location.pathname + '?admin=1';
  return req('/auth/v1/otp?redirect_to=' + encodeURIComponent(redirect), { method: 'POST', body: JSON.stringify({ email, create_user: false }) });
}
/** After the magic link redirect, Supabase puts the tokens in the URL hash. */
export function captureSessionFromHash() {
  if (!location.hash.includes('access_token=')) return false;
  const p = new URLSearchParams(location.hash.slice(1));
  saveSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_at: Date.now() / 1000 + +(p.get('expires_in') || 3600) });
  history.replaceState(null, '', location.pathname + location.search);
  return true;
}
async function refreshSession() {
  const s = adminSession();
  try {
    const r = await fetch(CONFIG.SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: CONFIG.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
    if (!r.ok) { logout(); return false; }
    const j = await r.json();
    saveSession({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() / 1000 + j.expires_in });
    return true;
  } catch { return false; }
}
export const isAdmin = () => req('/rest/v1/rpc/is_admin', { method: 'POST', body: '{}' });
export const fetchPending = () => req('/rest/v1/submissions?select=*&status=eq.pending&order=created_at.asc');
export const fetchAllPublished = () => req('/rest/v1/published_tips?select=*&order=approved_at.desc');
export const approveSubmission = (id, payload, kind, photoUrl = null) => req('/rest/v1/rpc/approve_submission', { method: 'POST', body: JSON.stringify({ p_id: id, p_payload: payload, p_kind: kind, p_photo_url: photoUrl }) });
export const rejectSubmission = (id, note) => req('/rest/v1/rpc/reject_submission', { method: 'POST', body: JSON.stringify({ p_id: id, p_note: note || null }) });
export const unpublish = id => req('/rest/v1/published_tips?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
export const confirmPublished = id => req('/rest/v1/published_tips?id=eq.' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ confirmed_at: new Date().toISOString() }) });
export async function signedPhotoUrl(path) {
  const j = await req(`/storage/v1/object/sign/tip-photos-pending/${path}`, { method: 'POST', body: JSON.stringify({ expiresIn: 600 }) });
  return CONFIG.SUPABASE_URL + '/storage/v1' + j.signedURL;
}
/** Copy an approved photo from the private pending bucket to the public bucket; returns its public URL. */
export async function publishPhoto(path) {
  const dest = path.replace(/^pending\//, 'approved/');
  await req('/storage/v1/object/copy', { method: 'POST', body: JSON.stringify({ bucketId: 'tip-photos-pending', sourceKey: path, destinationBucket: 'tip-photos', destinationKey: dest }) });
  return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/tip-photos/${dest}`;
}
