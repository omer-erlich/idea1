// Sheba Parking Guide – main app. Google-Maps-style flow:
//   search list → full-screen map + draggable bottom sheet (route options as chips) → walking navigation
import { $, $$, esc, norm, toast, fmtDate, store, wazeUrl, gmapsUrl } from './util.js';
import { loadStatic, loadApprovedTips, applyTips, voteMap } from './data.js';
import { Engine } from './engine/recommend.js';
import { parseWhen, whenFromDate, fmtHM, DAY_NAMES_HE, isOpenAt } from './engine/time.js';
import { createMap, drawRoute } from './ui/map.js';
import { startWalk, stopWalk } from './ui/walk.js';
import { backendEnabled } from './config.js';
import { vote } from './backend.js';

const S = {
  base: null, data: null, engine: null, votes: new Map(),
  destId: null, timeParam: 'now', opts: { accessible: false, avoidRisky: false },
  result: null, selected: 0, map: null, routeLayer: null,
  sheet: { state: 'peek', vis: 0, m: null },
};

const UNOFFICIAL = 'טיפ לא רשמי – על אחריותך, בדוק שילוט במקום';
const STATUS_LABEL = { ok: 'אין מגבלה ידועה בשעה זו', paid: 'בתשלום', risky: 'בסיכון לדו"ח' };
const TYPE_LABEL = { garage: 'חניון מקורה', lot: 'מגרש חניה', street: 'חניה ברחוב' };
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayName = d => DAYS[d];

// ---------------------------------------------------------------- boot
async function boot() {
  registerSW();
  const q = new URLSearchParams(location.search);
  if (q.has('edit') || q.has('admin')) {
    const mod = q.has('admin') ? await import('./editor/admin.js') : await import('./editor/editor.js');
    S.base = await loadStatic();
    mod.start({ base: S.base, params: q });
    return;
  }
  try { S.base = await loadStatic(); }
  catch { $('#main').innerHTML = '<p class="notice">לא הצלחנו לטעון את הנתונים. בדקו חיבור ונסו שוב.</p>'; return; }
  S.data = S.base; S.engine = new Engine(S.data);
  S.opts = { ...S.opts, ...store.get('opts', {}) };
  initUi();
  routeFromUrl();
  window.addEventListener('popstate', routeFromUrl);
  // crowd tips arrive later (network) – re-render when they do
  loadApprovedTips().then(({ tips, votes, offline }) => {
    if (tips.length) { S.data = applyTips(S.base, tips); S.engine = new Engine(S.data); }
    S.votes = voteMap(votes, tips);
    if (offline) showNet('מצב לא מקוון – מוצגים טיפים שנשמרו בביקור הקודם');
    renderDestList();
    if (S.destId && !$('#screen-result').hidden) renderResult({ keepSheet: true });
  });
  window.addEventListener('offline', () => showNet('אין חיבור לאינטרנט – האפליקציה ממשיכה לעבוד עם המידע השמור'));
  window.addEventListener('online', () => showNet(null));
}

function showNet(msg) { const el = $('#net-status'); el.hidden = !msg; el.textContent = msg || ''; }
function registerSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ---------------------------------------------------------------- URL ⇄ screen
function routeFromUrl() {
  const q = new URLSearchParams(location.search);
  S.timeParam = q.get('time') || 'now';
  if (q.has('acc')) S.opts.accessible = q.get('acc') === '1';
  if (q.has('safe')) S.opts.avoidRisky = q.get('safe') === '1';
  syncControls();
  const dest = q.get('dest');
  if (dest && S.engine.destinations.has(dest)) {
    S.destId = dest;
    S.selected = +(q.get('opt') || 0) || 0;
    renderResult({});
    if (q.get('walk') === '1') openWalk(S.selected, false);
  } else { S.destId = null; show('picker'); }
}

