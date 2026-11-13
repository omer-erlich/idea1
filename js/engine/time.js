// Time handling for rules and opening hours.
// A "when" is { day: 0-6 (0 = Sunday), minutes: 0-1439 }.
// A window is { days: [0..6], from: "HH:MM", to: "HH:MM" }.
//  - from < to : same-day window [from, to)
//  - from > to : crosses midnight; `days` are the days the window STARTS on
//  - from == to (or "00:00"-"24:00"): the whole day

export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function parseHM(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  const v = +m[1] * 60 + +m[2];
  return v >= 0 && v <= 1440 ? v : null;
}

export function fmtHM(min) {
  min = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}

export function whenFromDate(d = new Date()) {
  return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
}

/** Parse "22:00", "sun-22:00", "3-08:30" (day index) or "now". */
export function parseWhen(str, now = new Date()) {
  if (!str || str === 'now') return whenFromDate(now);
  const m = /^(?:(sun|mon|tue|wed|thu|fri|sat|[0-6])-)?(\d{1,2}:\d{2})$/i.exec(str.trim());
  if (!m) return whenFromDate(now);
  const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let day = now.getDay();
  if (m[1]) day = /^\d$/.test(m[1]) ? +m[1] : names.indexOf(m[1].toLowerCase());
  const minutes = parseHM(m[2]);
  return { day, minutes: minutes === 1440 ? 0 : minutes };
}

export function whenToParam(w) {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][w.day] + '-' + fmtHM(w.minutes);
}

export function windowMatches(win, when) {
  const days = Array.isArray(win.days) && win.days.length ? win.days : ALL_DAYS;
  const from = parseHM(win.from ?? '00:00'), to = parseHM(win.to ?? '24:00');
  if (from === null || to === null) return false;
  const t = when.minutes;
  if (from === to || (from === 0 && to === 1440)) return days.includes(when.day);
  if (from < to) return days.includes(when.day) && t >= from && t < to;
  // crosses midnight
  const prev = (when.day + 6) % 7;
  return (days.includes(when.day) && t >= from) || (days.includes(prev) && t < to);
}

/**
 * Status of a parking at a given time: first matching rule wins.
 * Returns { status, rule } where status is ok|paid|risky|forbidden|unknown.
 */
export function parkingStatusAt(parking, when) {
  for (const rule of parking.rules || []) {
    if (windowMatches(rule, when)) return { status: rule.status, rule };
  }
  return { status: 'unknown', rule: null };
}

/**
 * Is something with opening `hours` open at `when`?
 * null / undefined hours = not known -> { open: true, known: false }.
 * An empty array means "never open".
 */
export function isOpenAt(hours, when) {
  if (hours == null) return { open: true, known: false };
  return { open: hours.some(w => windowMatches(w, when)), known: true };
}

export function describeWindow(w) {
  const days = w.days && w.days.length && w.days.length < 7
    ? w.days.map(d => DAY_NAMES_HE[d]).join(', ')
    : 'כל יום';
  const whole = w.from === w.to || (w.from === '00:00' && w.to === '24:00');
  return whole ? `${days}, כל היום` : `${days}, ${w.from}–${w.to}`;
}
