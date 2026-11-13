// Sheba Parking Guide – main app. Google-Maps-style flow:
//   search (28 main places + 500 clinics) → full-screen map + bottom sheet → walking navigation
// How do you get there?  🚗 parking suggestions · 🚌 bus-stop suggestions · 📍 "I'm already here" (you tell us where).
import { $, $$, esc, norm, toast, fmtDate, store, wazeUrl, gmapsUrl } from './util.js';
import { loadStatic, loadApprovedTips, applyTips, applyTipsToTopology, voteMap } from './data.js';
import { CampusRouter } from './engine/campus-router.js';
import { parseWhen, whenFromDate, fmtHM, DAY_NAMES_HE, isOpenAt } from './engine/time.js';
import { createMap, drawLegs } from './ui/map.js';
import { startWalk, stopWalk } from './ui/walk.js';
import { chooseHere } from './ui/whereami.js';
import { indoorHtml } from './ui/indoor.js';
import { t } from './strings.js';
import { backendEnabled } from './config.js';
import { vote } from './backend.js';

const S = {
  base: null, topo: null, data: null, router: null, directory: null, dirReady: null, dests: new Map(), votes: new Map(),
  destId: null, timeParam: 'now', opts: { accessible: false, avoidRisky: false },
  mode: 'car', startNodeId: null, startLabel: null,
  result: null, selected: 0, map: null, routeLayer: null,
  sheet: { state: 'peek', vis: 0, m: null },
};

const UNOFFICIAL = 'טיפ לא רשמי – על אחריותך, בדוק שילוט במקום';
const STATUS_LABEL = { ok: 'אין מגבלה ידועה בשעה זו', paid: 'בתשלום', risky: 'בסיכון לדו"ח' };
const TYPE_LABEL = { garage: 'חניון מקורה', lot: 'מגרש חניה', street: 'חניה ברחוב' };
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayName = d => DAYS[d];
const MAX_LIST = 60;

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
  try {
    const [base, topo] = await Promise.all([loadStatic(), fetchJson('data/topology.json')]);
    S.base = base; S.topo = topo; S.data = base;
  } catch { $('#main').innerHTML = '<p class="notice">לא הצלחנו לטעון את הנתונים. בדקו חיבור ונסו שוב.</p>'; return; }
  S.router = new CampusRouter(S.topo, S.data);
  S.opts = { ...S.opts, ...store.get('opts', {}) };
  buildDestinations();
  S.dirReady = fetchJson('data/clinics-directory.json').then(d => { S.directory = d.clinics; buildDestinations(); renderDestList(); }).catch(() => { S.directory = []; });
  initUi();
  await routeFromUrl();
  window.addEventListener('popstate', routeFromUrl);
  // crowd tips arrive later (network) – they add lots / doors / shortcuts to the campus graph
  loadApprovedTips().then(({ tips, votes, offline }) => {
    if (tips.length) { S.data = applyTips(S.base, tips); S.router = new CampusRouter(applyTipsToTopology(S.topo, tips), S.data); }
    S.votes = voteMap(votes, tips);
    if (offline) showNet('מצב לא מקוון – מוצגים טיפים שנשמרו בביקור הקודם');
    buildDestinations(); renderDestList();
    if (S.destId && !$('#screen-result').hidden) renderResult({ keepSheet: true });
  });
  window.addEventListener('offline', () => showNet('אין חיבור לאינטרנט – האפליקציה ממשיכה לעבוד עם המידע השמור'));
  window.addEventListener('online', () => showNet(null));
}

