// "Indoor view": the part of the route inside buildings as a floor-by-floor timeline.
// There are no floor plans, so this is schematic: the ORDER of places and the floors are right, lengths are estimates.
import { esc } from '../util.js';
import { t } from '../strings.js';

const ICON = { lobby: '🏛', hall: '➡️', elevator: '🛗', stairs: '🪜', admin: '🛎', other: '📍', clinic: '🏥', room: '🚪' };
const VIA = { 'floor-exit': '🛗', elevator: '🛗', stairs: '🪜', passage: '↔', 'moving-walkway': '⇒', hallway: '', link: '' };

export function indoorHtml(option) {
  const segs = option?.indoor || [];
  if (!segs.length) return `<p class="muted">${t('indoorAllOutside')}</p>`;
  let html = `<p class="small muted">${t('indoorNote')}</p>`;
  for (const s of segs) {
    html += `<h4 class="in-building">🏢 ${esc(s.buildingName)}</h4><ol class="in-line">`;
    let lastFloor = null;
    for (const n of s.nodes) {
      if (n.floor !== lastFloor) { html += `<li class="in-floor">${esc(t('indoorFloor', { floor: n.floor ?? '?' }))}</li>`; lastFloor = n.floor; }
      html += `<li class="in-node kind-${esc(n.kind)}"><span class="in-ico">${VIA[n.via] ? esc(VIA[n.via]) : esc(ICON[n.kind] || '•')}</span><span class="grow">${esc(n.label.split('·')[0])}</span>${n.est ? `<span class="in-est">~${n.sec} ש' · ${t('indoorEst')}</span>` : `<span class="in-est ok">${n.sec} ש'</span>`}</li>`;
    }
    html += '</ol>';
  }
  return html;
}
