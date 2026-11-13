import { HE } from './strings.he.js';
/** t('hereChosen', {place: 'לובי'}) → "מתחילים מ: לובי". Unknown keys return the key (visible in tests). */
export function t(key, vars = {}) {
  let s = HE[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