async function fetchJson(url) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
function showNet(msg) { const el = $('#net-status'); el.hidden = !msg; el.textContent = msg || ''; }
function registerSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ---------------------------------------------------------------- destinations: 28 main places + every clinic we know about
const bld = id => S.router.buildings.get(id)?.name?.split('(')[0].trim() || null;
function buildDestinations() {
  const m = new Map();
  const osmKey = new Map((S.topo.buildings || []).filter(b => b.osm).map(b => [b.osm, b.id]));
  for (const d of S.base.destinations) m.set(d.id, { id: d.id, name: d.name, aliases: d.aliases || [], buildingName: bld(osmKey.get(d.buildingId)), floor: d.floor, topoNode: d.topoNode || null, officialUrl: d.officialUrl, hint: d.hint, kind: 'dest' });
  for (const c of S.directory || []) {
    if (c.inApp) continue;
    const nid = `clinic:${c.id}`, node = S.router.nodes.get(nid);
    m.set('c:' + c.id, { id: 'c:' + c.id, name: c.name, aliases: [], buildingName: bld(node?.building || c.location?.building), floor: node?.floor ?? c.location?.floor ?? null, topoNode: node ? nid : null,
      officialUrl: `https://www.sheba.co.il/${c.href.replace(/^\/+/, '')}`, hint: c.location?.text || null, kind: 'clinic', unlocated: !node });
  }
  S.dests = m;
}

// ---------------------------------------------------------------- URL ⇄ screen
async function routeFromUrl() {
  const q = new URLSearchParams(location.search);
  S.timeParam = q.get('time') || 'now';
  if (q.has('acc')) S.opts.accessible = q.get('acc') === '1';
  if (q.has('safe')) S.opts.avoidRisky = q.get('safe') === '1';
  S.mode = ['bus', 'here'].includes(q.get('mode')) ? q.get('mode') : 'car';
  S.startNodeId = null; S.startLabel = null;
  if (S.mode === 'here') {
    const from = q.get('from');
    if (from && S.router.nodes.has(from)) { S.startNodeId = from; S.startLabel = placeLabel(from); }
  }
  syncControls();
  const dest = q.get('dest');
  if (dest && dest.startsWith('c:') && !S.dests.has(dest)) await S.dirReady;
  if (dest && S.dests.has(dest)) {
    S.destId = dest;
    S.selected = +(q.get('opt') || 0) || 0;
    renderResult({});
    if (q.get('walk') === '1') openWalk(S.selected, false);
  } else { S.destId = null; show('picker'); }
}

function pushUrl(params, replace = false) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '' && v !== false) q.set(k, v === true ? '1' : v);
  const url = location.pathname + (q.toString() ? '?' + q.toString().replace(/%3A/g, ':').replace(/%2F/g, '/') : '');
  (replace ? history.replaceState : history.pushState).call(history, null, '', url);
}
const currentParams = (extra = {}) => ({ dest: S.destId, time: S.timeParam !== 'now' ? S.timeParam : null, acc: S.opts.accessible || null, safe: S.opts.avoidRisky || null,
  mode: S.mode !== 'car' ? S.mode : null, from: S.mode === 'here' ? S.startNodeId : null, ...extra });

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
  $('#search').placeholder = 'לאן? למשל MRI, מכון הלב, מרפאת כתף…';
  $$('#time-row [data-time]').forEach(b => b.addEventListener('click', () => {
    const tm = b.dataset.time;
    if (tm === 'custom') {
      const open = $('#custom-time').hidden;
      $('#custom-time').hidden = !open;
      if (open) setCustomTime(); else syncControls();
    } else {
      $('#custom-time').hidden = true;
      S.timeParam = tm === 'now' ? 'now' : dayName(new Date().getDay()) + '-' + tm;
      onOptsChange();
    }
  }));
  days.addEventListener('change', setCustomTime);
  $('#time-input').addEventListener('change', setCustomTime);
  $('#opt-accessible').addEventListener('click', () => { S.opts.accessible = !S.opts.accessible; onOptsChange(); });
  $('#opt-safe').addEventListener('click', () => { S.opts.avoidRisky = !S.opts.avoidRisky; onOptsChange(); });
  $('#btn-home').addEventListener('click', goHome);
  $('#res-back').addEventListener('click', goHome);
  $('#chip-mode').addEventListener('click', openOpts);
  $('#chip-opts').addEventListener('click', openOpts);
  $('#opts-close').addEventListener('click', closeOpts);
  $('#opts-modal').addEventListener('click', e => { if (e.target.id === 'opts-modal') closeOpts(); });
  $('#indoor-close').addEventListener('click', () => { $('#indoor-overlay').hidden = true; });
  $('#indoor-overlay').addEventListener('click', e => { if (e.target.id === 'indoor-overlay') e.currentTarget.hidden = true; });
  $$('#mode-row .mode').forEach(b => b.addEventListener('click', () => { closeOpts(); setMode(b.dataset.mode); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#opts-modal').hidden) closeOpts(); $('#indoor-overlay').hidden = true; } });
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
    const tm = b.dataset.time;
    const on = tm === 'now' ? S.timeParam === 'now' : tm === 'custom' ? customOpen : (isToday && m && m[1] === tm && !customOpen);
    b.setAttribute('aria-pressed', String(!!on));
  });
  if (m && S.timeParam !== 'now') {
    $('#time-input').value = m[1];
    if (prefix) $('#day-select').value = String(DAYS.indexOf(prefix));
  }
  $$('#mode-row .mode').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
  $('#opt-safe').hidden = S.mode !== 'car';
  const modeLbl = { car: '🚗 בנסיעה', bus: '🚌 באוטובוס', here: '📍 כבר בשיבא' };
  $('#chip-mode').textContent = `${modeLbl[S.mode]} ▾`;
  const nonDefault = S.timeParam !== 'now' || S.opts.accessible || S.opts.avoidRisky;
  $('#chip-opts').classList.toggle('on-dot', !!nonDefault);
}

