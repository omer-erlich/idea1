// Safety rules: places that must never be recommended, at any hour.
import { pointInPolygon, haversine, distanceToPolyline } from './geo.js';

export const SAFETY_KINDS = {
  emergency_lane: 'נתיב חירום / אמבולנסים',
  ambulance_bay: 'מפרץ אמבולנסים',
  disabled: 'חניית נכים',
  fire_access: 'דרך גישה לכבאות',
  helipad: 'מנחת מסוקים',
};

/** Returns the first safety zone that contains `p` (or is within its buffer), else null. */
export function safetyZoneAt(p, zones = []) {
  if (!p) return null;
  for (const z of zones) {
    if (z.polygon && z.polygon.length >= 3 && pointInPolygon(p, z.polygon)) return z;
    if (z.line && distanceToPolyline(p, z.line) <= (z.buffer ?? 6)) return z;
    if (z.center && haversine(p, z.center) <= (z.radius ?? 10)) return z;
  }
  return null;
}

// Words that suggest a submission is about a spot that must never be used.
const RISK_WORDS = /(אמבולנס|אמבולנסים|נתיב\s*חירום|חירום|כיבוי|כבאות|כבאי|הידרנט|ברז\s*כיבוי|נכים|נכה|תו\s*נכה|אדום[\s-]*לבן|מנחת|רמפת\s*מיון|ambulance|emergency|fire|hydrant|disabled|handicap)/i;
const NON_PUBLIC_WORDS = /(עובדים\s*בלבד|לעובדים\s*בלבד|כרטיס\s*עובד|צוות\s*בלבד|אין\s*כניסה|כניסה\s*אסורה|staff\s*only|employees\s*only|no\s*entry)/i;

/** Flags for free text in a tip. Returns an array of flag codes. */
export function textFlags(text = '') {
  const flags = [];
  if (RISK_WORDS.test(text)) flags.push('mentions-emergency-or-disabled');
  if (NON_PUBLIC_WORDS.test(text)) flags.push('mentions-non-public');
  return flags;
}

/** Hard checks for a parking record (used by engine, submit form and admin page). */
export function parkingSafetyProblems(parking, zones = []) {
  const problems = [];
  const p = parking.lat != null ? [parking.lat, parking.lon] : null;
  const z = safetyZoneAt(p, zones);
  if (z) problems.push(`בתוך אזור אסור: ${SAFETY_KINDS[z.kind] || z.kind}`);
  // the lot's outline (when known) must not overlap a zone either – a lot that is partly disabled-only / helipad is never suggested
  if (!z && parking.outline && parking.outline.length >= 3) {
    for (const zone of zones) {
      if (!zone.polygon || zone.polygon.length < 3 || !['disabled', 'helipad', 'ambulance_bay', 'fire_access'].includes(zone.kind)) continue;
      if (parking.outline.some(q => pointInPolygon(q, zone.polygon)) || zone.polygon.some(q => pointInPolygon(q, parking.outline))) { problems.push(`חופפת לאזור אסור: ${SAFETY_KINDS[zone.kind] || zone.kind}`); break; }
    }
  }
  if (parking.access === 'private') problems.push('חניה פרטית / לא לציבור');
  if ((parking.safetyKinds || []).length) problems.push('מסומנת כאזור בטיחות: ' + parking.safetyKinds.map(k => SAFETY_KINDS[k] || k).join(', '));
  return problems;
}