function pushUrl(params, replace = false) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '' && v !== false) q.set(k, v === true ? '1' : v);
  const url = location.pathname + (q.toString() ? '?' + q.toString().replace(/%3A/g, ':') : '');
  (replace ? history.replaceState : history.pushState).call(history, null, '', url);
}
const currentParams = (extra = {}) => ({ dest: S.destId, time: S.timeParam !== 'now' ? S.timeParam : null, acc: S.opts.accessible || null, safe: S.opts.avoidRisky || null, ...extra });

function show(name) {
  if (name !== 'walk') stopWalk();
  for (const s of ['picker', 'result', 'walk', 'editor', 'admin']) $('#screen-' + s).hidden = s !== name;
  document.body.dataset.screen = name;
  $('#btn-home').hidden = name === 'picker';
  if (name !== 'result') { const sh = $('#sheet'); sh.style.transform = ''; }
  window.scrollTo(0, 0);
}

function goHome() { S.destId = null; pushUrl({}); show('picker'); }

// ---------------------------------------------------------------- search screen + options
function initUi() {
  const days = $('#day-select');
  const today = new Date().getDay();
  days.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = (today + i) % 7; return `<option value="${d}">${i === 0 ? 'היום' : i === 1 ? 'מחר' : 'יום ' + DAY_NAMES_HE[d]}</option>`; }).join('');
  $('#search').addEventListener('input', renderDestList);
  $$('#time-row [data-time]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.time;
    if (t === 'custom') {
      const open = $('#custom-time').hidden;
      $('#custom-time').hidden = !open;
      if (open) setCustomTime(); else syncControls();
    } else {
      $('#custom-time').hidden = true;
      S.timeParam = t === 'now' ? 'now' : dayName(new Date().getDay()) + '-' + t;
      onOptsChange();
    }
  }));
  days.addEventListener('change', setCustomTime);
  $('#time-input').addEventListener('change', setCustomTime);
  $('#opt-accessible').addEventListener('click', () => { S.opts.accessible = !S.opts.accessible; onOptsChange(); });
  $('#opt-safe').addEventListener('click', () => { S.opts.avoidRisky = !S.opts.avoidRisky; onOptsChange(); });
  $('#btn-home').addEventListener('click', goHome);
  $('#res-back').addEventListener('click', goHome);
  $('#res-opts').addEventListener('click', openOpts);
  $('#opts-close').addEventListener('click', closeOpts);
  $('#opts-modal').addEventListener('click', e => { if (e.target.id === 'opts-modal') closeOpts(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#opts-modal').hidden) closeOpts(); });
  bindSheetDrag();
  window.addEventListener('resize', () => { if (!$('#screen-result').hidden) { setSheet(S.sheet.state, false); fitRoute(); } });
  renderDestList();
}

function setCustomTime() { S.timeParam = dayName(+$('#day-select').value) + '-' + ($('#time-input').value || '09:00'); onOptsChange(); }

function onOptsChange() {
  store.set('opts', S.opts);
  syncControls();
  if (S.destId && !$('#screen-result').hidden) {
    S.selected = 0;
    pushUrl(currentParams(), true);
    renderResult({ keepSheet: true });
  }
}

function syncControls() {
  $('#opt-accessible').setAttribute('aria-pressed', String(S.opts.accessible));
  $('#opt-safe').setAttribute('aria-pressed', String(S.opts.avoidRisky));
  const m = /(\d\d:\d\d)$/.exec(S.timeParam);
  const prefix = /^([a-z]{3})-/.exec(S.timeParam)?.[1];
  const isToday = S.timeParam === 'now' || !prefix || prefix === dayName(new Date().getDay());
  const presets = new Set($$('#time-row [data-time]').map(b => b.dataset.time));
  const matchesPreset = S.timeParam === 'now' || (isToday && m && presets.has(m[1]));
  if (!matchesPreset && m) $('#custom-time').hidden = false;       // a non-preset time (e.g. from a shared link)
  const customOpen = !$('#custom-time').hidden;
  $$('#time-row [data-time]').forEach(b => {
    const t = b.dataset.time;
    const on = t === 'now' ? S.timeParam === 'now' : t === 'custom' ? customOpen : (isToday && m && m[1] === t && !customOpen);
    b.setAttribute('aria-pressed', String(!!on));
  });
  if (m && S.timeParam !== 'now') {
    $('#time-input').value = m[1];
    if (prefix) $('#day-select').value = String(DAYS.indexOf(prefix));
  }
}

function openOpts() { $('#opts-slot').append($('#opts-block')); $('#opts-modal').hidden = false; }
function closeOpts() { $('#opts-modal').hidden = true; $('#picker-opts-slot').append($('#opts-block')); }

function renderDestList() {
  if (!S.engine) return;
  const q = norm($('#search').value);
  const last = store.get('lastDest');
  const all = [...S.engine.destinations.values()];
  const list = all.filter(d => !q || norm(d.name).includes(q) || (d.aliases || []).some(a => norm(a).includes(q)));
  if (!q && last) list.sort((a, b) => (b.id === last) - (a.id === last));
  $('#list-label').textContent = q ? `${list.length} תוצאות` : 'יעדים';
  $('#dest-list').innerHTML = list.map(d => {
    const b = d.buildingId ? S.engine.buildings.get(d.buildingId) : null;
    const sub = [b?.name, d.floor != null && d.floor !== '' ? `קומה ${d.floor}` : null].filter(Boolean).join(' · ');
    const isLast = d.id === last && !q;
    return `<li><button class="dest-row" data-id="${esc(d.id)}"><span class="dest-ico${isLast ? ' last' : ''}" aria-hidden="true">${isLast ? '🕘' : '📍'}</span>
      <span class="dest-txt"><b>${esc(d.name)}</b>${sub || isLast ? `<span class="sub">${isLast ? 'האחרון שבחרת' + (sub ? ' · ' : '') : ''}${esc(sub)}</span>` : ''}</span><span class="dest-chev" aria-hidden="true">‹</span></button></li>`;
  }).join('');
  $('#no-results').hidden = list.length > 0;
  $$('#dest-list .dest-row').forEach(btn => btn.addEventListener('click', () => {
    S.destId = btn.dataset.id; S.selected = 0;
    store.set('lastDest', S.destId);
    pushUrl(currentParams());
    renderResult({});
  }));
}

// ---------------------------------------------------------------- result: map + bottom sheet
const whenNow = () => (S.timeParam === 'now' ? whenFromDate() : parseWhen(S.timeParam));

function renderResult({ keepSheet = false } = {}) {
  const when = whenNow();
  const r = S.engine.recommend(S.destId, when, { ...S.opts, votes: S.votes });
  S.result = r;
  if (S.selected >= r.options.length) S.selected = 0;
  show('result');
  const d = r.destination;
  $('#result-title').textContent = d.name;
  const b = d.buildingId ? S.engine.buildings.get(d.buildingId) : null;
  $('#result-when').textContent = [b?.name, d.floor != null && d.floor !== '' ? `קומה ${d.floor}` : null].filter(Boolean).join(' · ') +
    ` · ${S.timeParam === 'now' ? 'עכשיו' : 'יום ' + DAY_NAMES_HE[when.day] + ' ' + fmtHM(when.minutes)}${S.opts.accessible ? ' · ♿' : ''}`;
  const closedGates = (S.data.gates || []).filter(g => g.hours && !isOpenAt(g.hours, when).open);
  $('#gate-notice').hidden = !closedGates.length;
  if (closedGates.length) $('#gate-notice').textContent = `בשעה זו סגורים: ${closedGates.map(g => g.name).join(', ')}. היכנסו בשער הראשי.`;

  $('#route-chips').innerHTML = r.options.map((o, i) => {
    const tag = o.fallback ? 'רשמי · גיבוי' : i === 0 ? 'מומלץ' : 'חלופה';
    return `<button class="rchip" data-i="${i}" aria-pressed="${i === S.selected}"><span class="rc-tag">${tag}</span>
      <span class="rc-min">${o.noRoute ? '—' : o.walkMinutes}<small>${o.noRoute ? '' : "דק'"}</small></span><span class="rc-name">${esc(o.parking.name || 'חניה')}</span></button>`;
  }).join('');
  $$('#route-chips .rchip').forEach(c => c.addEventListener('click', () => selectOption(+c.dataset.i, true)));

  ensureMap().then(() => {
    selectOption(S.selected, false);
    if (keepSheet) setSheet(S.sheet.state); else requestAnimationFrame(() => { setSheet('peek'); fitRoute(); });
  });
}

async function ensureMap() {
  if (!window.L) await new Promise(r => window.addEventListener('load', r, { once: true }));
  if (!S.map) S.map = createMap($('#result-map'), { data: S.data, zoomControl: false });
  S.map.invalidateSize();
}

function selectOption(i, user) {
  S.selected = i;
  const o = S.result?.options[i];
  $$('#route-chips .rchip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
  const chip = $(`#route-chips .rchip[data-i="${i}"]`);
  try { chip?.scrollIntoView({ inline: 'nearest', block: 'nearest' }); } catch { /* ignore */ }
  renderSheetBody();
  if (S.map) {
    if (S.routeLayer) S.routeLayer.remove();
    S.routeLayer = o ? drawRoute(S.map, o, { fit: false }) : null;
  }
  setSheet(S.sheet.state);
  fitRoute();
  if (user) pushUrl(currentParams({ opt: i || null }), true);
}

// "paid" is not shown: every lot costs the same flat rate, mentioned once in the sheet details.
function statusBadge(o) { return o.status === 'paid' ? '' : `<span class="status ${esc(o.status)}">${esc(STATUS_LABEL[o.status] || o.status)}</span>`; }

function renderSheetBody() {
  const r = S.result, o = r?.options[S.selected];
  const main = $('#sheet-main'), more = $('#sheet-more');
  const officialLink = r?.destination?.officialUrl ? `<p class="small"><a href="${esc(r.destination.officialUrl)}" target="_blank" rel="noopener">הוראות ההגעה הרשמיות באתר שיבא ↗</a></p>` : '';
  const legal = `<p class="legal"><strong>לא רשמי.</strong> האתר אינו קשור למרכז הרפואי שיבא. המידע עשוי להיות שגוי – תמיד בדקו שילוט במקום. לעולם אל תחנו בנתיבי חירום, חניות נכים או דרכי גישה לכבאות.<br>מפה: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://github.com/omer-erlich/idea1/blob/main/SOURCES.md" target="_blank" rel="noopener">מקורות</a> · <a href="?edit=1">הוספת טיפ</a></p>`;
  if (!o) {
    main.innerHTML = '<p>לא מצאנו כרגע חניה מתאימה עם מסלול הליכה ממופה. השתמשו בהוראות ההגעה הרשמיות.</p>';
    more.innerHTML = officialLink + legal;
    return;
  }
  const p = o.parking;
  const walk = o.noRoute
    ? '<div class="sm-time"><span class="warn">אין מסלול הליכה ממופה</span></div>'
    : `<div class="sm-time"><b>${o.walkMinutes}</b> דק' הליכה <span class="muted">· ${o.meters} מ'</span> · <span class="muted">${o.entrance ? '🚪 ' + esc(o.entrance.name) : 'כניסה ראשית'}</span></div>`;
  main.innerHTML = `<div class="sm-row">${walk}${statusBadge(o)}</div>
    <div class="sm-name">🅿️ ${esc(p.name || 'חניה')}</div>
    ${!p.official ? `<div class="unofficial">⚠️ ${UNOFFICIAL}</div>` : ''}
    <div class="sm-actions">
      ${p.lat != null ? `<a class="btn btn-primary" href="${wazeUrl(p.lat, p.lon)}" target="_blank" rel="noopener">🚗 נווט לחניה</a>` : ''}
      ${!o.noRoute ? '<button class="btn btn-secondary" id="btn-walk">🚶 הליכה</button>' : ''}
    </div>`;

  const v = S.votes.get(p.id);
  const facts = [];
  facts.push(`<li>🅿️ <b>${esc(p.name || 'חניה')}</b> <span class="muted small">· ${esc(TYPE_LABEL[p.type] || '')}${p.official ? ' · חניון רשמי' : ''}</span></li>`);
  if (o.rule?.note) facts.push(`<li>🕒 ${esc(o.rule.note)}</li>`);
  if (o.entrance) facts.push(`<li>🚪 כניסה: <b>${esc(o.entrance.name)}</b>${o.entrance.note ? ` – ${esc(o.entrance.note)}` : ''}</li>`);
  else if (!o.noRoute) facts.push('<li>🚪 הכניסה לבניין לא ממופה – חפשו את הכניסה הראשית</li>');
  if (p.note) facts.push(`<li>ℹ️ ${esc(p.note)}</li>`);
  const warns = [];
  if (o.warnings?.includes('risky')) warns.push('<p class="warn">בשעה זו יש סיכון לדו"ח. אם אפשר – העדיפו חלופה.</p>');
  if (o.warnings?.includes('estimated-route')) warns.push('<p class="warn">חלק מהמסלול משוער לפי המפה ולא נבדק בשטח.</p>');
  if (o.warnings?.includes('entrance-hours-unknown')) warns.push('<p class="warn small">שעות הפתיחה של הכניסה לא ידועות.</p>');
  if (o.noRoute) warns.push('<p class="warn">לא נמצא מסלול הליכה ממופה מהחניון הזה. השתמשו בהוראות הרשמיות.</p>');
  if (v?.flagged) warns.push(`<p class="flag">${v.stale ? 'הטיפ לא אושר כבר יותר מחצי שנה – ייתכן שאינו עדכני.' : 'כמה מבקרים דיווחו שזה לא עבד להם לאחרונה.'}</p>`);
  const verified = o.lastVerified ? `נבדק בשטח לאחרונה: ${fmtDate(o.lastVerified)}` : p.official ? `לפי אתר שיבא (${fmtDate(p.prov?.retrieved) || ''}); לא נבדק בשטח` : 'טרם נבדק בשטח';
  const crowd = v?.up ? ` · אומת על ידי ${v.up} מבקרים` : '';
  const steps = (o.steps || []).length
    ? `<h4>הוראות הליכה</h4><ol class="steps-list">${o.steps.map((s, k) => `<li><span class="step-n">${k + 1}</span><span>${esc(s.text)}${s.indoor ? ' <span class="in-tag">בפנים</span>' : ''}</span></li>`).join('')}</ol>` : '';
  const votes = backendEnabled() && !p.official ? `<div class="votes"><span>עבד לך?</span><button class="btn btn-secondary btn-small" data-vote="1" data-id="${esc(p.id)}">👍 עבד לי</button><button class="btn btn-secondary btn-small" data-vote="-1" data-id="${esc(p.id)}">👎 לא עבד לי</button></div>` : '';
  const price = S.data.meta?.parkingFlatRate?.text;
  more.innerHTML = `<ul class="facts">${facts.join('')}${price ? `<li>💳 ${esc(price)}</li>` : ''}</ul>${warns.join('')}
    <p class="verified">${esc(verified)}${esc(crowd)}</p>
    <div class="more-actions">
      ${p.lat != null ? `<a class="btn btn-secondary" href="${gmapsUrl(p.lat, p.lon)}" target="_blank" rel="noopener">Google Maps</a>` : ''}
      <button class="btn btn-secondary" id="btn-share">🔗 שיתוף</button>
    </div>
    ${steps}${votes}
    <p class="small"><a href="?edit=1&kind=correction&target=${encodeURIComponent(p.id)}&dest=${encodeURIComponent(S.destId)}">דווחו על תיקון</a></p>
    ${officialLink}${legal}`;

  $('#btn-walk')?.addEventListener('click', () => openWalk(S.selected, true));
  $('#btn-share')?.addEventListener('click', share);
  $$('#sheet-more [data-vote]').forEach(b => b.addEventListener('click', async () => {
    try { await vote(b.dataset.id, +b.dataset.vote); toast('תודה! ההצבעה נשמרה'); b.parentElement.querySelectorAll('button').forEach(x => { x.disabled = true; }); }
    catch (e) { toast(/rate|limit|already/i.test(e.message) ? 'כבר הצבעת על זה' : 'לא הצלחנו לשמור – נסו שוב מאוחר יותר'); }
  }));
}

async function share() {
  const data = { title: `${S.result.destination.name} – חניה בשיבא`, url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(location.href); toast('הקישור הועתק'); }
  } catch { /* user cancelled */ }
}

// ---- bottom sheet mechanics (snap points: peek / half / full) ----
function sheetMetrics() {
  const H = window.innerHeight, sheet = $('#sheet');
  const full = Math.round(H * 0.9);
  sheet.style.height = full + 'px';
  const main = $('#sheet-main');
  const peek = Math.max(150, Math.min(full - 140, main.offsetTop + main.offsetHeight + 4));
  return { H, full, peek, half: Math.round((peek + full) / 2) };
}

function setSheet(state, animate = true) {
  const sheet = $('#sheet');
  const m = sheetMetrics();
  const vis = m[state];
  S.sheet = { state, vis, m };
  sheet.dataset.state = state;
  sheet.classList.toggle('dragging', !animate);
  sheet.style.transform = `translateY(${m.full - vis}px)`;
}

function fitRoute() {
  const b = S.routeLayer?._bounds;
  if (!b || !S.map || !S.sheet.m) return;
  const vis = S.sheet.state === 'full' ? S.sheet.m.peek : S.sheet.vis;
  S.map.fitBounds(b, { paddingTopLeft: [18, 130], paddingBottomRight: [18, vis + 18], maxZoom: 18, animate: true });
}

function bindSheetDrag() {
  const sheet = $('#sheet');
  let st = null, suppress = false;
  sheet.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!e.target.closest('#sheet-grab, #sheet-main') || !S.sheet.m) return;
    st = { y0: e.clientY, vis0: S.sheet.vis, moved: false, lastY: e.clientY, lastT: performance.now(), v: 0 };
  });
  sheet.addEventListener('pointermove', e => {
    if (!st) return;
    const dy = e.clientY - st.y0;
    if (!st.moved && Math.abs(dy) > 8) { st.moved = true; sheet.classList.add('dragging'); try { sheet.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
    if (!st.moved) return;
    const now = performance.now();
    st.v = (st.lastY - e.clientY) / Math.max(1, now - st.lastT);   // px/ms, positive = moving up
    st.lastY = e.clientY; st.lastT = now;
    const m = S.sheet.m;
    const vis = Math.max(m.peek - 50, Math.min(m.full, st.vis0 - dy));
    sheet.style.transform = `translateY(${m.full - vis}px)`;
    st.vis = vis;
  });
  const end = e => {
    if (!st) return;
    const s = st; st = null;
    sheet.classList.remove('dragging');
    if (!s.moved) {
      if (e.target.closest('#sheet-grab')) setSheet(S.sheet.state === 'peek' ? 'full' : 'peek'), fitRoute();
      return;
    }
    suppress = true; setTimeout(() => { suppress = false; }, 0);
    const m = S.sheet.m;
    const proj = (s.vis ?? s.vis0) + s.v * 220;
    const target = ['peek', 'half', 'full'].reduce((best, k) => (Math.abs(m[k] - proj) < Math.abs(m[best] - proj) ? k : best), 'peek');
    setSheet(target); fitRoute();
  };
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);
  sheet.addEventListener('click', e => { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
  $('#sheet-grab').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSheet(S.sheet.state === 'peek' ? 'full' : 'peek'); fitRoute(); } });
}

// ---------------------------------------------------------------- walking mode
function openWalk(i, push) {
  const o = S.result?.options[i];
  if (!o || o.noRoute) return;
  if (push) pushUrl(currentParams({ opt: i || null, walk: true }));
  show('walk');
  startWalk(o, { data: S.data, onExit: () => { pushUrl(currentParams({ opt: i || null }), true); renderResult({ keepSheet: true }); } });
}

boot();