/** Alternatives live in the options sheet (like Waze): the main screen shows only the best option. */
function renderAlts() {
  const r = S.result, opts = r?.options || [];
  $('#alt-block').hidden = opts.length < 2;
  $('#alt-list').innerHTML = opts.map((o, i) => {
    const tag = o.kind === 'bus' ? t('tagStop') : o.kind === 'here' ? t('tagHere') : o.fallback ? t('tagFallback') : i === 0 ? t('tagRec') : t('tagAlt');
    const name = o.kind === 'bus' ? placeLabel(o.stop.id) : o.kind === 'here' ? (S.startLabel || 'המיקום שלי') : (o.parking.name || 'חניה');
    return `<button class="rchip" data-i="${i}" aria-pressed="${i === S.selected}"><span class="rc-min">${o.walkMinutes}<small>דק'</small></span><span class="grow"><span class="rc-tag">${esc(tag)}</span><br><span class="rc-name">${esc(name)}</span></span></button>`;
  }).join('');
  $$('#alt-list .rchip').forEach(c => c.addEventListener('click', () => { closeOpts(); selectOption(+c.dataset.i, true); }));
}

function openOpts() { renderAlts(); $('#opts-modal').hidden = false; }
function closeOpts() { $('#opts-modal').hidden = true; }

function renderDestList() {
  if (!S.router) return;
  const q = norm($('#search').value);
  const last = store.get('lastDest');
  const all = [...S.dests.values()];
  let list = q
    ? all.filter(d => norm(d.name).includes(q) || d.aliases.some(a => norm(a).includes(q)))
    : all.filter(d => d.kind === 'dest');
  if (!q && last) list.sort((a, b) => (b.id === last) - (a.id === last));
  if (q) list.sort((a, b) => (a.kind === 'dest' ? 0 : 1) - (b.kind === 'dest' ? 0 : 1) || (norm(a.name).startsWith(q) ? 0 : 1) - (norm(b.name).startsWith(q) ? 0 : 1));
  const total = list.length;
  list = list.slice(0, MAX_LIST);
  $('#list-label').textContent = q ? `${total} תוצאות` : 'יעדים מרכזיים · ' + t('clinicsHint');
  $('#dest-list').innerHTML = list.map(d => {
    const sub = [d.buildingName, d.floor != null && d.floor !== '' ? `קומה ${d.floor}` : null, d.unlocated ? t('unlocatedBadge') : null].filter(Boolean).join(' · ');
    const isLast = d.id === last && !q;
    return `<li><button class="dest-row" data-id="${esc(d.id)}"><span class="dest-ico${isLast ? ' last' : ''}" aria-hidden="true">${isLast ? '🕘' : d.unlocated ? '❔' : '📍'}</span>
      <span class="dest-txt"><b>${esc(d.name)}</b>${sub || isLast ? `<span class="sub">${isLast ? 'האחרון שבחרת' + (sub ? ' · ' : '') : ''}${esc(sub)}</span>` : ''}</span><span class="dest-chev" aria-hidden="true">‹</span></button></li>`;
  }).join('') + (total > MAX_LIST ? `<li class="muted small" style="padding:10px 4px">${esc(t('moreResults', { n: total - MAX_LIST }))}</li>` : '');
  $('#no-results').hidden = total > 0;
  $$('#dest-list .dest-row').forEach(btn => btn.addEventListener('click', () => {
    S.destId = btn.dataset.id; S.selected = 0;
    S.mode = store.get('mode') === 'bus' ? 'bus' : 'car'; S.startNodeId = null; S.startLabel = null;
    store.set('lastDest', S.destId);
    pushUrl(currentParams());
    renderResult({});
  }));
}

