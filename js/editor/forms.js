// Small form widgets shared by the editor and the admin page.
import { esc } from '../util.js';
import { DAY_NAMES_HE } from '../engine/time.js';

const SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
export const STATUS_OPTIONS = [['ok', 'מותר / בסדר'], ['paid', 'בתשלום'], ['risky', 'סיכון לדו"ח'], ['forbidden', 'אסור / לא להמליץ']];

/** Editor for time windows; withStatus=true for parking rules. */
export function windowsEditor(container, windows = [], { withStatus = false } = {}) {
  container.innerHTML = '';
  const list = document.createElement('div'); list.className = 'form';
  const add = document.createElement('button'); add.type = 'button'; add.className = 'btn btn-secondary btn-small';
  add.textContent = withStatus ? '+ הוספת כלל זמן' : '+ הוספת שעות';
  container.append(list, add);
  const addRow = (w = { days: [0, 1, 2, 3, 4, 5, 6], from: '08:00', to: '20:00', status: 'ok', note: '' }) => {
    const row = document.createElement('div'); row.className = 'rule-row';
    row.innerHTML = `<div class="days" role="group" aria-label="ימים">${SHORT.map((d, i) => `<label title="${DAY_NAMES_HE[i]}"><input type="checkbox" value="${i}" ${(w.days || []).includes(i) ? 'checked' : ''}>${d}</label>`).join('')}</div>
      <label>מ-<input type="time" class="from" value="${esc(w.from)}"></label>
      <label>עד<input type="time" class="to" value="${esc(w.to === '24:00' ? '23:59' : w.to)}"></label>
      ${withStatus ? `<label>מצב<select class="status">${STATUS_OPTIONS.map(([v, l]) => `<option value="${v}" ${w.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>הערה<input type="text" class="note" maxlength="120" value="${esc(w.note || '')}" placeholder="למשל: שלט 'לרכבי שירות' ביום"></label>` : ''}
      <button type="button" class="link-btn del">מחיקה</button>`;
    row.querySelector('.del').onclick = () => row.remove();
    list.append(row);
  };
  add.onclick = () => addRow();
  (windows.length ? windows : withStatus ? [undefined] : []).forEach(w => addRow(w));
  return {
    read() {
      return [...list.querySelectorAll('.rule-row')].map(r => {
        let to = r.querySelector('.to').value || '24:00';
        if (to === '23:59') to = '24:00';
        const w = { days: [...r.querySelectorAll('.days input:checked')].map(x => +x.value), from: r.querySelector('.from').value || '00:00', to };
        if (withStatus) { w.status = r.querySelector('.status').value; const n = r.querySelector('.note').value.trim(); if (n) w.note = n.slice(0, 120); }
        return w;
      }).filter(w => w.days.length);
    },
  };
}

export function seg(name, options, value) {
  return `<div class="seg" role="group" data-seg="${name}">${options.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === value}">${l}</button>`).join('')}</div>`;
}
export function bindSeg(root, name, onChange) {
  const el = root.querySelector(`[data-seg="${name}"]`);
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    onChange?.(b.dataset.v);
  }));
  return () => el.querySelector('[aria-pressed="true"]')?.dataset.v;
}
