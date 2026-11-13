// "Where are you?" – GPS is unreliable inside buildings, so the user tells us (or confirms) where they are.
// Resolves with {nodeId, label} of a node of the campus graph, or null if cancelled.
import { esc } from '../util.js';
import { t } from '../strings.js';

const ICON = { lobby: '🏛', hall: '➡️', elevator: '🛗', stairs: '🪜', admin: '🛎', other: '📍', clinic: '🏥', room: '🚪', entrance: '🚪', busstop: '🚌', parking: '🅿️', junction: '📍' };

export function chooseHere({ router, preset = {}, title, autoGps = true } = {}) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.id = 'here-modal';
    modal.innerHTML = '<div class="modal-card here-card" role="dialog" aria-modal="true"></div>';
    document.body.append(modal);
    const card = modal.firstElementChild;
    const st = { view: 'main', building: preset.building || null, floor: preset.floor ?? null, gps: null, gpsMsg: '' };
    const done = r => { modal.remove(); document.removeEventListener('keydown', onKey); resolve(r); };
    const onKey = e => { if (e.key === 'Escape') done(null); };
    document.addEventListener('keydown', onKey);
    modal.addEventListener('click', e => { if (e.target === modal) done(null); });
    const bname = id => router.buildings.get(id)?.name?.split('(')[0].trim() || id;
    const pick = id => { const n = router.nodes.get(id); done({ nodeId: id, label: n.label.split('·')[0].replace(/^תחנה:\s*/, '').trim() }); };
    if (st.building && st.floor != null) st.view = 'places'; else if (st.building) st.view = 'floors';

    function render() {
      if (st.view === 'main') {
        const buildings = [...router.buildings.values()].map(b => ({ b, n: router.placesIn(b.id).reduce((s, f) => s + f.places.length, 0) })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
        card.innerHTML = `<div class="modal-head"><b>${esc(title || t('hereTitle'))}</b><button class="btn btn-secondary btn-small" data-act="cancel">${t('hereCancel')}</button></div>
          <p class="muted small">${t('hereSub')}</p>
          <button class="btn btn-primary btn-wide" data-act="gps" style="width:100%">${t('hereGps')}</button>
          <div id="here-gps" class="here-list">${st.gpsMsg}</div>
          <input id="here-q" type="search" class="here-q" placeholder="${esc(t('hereSearch'))}" autocomplete="off">
          <div id="here-results" class="here-list"></div>
          <p class="list-label">${t('hereBuilding')}</p>
          <div class="here-list">${buildings.map(x => `<button class="here-row" data-b="${esc(x.b.id)}"><span>🏢</span><span class="grow">${esc(bname(x.b.id))}</span><span class="muted small">${x.n}</span></button>`).join('')}</div>`;
        const q = card.querySelector('#here-q');
        q.addEventListener('input', () => {
          const hits = router.search(q.value, 14);
          card.querySelector('#here-results').innerHTML = hits.map(n => row(n)).join('');
        });
      } else if (st.view === 'floors') {
        const floors = router.floorsOf(st.building);
        card.innerHTML = `<div class="modal-head"><b>${esc(bname(st.building))}</b><button class="btn btn-secondary btn-small" data-act="back">‹</button></div>
          <p class="list-label">${t('hereFloor')}</p>
          <div class="seg">${floors.map(f => `<button type="button" data-f="${esc(f)}" aria-pressed="${f === String(st.floor)}">${esc(f)}</button>`).join('')}</div>
          <p><button class="link-btn" data-act="main">${t('hereOther')}</button></p>`;
      } else {
        const fl = router.placesIn(st.building).find(f => f.floor === String(st.floor));
        const floorNode = router.floorNode(st.building, st.floor);
        card.innerHTML = `<div class="modal-head"><b>${esc(bname(st.building))} · ${esc(t('indoorFloor', { floor: st.floor }))}</b><button class="btn btn-secondary btn-small" data-act="back">‹</button></div>
          ${floorNode ? `<button class="here-row" data-n="${esc(floorNode.id)}"><span>🧭</span><span class="grow">${esc(t('hereFloorOnly', { floor: st.floor }))}</span></button>` : ''}
          <p class="list-label">${t('hereWhere')}</p>
          <div class="here-list">${(fl?.places || []).map(n => row(n)).join('')}</div>
          <p><button class="link-btn" data-act="main">${t('hereOther')}</button></p>`;
      }
    }
    const row = n => `<button class="here-row" data-n="${esc(n.id)}"><span>${ICON[n.kind] || '📍'}</span><span class="grow">${esc(n.label.replace(/^תחנה:\s*/, ''))}</span><span class="muted small">${n.building ? esc(bname(n.building)) : ''}${n.floor != null && n.building ? ' · ' + esc(n.floor) : ''}</span></button>`;

    card.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'cancel') return done(null);
      if (b.dataset.act === 'back') { if (st.view === 'places') { st.view = 'floors'; } else { st.view = 'main'; st.building = null; } return render(); }
      if (b.dataset.act === 'main') { st.view = 'main'; st.building = null; st.floor = null; return render(); }
      if (b.dataset.act === 'gps') return useGps();
      if (b.dataset.b) { st.building = b.dataset.b; st.view = 'floors'; return render(); }
      if (b.dataset.f != null) { st.floor = b.dataset.f; st.view = 'places'; return render(); }
      if (b.dataset.n) return pick(b.dataset.n);
      if (b.dataset.gpsb) { st.building = b.dataset.gpsb; st.view = 'floors'; return render(); }
    });

    function useGps() {
      const box = card.querySelector('#here-gps');
      box.innerHTML = `<p class="muted small">${t('hereGpsWait')}</p>`;
      if (!navigator.geolocation) { box.innerHTML = `<p class="warn">${t('hereGpsFail')}</p>`; return; }
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        const g = router.suggestHere(lat, lon, accuracy);
        let html = `<p class="here-maybe"><b>${t('hereMaybe')}</b> <span class="muted small">${esc(t('hereAcc', { m: g.accuracy }))}${g.poor ? ' · ' + esc(t('hereAccLow')) : ''}</span></p>`;
        for (const sg of g.suggestions) {
          if (sg.type === 'building') html += `<button class="here-row here-guess" data-gpsb="${esc(sg.id)}"><span>🏢</span><span class="grow">${esc(t('hereInside', { building: sg.label }))}${sg.inside ? '' : ` <span class="muted small">${sg.dist} מ׳</span>`}</span><span class="here-yes">${t('hereYesHere')}</span></button>`;
          else html += `<button class="here-row here-guess" data-n="${esc(sg.node.id)}"><span>${ICON[sg.node.kind] || '📍'}</span><span class="grow">${esc(t('hereOutside', { place: sg.label }))} <span class="muted small">${sg.dist} מ׳</span></span><span class="here-yes">${t('hereYesHere')}</span></button>`;
        }
        if (!g.suggestions.length) html += `<p class="warn">${t('hereNoBuilding')}</p>`;
        box.innerHTML = html;
      }, () => { box.innerHTML = `<p class="warn">${t('hereGpsFail')}</p>`; }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 5000 });
    }
    render();
    if (st.view === 'main' && !preset.building && autoGps && navigator.geolocation) useGps();
  });
}