// ---------------------------------------------------------------- start mode (car / bus / here)
async function setMode(mode) {
  if (mode === S.mode && !(mode === 'here' && !S.startNodeId)) return;
  const prev = S.mode;
  S.mode = mode; S.selected = 0;
  if (mode !== 'here') store.set('mode', mode);
  if (mode === 'here' && !S.startNodeId) {
    if (!(await pickStart({}))) { S.mode = prev; syncControls(); return; }
  }
  syncControls();
  pushUrl(currentParams(), true);
  renderResult({ keepSheet: true });
}

async function pickStart(preset) {
  const r = await chooseHere({ router: S.router, preset });
  if (!r) return false;
  S.startNodeId = r.nodeId; S.startLabel = r.label;
  return true;
}
const placeLabel = id => (S.router.nodes.get(id)?.label || '').split('·')[0].replace(/^תחנה:\s*/, '').trim();

// ---------------------------------------------------------------- result: map + bottom sheet
const whenNow = () => (S.timeParam === 'now' ? whenFromDate() : parseWhen(S.timeParam));

function recommend() {
  const d = S.dests.get(S.destId);
  if (!d.topoNode) return { destination: d, options: [], excluded: [], noRoute: true };
  return S.router.recommend(d.topoNode, d, whenNow(), { ...S.opts, mode: S.mode, startNodeId: S.startNodeId, votes: S.votes });
}

function renderResult({ keepSheet = false } = {}) {
  const when = whenNow();
  const r = recommend();
  S.result = r;
  if (S.selected >= r.options.length) S.selected = 0;
  show('result');
  syncControls();
  const d = r.destination;
  $('#result-title').textContent = d.name;
  $('#result-when').textContent = [d.buildingName, d.floor != null && d.floor !== '' ? `קומה ${d.floor}` : null].filter(Boolean).join(' · ') +
    ` · ${S.timeParam === 'now' ? 'עכשיו' : 'יום ' + DAY_NAMES_HE[when.day] + ' ' + fmtHM(when.minutes)}${S.opts.accessible ? ' · ♿' : ''}`;
  const closedGates = S.mode === 'car' ? (S.data.gates || []).filter(g => g.hours && !isOpenAt(g.hours, when).open) : [];
  $('#gate-notice').hidden = !closedGates.length;
  if (closedGates.length) $('#gate-notice').textContent = `בשעה זו סגורים: ${closedGates.map(g => g.name).join(', ')}. היכנסו בשער הראשי.`;

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
  renderSheetBody();
  if (S.map) {
    if (S.routeLayer) S.routeLayer.remove();
    S.routeLayer = o ? drawLegs(S.map, o, { fit: false }) : null;
  }
  setSheet(S.sheet.state);
  fitRoute();
  if (user) pushUrl(currentParams({ opt: i || null }), true);
}

function statusBadge(o) { return !o.status || o.status === 'paid' ? '' : `<span class="status ${esc(o.status)}">${esc(STATUS_LABEL[o.status] || o.status)}</span>`; }

