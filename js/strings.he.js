// Hebrew UI strings for the navigation features. Keys are stable (code refers to them) – owned by the `copywriter` agent.
// {name} placeholders are filled by t() in strings.js.
export const HE = {
  // ---- how are you getting there?
  modeCar: 'ברכב', modeBus: 'באוטובוס', modeHere: 'כבר בשיבא',
  tagRec: 'מומלץ', tagAlt: 'חלופה', tagFallback: 'רשמי · גיבוי', tagStop: 'תחנה', tagHere: 'מכאן',
  btnNavStop: '🚌 נווטו לתחנה', btnStartWalk: '🚶 התחילו הליכה', btnIndoor: '🏢 מסלול בפנים', btnChangeHere: '📍 שנו מיקום',
  busLines: 'קווים: {lines}', busNoLines: 'עדיין אין לנו את מספרי הקווים – בדקו באתר שיבא',
  hereNeedStart: 'בחרו איפה אתם נמצאים ונחשב מסלול משם',

  // ---- destination without a route
  noRouteTitle: 'עדיין אין מסלול ליעד הזה',
  noRouteBody: 'עדיין לא ידוע לנו איפה היעד בתוך הקמפוס. אפשר להיעזר בהוראות באתר שיבא, או לעזור לנו ולהוסיף מיקום.',
  noRouteHelp: 'הוסיפו מיקום', unlocatedBadge: 'מיקום לא ידוע', clinicsHint: 'חפשו מבין יותר מ-500 מרפאות ומכונים', moreResults: 'ועוד {n} – צמצמו את החיפוש',

  // ---- "where are you?" (GPS is unreliable inside buildings)
  hereTitle: 'איפה אתם עכשיו?',
  hereSub: 'בתוך בניינים ה-GPS לא מדויק. בחרו מקום ונחשב מסלול משם.',
  hereGps: '📍 איתור לפי GPS', hereGpsWait: 'מאתרים מיקום…', hereGpsFail: 'לא הצלחנו לקבל מיקום – בחרו ידנית',
  hereOutside: 'בחוץ, ליד: {place}', hereInside: 'בתוך: {building}', hereNoBuilding: 'לא זוהה בניין קרוב',
  hereSearch: 'חיפוש מקום (לובי, מעלית, קומה, מרפאה…)', hereBuilding: 'או בחרו בניין', hereFloor: 'באיזו קומה?', hereWhere: 'ואיפה בקומה?',
  hereMaybe: 'אולי אתם כאן?', hereYesHere: 'כן, כאן', hereAccLow: 'הדיוק נמוך – אשרו או בחרו ידנית', hereAcc: 'דיוק ±{m} מ׳',
  accessibleCaveat: 'מסלול נגיש משוער: מדרגות ושיפועים בקמפוס עדיין לא ממופים במלואם. בדקו בשטח.',
  hereOther: 'חיפוש או בניין אחר',
  hereFloorOnly: 'קומה {floor}, לא ברור איפה', hereCancel: 'ביטול', hereChosen: 'מתחילים מ: {place}', hereUnreachable: 'אין עדיין מסלול מהמקום הזה',

  // ---- indoor view
  indoorTitle: 'מסלול בפנים',
  indoorNote: 'משוער – אין לנו תוכנית קומה. האורכים והכיוונים בקירוב; בדקו גם את השילוט במקום.',
  indoorFloor: 'קומה {floor}', indoorClose: 'סגירה', indoorEst: 'משוער', indoorAllOutside: 'כל המסלול בחוץ',

  // ---- walking mode: live-view style confirmations
  seeQ: 'רואים {landmark}?', seeYes: '✓ רואים', seeNo: 'לא רואים',
  testBadge: 'בדיקה', testManyUnits: 'במספר יחידות ({n})', testPickTitle: 'איפה מבצעים: {name}?',
  testPerformedAt: 'לפי אתר שיבא, הבדיקה מתבצעת ב: {names}', testUnknownUnit: 'באתר שיבא לא מצוין איפה מתבצעת הבדיקה ({area}). פנו לזימון התורים או לעמוד הבדיקה.',
  altLink: 'חלופות ({n})',
  lostLink: 'לא בטוח איפה אני',
  floorQ: 'באיזו קומה אתם?', floorExpected: 'לפי המסלול: קומה {floor}', floorOk: '✓ קומה {floor}',
  arriveQ: 'נכנסתם לבניין?', arriveYes: '✓ נכנסנו',
  rerouting: 'מחשבים מסלול חדש…', rerouted: 'חישבנו מחדש מ: {place}', floorMismatch: 'זו לא הקומה הצפויה – מחשבים מסלול חדש',
  gpsIndoorHint: 'בתוך בניינים ה-GPS לא מדויק – אשרו כל שלב',
};
