// Hebrew UI strings for the navigation features. Keys are stable (code refers to them) – owned by the `copywriter` agent.
// {name} placeholders are filled by t() in strings.js.
export const HE = {
  // ---- how are you getting there?
  modeCar: 'בנסיעה', modeBus: 'באוטובוס', modeHere: 'אני כבר בשיבא',
  tagRec: 'מומלץ', tagAlt: 'חלופה', tagFallback: 'רשמי · גיבוי', tagStop: 'תחנה', tagHere: 'מכאן',
  btnNavStop: '🚌 נווט לתחנה', btnStartWalk: '🚶 התחילו הליכה', btnIndoor: '🏢 תצוגת פנים', btnChangeHere: '📍 שנו מיקום',
  busLines: 'קווים: {lines}', busNoLines: 'הקווים לא ממופים – בדקו באתר שיבא',
  hereNeedStart: 'בחרו איפה אתם נמצאים ונחשב מסלול משם',

  // ---- destination without a route
  noRouteTitle: 'אין עדיין מסלול ממופה ליעד הזה',
  noRouteBody: 'עדיין לא ידוע לנו איפה היעד בתוך הקמפוס. אפשר להיעזר בהוראות באתר שיבא, או לעזור לנו ולהוסיף מיקום.',
  noRouteHelp: 'הוסיפו מיקום', unlocatedBadge: 'מיקום לא ידוע', clinicsHint: 'חפשו מבין יותר מ-500 מרפאות ומכונים', moreResults: 'ועוד {n} – צמצמו את החיפוש',

  // ---- "where are you?" (GPS is unreliable inside buildings)
  hereTitle: 'איפה אתם עכשיו?',
  hereSub: 'בתוך בניינים ה-GPS לא מדויק. בחרו מקום ונחשב מסלול משם.',
  hereGps: '📍 זהו אותי לפי GPS', hereGpsWait: 'מאתרים מיקום…', hereGpsFail: 'לא הצלחנו לקבל מיקום – בחרו ידנית',
  hereOutside: 'בחוץ, ליד: {place}', hereInside: 'בתוך: {building}', hereNoBuilding: 'לא זוהה בניין קרוב',
  hereSearch: 'חיפוש מקום (לובי, מעלית, קומה, מרפאה…)', hereBuilding: 'או בחרו בניין', hereFloor: 'באיזו קומה?', hereWhere: 'ואיפה בקומה?',
  hereOther: 'חיפוש או בניין אחר',
  hereFloorOnly: 'אני בקומה {floor} – לא בטוח איפה', hereCancel: 'ביטול', hereChosen: 'מתחילים מ: {place}', hereUnreachable: 'אין מסלול ממופה מהמקום הזה',

  // ---- indoor view
  indoorTitle: 'מסלול בפנים',
  indoorNote: 'משוער – אין תוכנית קומה. הסדר והקומות נכונים, האורכים והכיוונים בקירוב.',
  indoorFloor: 'קומה {floor}', indoorClose: 'סגירה', indoorEst: 'משוער', indoorAllOutside: 'כל המסלול בחוץ',

  // ---- walking mode: live-view style confirmations
  seeQ: 'רואים: {landmark}?', seeYes: '✓ כן, הגעתי', seeNo: 'לא רואה',
  lostLink: 'לא בטוח איפה אני',
  floorQ: 'באיזו קומה אתם עכשיו?', floorExpected: 'ציפינו לקומה {floor}', floorOk: '✓ קומה {floor}',
  arriveQ: 'נכנסתם לבניין?', arriveYes: '✓ נכנסתי',
  rerouting: 'מחשבים מסלול חדש…', rerouted: 'חישבנו מחדש מ: {place}', floorMismatch: 'הקומה שונה מהצפוי – מחשבים מחדש',
  gpsIndoorHint: 'בפנים ה-GPS לא מדויק – אשרו כל שלב',
};