function renderSheetBody() {
  const r = S.result, o = r?.options[S.selected];
  const main = $('#sheet-main'), more = $('#sheet-more');
  const d = r?.destination;
  const officialLink = d?.officialUrl ? `<p class="small"><a href="${esc(d.officialUrl)}" target="_blank" rel="noopener">${d.kind === 'clinic' ? 'עמוד המרפאה באתר שיבא' : 'הוראות ההגעה הרשמיות באתר שיבא'} ↗</a></p>` : '';
  const legal = `<p class="legal"><strong>לא רשמי.</strong> האתר אינו קשור למרכז הרפואי שיבא. המידע עשוי להיות שגוי – תמיד בדקו שילוט במקום. לעולם אל תחנו בנתיבי חירום, חניות נכים או דרכי גישה לכבאות.<br>מפה: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://github.com/omer-erlich/idea1/blob/main/SOURCES.md" target="_blank" rel="noopener">מקורות</a> · <a href="?edit=1">הוספת טיפ</a></p>`;
  if (!o) {
    const msg = r?.noRoute ? `<b>${t('noRouteTitle')}</b><br>${t('noRouteBody')}${d?.hint ? `<br><span class="muted small">באתר שיבא: ${esc(d.hint)}</span>` : ''}`
      : r?.needsStart ? t('hereNeedStart') : S.mode === 'here' ? t('hereUnreachable') : 'לא מצאנו כרגע אפשרות מתאימה עם מסלול הליכה ממופה. השתמשו בהוראות ההגעה הרשמיות.';
    main.innerHTML = `<p>${msg}</p>${r?.needsStart ? `<div class="sm-actions"><button class="btn btn-primary" id="btn-change-here">${t('btnChangeHere')}</button></div>` : ''}${r?.noRoute ? `<div class="sm-actions"><a class="btn btn-secondary" href="?edit=1&kind=destination&id=${encodeURIComponent(d.id)}">${t('noRouteHelp')}</a></div>` : ''}`;
    more.innerHTML = officialLink + legal;
    $('#btn-change-here')?.addEventListener('click', async () => { if (await pickStart({})) { pushUrl(currentParams(), true); renderResult({ keepSheet: true }); } });
    return;
  }
  const p = o.parking;
  const walk = `<div class="sm-time"><b>${o.walkMinutes}</b> דק' הליכה <span class="muted">· ${o.meters} מ'</span>${o.entrance ? ` · <span class="muted">🚪 ${esc(o.entrance.name)}</span>` : ''}</div>`;
  const title = o.kind === 'bus' ? `🚌 ${esc(placeLabel(o.stop.id))}` : o.kind === 'here' ? `📍 ${esc(S.startLabel || 'המיקום שלי')}` : `🅿️ ${esc(p.name || 'חניה')}`;
  let actions = '';
  if (o.kind === 'parking' && p.lat != null) actions = `<a class="btn btn-primary" href="${wazeUrl(p.lat, p.lon)}" target="_blank" rel="noopener">🚗 נווט לחניה</a><button class="link-btn" id="btn-walk">🚶 התחל הליכה</button>`;
  else if (o.kind === 'bus') actions = `<a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${o.stop.lat},${o.stop.lon}&travelmode=transit" target="_blank" rel="noopener">${t('btnNavStop')}</a><button class="link-btn" id="btn-walk">🚶 התחל הליכה</button>`;
  else actions = `<button class="btn btn-primary" id="btn-walk">${t('btnStartWalk')}</button><button class="link-btn" id="btn-change-here">${t('btnChangeHere')}</button>`;
  main.innerHTML = `<div class="sm-row">${walk}${statusBadge(o)}</div>
    <div class="sm-name">${title}</div>
    ${o.kind === 'parking' && !p.official ? `<div class="unofficial">⚠️ ${UNOFFICIAL}</div>` : ''}
    <div class="sm-actions">${actions}</div>
    ${r.options.length > 1 ? `<button class="link-btn alt-link" id="btn-alts">${esc(t('altLink', { n: r.options.length - 1 }))}</button>` : ''}`;

  const v = p ? S.votes.get(p.id) : null;
  const facts = [];
  if (o.kind === 'parking') {
    facts.push(`<li>🅿️ <b>${esc(p.name || 'חניה')}</b> <span class="muted small">· ${esc(TYPE_LABEL[p.type] || '')}${p.official ? ' · חניון רשמי' : ''}</span></li>`);
    if (o.rule?.note) facts.push(`<li>🕒 ${esc(o.rule.note)}</li>`);
    if (p.note) facts.push(`<li>ℹ️ ${esc(p.note)}</li>`);
  } else if (o.kind === 'bus') {
    const lines = o.stop.lines;
    facts.push(`<li>🚌 <b>${esc(placeLabel(o.stop.id))}</b></li>`);
    facts.push(`<li>${lines?.length ? esc(t('busLines', { lines: lines.join(', ') })) : esc(t('busNoLines'))}</li>`);
  } else facts.push(`<li>📍 ${esc(t('hereChosen', { place: S.startLabel || '' }))}</li>`);
  if (o.entrance) facts.push(`<li>🚪 כניסה: <b>${esc(o.entrance.name)}</b>${o.entrance.note ? ` – ${esc(o.entrance.note)}` : ''}</li>`);
  const price = S.data.meta?.parkingFlatRate?.text;
  const warns = [];
  if (o.warnings?.includes('risky')) warns.push('<p class="warn">בשעה זו יש סיכון לדו"ח. אם אפשר – העדיפו חלופה.</p>');
  if (o.warnings?.includes('estimated-route')) warns.push('<p class="warn">חלק מהמסלול (בעיקר בפנים) משוער ולא נמדד בשטח.</p>');
  if (o.warnings?.includes('inferred-link')) warns.push('<p class="warn">חלק מהמעברים בבניינים לא מאומתים – אם משהו לא תואם, השתמשו בשלט "לא בטוח איפה אני".</p>');
  if (S.opts.accessible) warns.push(`<p class="warn">♿ ${esc(t('accessibleCaveat'))}</p>`);
  if (o.warnings?.includes('entrance-hours-unknown')) warns.push('<p class="warn small">שעות הפתיחה של הכניסה לא ידועות.</p>');
  if (v?.flagged) warns.push(`<p class="flag">${v.stale ? 'הטיפ לא אושר כבר יותר מחצי שנה – ייתכן שאינו עדכני.' : 'כמה מבקרים דיווחו שזה לא עבד להם לאחרונה.'}</p>`);
  const verified = o.kind !== 'parking' ? 'מסלול חישובי – טרם נבדק בשטח' : o.lastVerified ? `נבדק בשטח לאחרונה: ${fmtDate(o.lastVerified)}` : p.official ? `לפי אתר שיבא (${fmtDate(p.prov?.retrieved) || ''}); לא נבדק בשטח` : 'טרם נבדק בשטח';
  const crowd = v?.up ? ` · אומת על ידי ${v.up} מבקרים` : '';
  const steps = (o.steps || []).length
    ? `<h4>הוראות הליכה</h4><ol class="steps-list">${o.steps.map((s, k) => `<li><span class="step-n">${k + 1}</span><span>${esc(s.text)}${s.indoor ? ' <span class="in-tag">בפנים</span>' : ''}</span></li>`).join('')}</ol>` : '';
  const votes = backendEnabled() && p && !p.official ? `<div class="votes"><span>עבד לך?</span><button class="btn btn-secondary btn-small" data-vote="1" data-id="${esc(p.id)}">👍 עבד לי</button><button class="btn btn-secondary btn-small" data-vote="-1" data-id="${esc(p.id)}">👎 לא עבד לי</button></div>` : '';
  const gm = o.kind === 'parking' && p.lat != null ? `<a class="btn btn-secondary" href="${gmapsUrl(p.lat, p.lon)}" target="_blank" rel="noopener">Google Maps</a>` : '';
  const indoorBtn = o.indoor?.length ? `<button class="btn btn-secondary" id="btn-indoor">${t('btnIndoor')}</button>` : '';
  more.innerHTML = `<ul class="facts">${facts.join('')}${o.kind === 'parking' && price ? `<li>💳 ${esc(price)}</li>` : ''}</ul>${warns.join('')}
    <p class="verified">${esc(verified)}${esc(crowd)}</p>
    <div class="more-actions">${indoorBtn}${gm}<button class="btn btn-secondary" id="btn-share">🔗 שיתוף</button></div>
    ${steps}${votes}
    <p class="small"><a href="?edit=1&kind=correction&target=${encodeURIComponent(p ? p.id : d.id)}&dest=${encodeURIComponent(S.destId)}">דווחו על תיקון</a></p>
    ${officialLink}${legal}`;

  $('#btn-walk')?.addEventListener('click', () => openWalk(S.selected, true));
  $('#btn-share')?.addEventListener('click', share);
  $('#btn-alts')?.addEventListener('click', openOpts);
  $('#btn-indoor')?.addEventListener('click', () => { $('#indoor-body').innerHTML = indoorHtml(o); $('#indoor-overlay').hidden = false; });
  $('#btn-change-here')?.addEventListener('click', async () => { if (await pickStart({})) { pushUrl(currentParams(), true); renderResult({ keepSheet: true }); } });
  $$('#sheet-more [data-vote]').forEach(b => b.addEventListener('click', async () => {
    try { await vote(b.dataset.id, +b.dataset.vote); toast('תודה! ההצבעה נשמרה'); b.parentElement.querySelectorAll('button').forEach(x => { x.disabled = true; }); }
    catch (e) { toast(/rate|limit|already/i.test(e.message) ? 'כבר הצבעת על זה' : 'לא הצלחנו לשמור – נסו שוב מאוחר יותר'); }
  }));
}

async function share() {
  const data = { title: `${S.result.destination.name} – שיבא`, url: location.href };
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
  S.map.fitBounds(b, { paddingTopLeft: [18, 130], paddingBottomRight: [18, vis + 18], maxZoom: 19, animate: true });
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
      if (e.target.closest('#sheet-grab')) { setSheet(S.sheet.state === 'peek' ? 'full' : 'peek'); fitRoute(); }
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
function openWalk(i, push, startIndex = 0) {
  const o = S.result?.options[i];
  if (!o) return;
  if (push) pushUrl(currentParams({ opt: i || null, walk: true }));
  show('walk');
  startWalk(o, { data: S.data, router: S.router, startIndex, onExit: () => { pushUrl(currentParams({ opt: i || null }), true); renderResult({ keepSheet: true }); }, onRelocate: ctx => relocate(i, ctx) });
}

/** The user is not where we expected (GPS is poor indoors): ask where they are, then route again from there. */
async function relocate(i, ctx) {
  const preset = ctx.building ? { building: ctx.building, floor: ctx.floor ?? null } : {};
  const r = await chooseHere({ router: S.router, preset, title: ctx.reason === 'floor-mismatch' ? t('floorMismatch') : undefined });
  if (!r) { show('walk'); startWalk(ctx.option, { data: S.data, router: S.router, startIndex: ctx.index, onExit: () => { pushUrl(currentParams({ opt: i || null }), true); renderResult({ keepSheet: true }); }, onRelocate: c => relocate(i, c) }); return; }
  const prev = { mode: S.mode, startNodeId: S.startNodeId, startLabel: S.startLabel };
  S.mode = 'here'; S.startNodeId = r.nodeId; S.startLabel = r.label;
  const rec = recommend();
  if (!rec.options.length) {
    toast(t('hereUnreachable'));
    Object.assign(S, { mode: prev.mode, startNodeId: prev.startNodeId, startLabel: prev.startLabel });
    show('walk'); startWalk(ctx.option, { data: S.data, router: S.router, startIndex: ctx.index, onExit: () => { pushUrl(currentParams({ opt: i || null }), true); renderResult({ keepSheet: true }); }, onRelocate: c => relocate(i, c) });
    return;
  }
  S.result = rec; S.selected = 0;
  pushUrl(currentParams({ walk: true }), true);
  toast(t('rerouted', { place: r.label }), 4000);
  openWalk(0, false);
}

boot();
