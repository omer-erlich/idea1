# כיסוי מרפאות ובדיקות – מה יש, מה חסר, ומה עוד לא ידוע

נוצר אוטומטית ע"י `tools/build-directory.mjs` ב-2026-11-14. מקור: [לובי המרפאות של שיבא](https://www.sheba.co.il/lobbies/clinics-lobby) ודפי המרפאות עצמן (הטקסט הציבורי תחת "מיקום").

## סיכום

| | כמות |
|---|---|
| מרפאות ברשימת הלובי (איסוף ע"י דפדוף ב-52 עמודים) | **518** (כותרת האתר מציינת 773 – ראו OPEN_QUESTIONS) |
| דפים שנקראו | 518 |
| עם טקסט "מיקום" באתר | 298 |
| נקלט בניין + קומה | 210 |
| נקלט בניין בלבד | 117 |
| מזה: בניין נלמד מקישור "דרכי הגעה"/Waze (ולא מהטקסט) | 48 |
| **ללא מיקום ידוע** | **191** |
| כבר יעד באפליקציה (שם זהה) | 5 |
| הבניין שלהן מכוסה באפליקציה (יש יעד באותו בניין) | 294 |
| דפי בדיקות (מה-sitemap) | 225 |
| בדיקות עם כותרת (מהסריקה) | 213 |
| בדיקות המקושרות ל-מרפאה אחת לפחות | 124 |
| בדיקות המקושרות למרפאה עם מיקום בגרף (בניין) | 77 |
| בדיקות עם מיקום כלשהו (`located`) | 160 |
| בדיקות ללא קישור למרפאה | 101 |

האפליקציה כוללת כרגע 28 יעדים מרוכזים (מכונים ומרפאות מרכזיות) – ולכן כמעט כל הרשימה למטה "חסרה" כיעד חיפוש. כולם כבר מופיעים כצמתים בגרף הפנימי (`graph.html`) אם נקלט להם בניין.

> **על גוגל מפות:** לא נאסף מידע מגוגל מפות (תנאי השימוש אוסרים חילוץ אוטומטי ושמירה של התוכן, ובפרויקט משתמשים רק בחומר שמותר לעשות בו שימוש חוזר). במקום זה המיקומים נלקחו מהטקסט הרשמי של שיבא. לרשומות שנשארו בלי מיקום יש בהמשך קישור "חיפוש במפות" שאפשר ללחוץ ידנית.

## מרפאות לפי בניין וקומה (327)

### מגדל האשפוז (71)

<details><summary>הצג את 71 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [המכון לבריאות הריאה](https://www.sheba.co.il/internal-medicine/clinics/lung-diseases-institute/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 0 | [המעבדה לטוקסיקולוגיה ופרמקולוגיה קלינית](https://www.sheba.co.il/general/labs/toxicology-pharmacology-lab/) | מגדל אשפוז, אגף המעבדות, קומת קרקע | טקסט | בניין מכוסה |
| 0 | [המערך להרדמה](https://www.sheba.co.il/surgery/clinics/anesthesia-array/) | מגדל אשפוז, קומת כניסה, במתחם חדר הניתוח הגדול | טקסט | בניין מכוסה |
| 0 | [מרפאה לאורתופדיה של הכתף](https://www.sheba.co.il/surgery/clinics/shoulder-clinic/) | מגדל אשפוז, קומת כניסה, אגף 1 | טקסט | בניין מכוסה |
| 0 | [מרפאה לדלקת אאוזינופילית של הוושט](https://www.sheba.co.il/internal-medicine/clinics/eosinophilic-esophagitis-clinic/) | מגדל אשפוז, מרפאות חוץ, אגף 9, קומת כניסה (ליד אגף דימות) | טקסט | בניין מכוסה |
| 0 | [מרפאה לכירורגיה אונקולוגית](https://www.sheba.co.il/surgery/clinics/clinic-for-oncological-surgery/) | מגדל אשפוז, מרפאות חוץ (קומת כניסה), אגף 2 | טקסט | בניין מכוסה |
| 0 | [מרפאה לכירורגיה קולורקטלית ופרוקטולוגית](https://www.sheba.co.il/surgery/clinics/clinic-for-colorectal-and-proctological-surgery/) | מגדל אשפוז, מרפאות חוץ (קומת כניסה), אגף 2 | טקסט | בניין מכוסה |
| 0 | [מרפאה לכירורגיה של היד](https://www.sheba.co.il/surgery/clinics/hand-surgery-clinic/) | מגדל אשפוז, מרפאות חוץ, קומת כניסה, אגף 1 | טקסט | בניין מכוסה |
| 0 | [מרפאה למשפחות בסיכון גבוה לגידולי מערכת העיכול](https://www.sheba.co.il/internal-medicine/clinics/high-risk-gastrointestinal-tumor-clinic/) | מגדל אשפוז, מרפאות חוץ, אגף 9, קומת כניסה (ליד הדימות) | טקסט | בניין מכוסה |
| 0 | [מרפאה נוירוכירורגית](https://www.sheba.co.il/neuroscience/neuro-surgery/neurosurgery-clinic/) | מגדל אשפוז, מרפאות חוץ (קומת כניסה), אגף 2 | טקסט | בניין מכוסה |
| 0 | [מרפאות אורתופדיה](https://www.sheba.co.il/surgery/clinics/orthopedic-clinics/) | מגדל אשפוז, מרפאות חוץ, קומת כניסה, אגף 1 | טקסט | בניין מכוסה |
| 0 | [מרפאת ברונכיאקטזיות](https://www.sheba.co.il/internal-medicine/clinics/bronchiectasis-clinic/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 0 | [מרפאת דרכי אוויר](https://www.sheba.co.il/internal-medicine/clinics/airways-clinic/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9, המכון למחלות ריאה | טקסט | בניין מכוסה |
| 0 | [מרפאת כירורגיה כללית](https://www.sheba.co.il/surgery/clinics/general-surgery-clinic/) | מגדל אשפוז, מרפאות חוץ (קומת כניסה), אגף 2 | טקסט | בניין מכוסה |
| 0 | [מרפאת מחלות ריאה אינטרסטיציאליות, פיברוזיס וסרקואידוזיס](https://www.sheba.co.il/internal-medicine/clinics/fibrotic-and-autoimmune-lung-diseases-clinic/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 0 | [מרפאת עמוד שדרה](https://www.sheba.co.il/surgery/clinics/spine-clinic/) | מגדל אשפוז, קומת כניסה, אגף 1 | טקסט | בניין מכוסה |
| 0 | [מרפאת שיעול ממושך](https://www.sheba.co.il/internal-medicine/clinics/chronic-cough-clinic/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 0 | [ריאות – אבחון מהיר](https://www.sheba.co.il/internal-medicine/clinics/lungs-rapid-diagnosis/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 0 | [שירות אשפוז יום מכון הריאות](https://www.sheba.co.il/internal-medicine/clinics/lungs-day-hospitalization-service/) | מגדל אשפוז, קומת כניסה, מרפאות חוץ, אגף 9 | טקסט | בניין מכוסה |
| 1 | [היחידה ללחץ דם](https://www.sheba.co.il/internal-medicine/clinics/blood-pressure-unit/) | בנייין אשפוז, מרפאות חוץ, קומה 1 (ליד פוטותרפיה) | טקסט | בניין מכוסה |
| 1 | [היחידה למיקרוכירורגיה פלסטית](https://www.sheba.co.il/surgery/units/plastic-microsurgery-unit/) | מגדל אשפוז, אגף מזרחי, קומה 1 | טקסט | בניין מכוסה |
| 1 | [היחידה למניעה ובקרת זיהומים](https://www.sheba.co.il/internal-medicine/clinics/infection-prevention-unit/) | בניין אשפוז, קומה 1 | טקסט | בניין מכוסה |
| 1 | [המכון לשיכוך כאב](https://www.sheba.co.il/internal-medicine/clinics/pain-management-institute/) | מגדל אשפוז, מרפאות חוץ, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מכון ראומטולוגיה](https://www.sheba.co.il/internal-medicine/clinics/rheumatology-unit/) | מגדל האשפוז, מעל מרפאות החוץ, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מעבדה לחקר הכבד](https://www.sheba.co.il/internal-medicine/clinics/liver-research-lab/) | בניין אשפוז, קומה 1, מעל מרפאות החוץ | טקסט | בניין מכוסה |
| 1 | [מרכז מצוינות למחלות כבד](https://www.sheba.co.il/internal-medicine/clinics/liver-diseases-excellence-center/) | בניין אשפוז, קומה 1, מעל מרפאות החוץ במרפאה זו ניתן לקבל גם ייעוץ אונליין | טקסט | בניין מכוסה |
| 1 | [מרכז נוירווסקולרי ושבץ מוחי](https://www.sheba.co.il/neuroscience/neurology/stroke-neurovascular-center/) | מרפאות החוץ, קומה 1 (המרכז למדעי המוח) | טקסט | בניין מכוסה |
| 1 | [מרפאה לטיפול במושתלי כבד](https://www.sheba.co.il/general/transplant-centers/liver-transplant-clinic/) | מרכז למחלות כבד, מרפאות חוץ קומה ראשונה, סמוך למרכז האוטואימוני. ממרכז הצומת: ממשיכים במעבר לכיוון מגדל האשפוז. ואחרי שני המסועים - פונים שמאלה. מלובי מגדל האשפוז: עלו במעלית לקומה E, ופנו לכיוון מרכז הצומת. | טקסט | בניין מכוסה |
| 1 | [מרפאה למחלות עצב-שריר](https://www.sheba.co.il/neuroscience/neurology/clinic-for-neuromuscular-diseases/) | מגדל אשפוז, קומה 1, מעל מרפאות החוץ (המרכז למדעי המוח) במרפאה זו ניתן לקבל שירות אונליין | טקסט | בניין מכוסה |
| 1 | [מרפאה לפולינוירופתיה משנית לעמילואידוזיס עם מוטציה לטרנסתירטין](https://www.sheba.co.il/neuroscience/neuro-surgery/transthyretin-mutation-polyneuropathy/) | מגדל אשפוז, קומה 1, מעל מרפאות החוץ (המרכז למדעי המוח) | טקסט | בניין מכוסה |
| 1 | [מרפאות מעקב אחרי חולים במחלות כבד](https://www.sheba.co.il/internal-medicine/clinics/liver-monitoring-clinics/) | בניין אשפוז, קומה 1, מעל מרפאות החוץ | טקסט | בניין מכוסה |
| 1 | [מרפאת אבחון של מחלות כבד](https://www.sheba.co.il/internal-medicine/clinics/diagnosis-of-liver-diseases/) | בניין אשפוז, קומה 1, מעל מרפאות החוץ | טקסט | בניין מכוסה |
| 1 | [מרפאת אולטרסאונד מוסקולוסקלטלי התערבותי](https://www.sheba.co.il/internal-medicine/clinics/interventional-musculoskeletal-ultrasound-clinic/) | מגדל האשפוז, מעל מרפאות החוץ, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת כאב ראש-צוואר התערבותי](https://www.sheba.co.il/internal-medicine/clinics/interventional-head-neck-pain-service/) | מגדל אשפוז, מרפאות חוץ, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת מיפוי שומות ממוחשב לגילוי מוקדם של מלנומה](https://www.sheba.co.il/internal-medicine/clinics/pigmentary-lesions-computerized-mapping-clinic/) | מכון פוטותרפיה בניין אשפוז, קומה 1, מעל למרפאות החוץ | טקסט | בניין מכוסה |
| 1 | [מרפאת נוירולוגיה כללית](https://www.sheba.co.il/neuroscience/neurology/general-neurology-clinic/) | מגדל אשפוז, קומה 1, מעל מרפאות החוץ (המרכז למדעי המוח) | טקסט | בניין מכוסה |
| 1 | [מרפאת HIV איידס PEP ,PREP ומחלות המועברות במגע מיני](https://www.sheba.co.il/internal-medicine/clinics/hiv-clinic/) | בניין אשפוז, קומה 1 | טקסט | בניין מכוסה |
| 1 | [נוירוכירורגיה - יחידת עמוד שדרה](https://www.sheba.co.il/neuroscience/neuro-surgery/neurosurgery-spine-unit/) | מגדל אשפוז, מחלקה נוירוכירורגית, קומה 1, אגף מזרחי | טקסט | בניין מכוסה |
| 1 | [שירות אלרגיה לתרופות](https://www.sheba.co.il/internal-medicine/clinics/drug-allergy-service/) | מגדל אשפוז, המרכז האוטואימוני, קומה 1 | טקסט | בניין מכוסה |
| 1 | [תוכנית רב-תחומית לטיפול באפילפסיה](https://www.sheba.co.il/general/multi-disciplinary-programs/epilepsy-multidisciplinary-program/) | מגדל אשפוז, קומה 1, מעל מרפאות החוץ (המרכז למדעי המוח) | טקסט | בניין מכוסה |
| 2 | [הוועדה להתאמה מגדרית](https://www.sheba.co.il/surgery/clinics/gender-reassignment-committee/) | משרד מרכזת הוועדה נמצא בבניין אשפוז, אגף מזרחי ("מעליות מזרח"), קומה 2, מחלקה לכירורגיה פלסטית. הגעה מהכניסה הראשית לבניין אשפוז (עמדת מודיעין/רולדין), דרך מעליות מזרח, קומה 2, מחלקת פלסטיקה (ניתן לשאול בקבלה היכן זיוה יושבת). | טקסט | בניין מכוסה |
| 2 | [ניתוחים במומים מולדים אצל ילדים](https://www.sheba.co.il/surgery/units/congenital-defects-surgery-in-children/) | מגדל אשפוז, אגף מערבי, קומה 2 | טקסט | בניין מכוסה |
| 3 | [היחידה לטראומה וכירורגיה דחופה](https://www.sheba.co.il/surgery/units/trauma-and-critical-surgery-unit/) | מגדל אשפוז, מעליות מערב, קומה 3 | טקסט | בניין מכוסה |
| 3 | [היחידה לשחזורי דופן בטן](https://www.sheba.co.il/surgery/units/abdominal-wall-reconstructions-unit/) | בניין אשפוז ראשי, קומה 3, המחלקה לכירורגיה כללית קבלת מטופלים: מרפאות חוץ, קומה 0 | טקסט | בניין מכוסה |
| 4 | [המערך האורתופדי](https://www.sheba.co.il/surgery/departments/orthopedic-array/) | בניין אשפוז, אגף מערבי, קומה 4 | טקסט | בניין מכוסה |
| 4 | [מרפאה לגברים נשאי גן BRCA](https://www.sheba.co.il/surgery/clinics/brca-men-clinic/) | בניין אשפוז, קומה E במעלית לחונים בחניון מרכז הצומת, קומה 4, ליד מרכז מירב וסקר מנהלים | טקסט | בניין מכוסה |
| 5 | [היחידה למיקרוכירורגיה ולאורתופלסטיקה](https://www.sheba.co.il/surgery/units/microsurgery-and-orthoplastics-unit/) | בניין האשפוז המרכזי, קומה חמישית, אגף מזרחי | טקסט | בניין מכוסה |
| 5 | [שירות לעצבים פריפריים](https://www.sheba.co.il/surgery/clinics/peripheral-nerve-service/) | מגדל אשפוז, קומה 5 (מעליות מזרח) | טקסט | בניין מכוסה |
| 6 | [אשפוז יום מח עצם](https://www.sheba.co.il/cancer/hematology/bone-marrow-day-hospitalization/) | מגדל האשפוז, אגף מערבי, קומה 6 | טקסט | בניין מכוסה |
| 6 | [המחלקה לכירורגיה אורולוגית](https://www.sheba.co.il/surgery/departments/urological-surgery-department/) | בניין האשפוז, אגף מזרחי, קומה 6 | טקסט | בניין מכוסה |
| ? | [אגף חדרי ניתוח, הרדמה ורפואת כאב](https://www.sheba.co.il/surgery/clinics/operating-rooms-division) | חדרי הניתוח המרכזיים סמוכים ללובי הראשי בבניין האשפוז. בלובי יש לפנות ימינה ואז שמאלה. | טקסט | בניין מכוסה |
| ? | [היחידה לדימות אונקולוגי](https://www.sheba.co.il/imaging/clinics/oncology-imaging-unit/) | מגדל אשפוז, אגף שימות. מהלובי הראשי ממשיכים ישר. אגף הדימות יהיה משמאלכם. | טקסט | בניין מכוסה |
| ? | [היחידה לכירורגיית שד](https://www.sheba.co.il/surgery/units/breast-surgery-unit/) | מרכז מירב | טקסט | בניין מכוסה |
| ? | [היחידה לנוירוכירורגיה אונקולוגית](https://www.sheba.co.il/neuroscience/neuro-surgery/oncological-neuro-surgery/) | — | קישור הגעה | בניין מכוסה |
| ? | [היחידה לרדיוכירורגיה](https://www.sheba.co.il/neuroscience/neuro-surgery/radiosurgery-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [היחידה לריפוי בעיסוק באגף הכירורגי](https://www.sheba.co.il/surgery/units/occupational-therapy-unit-surgical-wing/) | — | Waze | בניין מכוסה |
| ? | [המכון לרפואת מטיילים ומחלות טרופיות](https://www.sheba.co.il/preventive-medicine/clinics/institute-of-travel-medicine/) | — | קישור הגעה | בניין מכוסה |
| ? | [המרכז הארצי לטיפול נמרץ בכוויות](https://www.sheba.co.il/surgery/units/national-burns-intensive-care-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [מכון אולטרסאונד](https://www.sheba.co.il/imaging/clinics/ultrasound-institute/) | מגדל אשפוז, אגף דימות. מהלובי הראשי ממשיכים ישר. אגף הדימות יהיה משמאלכם. | טקסט | בניין מכוסה |
| ? | [מרפאה לכירורגיה גריאטרית](https://www.sheba.co.il/surgery/clinics/geriatric-surgery-clinic/) | בניין האשפוז, מרפאות חוץ, אגף 2 * יש להתקשר למרפאה לקביעת תורים, בהפניית הכירורג/ית המטפל/ת. יש צורך בהתחייבות/ טופס 17. ניתן להשאיר פיקדון | טקסט | בניין מכוסה |
| ? | [מרפאה לכירורגיה של מערכת העיכול העליונה](https://www.sheba.co.il/surgery/clinics/ugi-upper-gastrointestinal-surgery-clinic/) | בניין האשפוז, מרפאות חוץ, אגף 2 * יש להתקשר למרפאה לקביעת תורים, בהפניית הכירורג/ית המטפל/ת. יש צורך בהתחייבות/ טופס 17. ניתן להשאיר פיקדון | טקסט | בניין מכוסה |
| ? | [מרפאה למחלות ציפורניים וכירורגיית ציפורניים](https://www.sheba.co.il/internal-medicine/clinics/nail-diseases-clinic/) | בניין אשפוז, מרפאות חוץ, אגף 3 | טקסט | בניין מכוסה |
| ? | [מרפאה תעסוקתית](https://www.sheba.co.il/preventive-medicine/clinics/occupational-health-and-safety-clinic/) | בניין אשפוז, מרפאות חוץ, אחרי אגף 3 (פנימית) | טקסט | בניין מכוסה |
| ? | [מרפאות עור ומין](https://www.sheba.co.il/internal-medicine/clinics/dermatology-venerology-clinics/) | מגדל אשפוז, מרפאות חוץ, אגף 3 (קבלה פנימית) | טקסט | בניין מכוסה |
| ? | [מרפאת אנטיקואגולנטים (מדללי דם)](https://www.sheba.co.il/internal-medicine/clinics/anticoagulation-clinic/) | מגדל אשפוז, מרפאות חוץ, אגף 3 (קבלה פנימית) | טקסט | בניין מכוסה |
| ? | [מרפאת גסטרו כבד](https://www.sheba.co.il/internal-medicine/clinics/liver-gastro-clinic/) | בניין אשפוז מרכזי, בין המודיעין למרפאת אורתופדיה קפיצה לראש העמוד קפיצה לראש העמוד שיבא במקום ה-7 בבתי החולים הטובים בעולם שנה שמינית ברציפות ב-TOP העולמי! רוצה להיות עם אצבע על הדופק? תרשמו אותי תחומים רפואיים | טקסט | בניין מכוסה |
| ? | [מרפאת הפרעות קצב בספורטאים](https://www.sheba.co.il/preventive-medicine/clinics/clinic-for-arrhythmias-in-athletes/) | — | Waze | בניין מכוסה |
| ? | [מרפאת כירורגיה דרמטולוגית](https://www.sheba.co.il/internal-medicine/clinics/dermatological-surgery-clinic/) | מגדל אשפוז, מרפאות חוץ, אגף 3 | טקסט | בניין מכוסה |
| ? | [מרפאת לימפומה של העור](https://www.sheba.co.il/internal-medicine/clinics/skin-lymphoma-clinic/) | בניין אשפוז, מרפאות חוץ, אגף 3 | טקסט | בניין מכוסה |
| ? | [מרפאת לישמניה – שושנת יריחו](https://www.sheba.co.il/internal-medicine/clinics/leishmania-clinic/) | מגדל אשפוז, מרפאות חוץ, אגף 3 | טקסט | בניין מכוסה |
| ? | [מרפאת שיער](https://www.sheba.co.il/internal-medicine/clinics/hair-clinic/) | בניין אשפוז, מרפאות חוץ, אגף 3 | טקסט | בניין מכוסה |

</details>

### בית החולים ספרא לילדים (66)

<details><summary>הצג את 66 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [אשפוז יום ילדים](https://www.sheba.co.il/pediatrics/clinics/day-hospitalization/) | בניין בית החולים ספרא לילדים, קומת קרקע | טקסט | בניין מכוסה |
| 0 | [היחידה לראומטולוגיה ילדים](https://www.sheba.co.il/pediatrics/clinics/rheumatology-unit/) | בית החולים אדמונד ולילי ספרא לילדים, קומת קרקע | טקסט | בניין מכוסה |
| 0 | [המחלקה לרפואה דחופה ילדים](https://www.sheba.co.il/pediatrics/departments/er/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומת כניסה, מימין ללובי | טקסט | בניין מכוסה |
| 0 | [המרכז הלאומי לטיפול בילדים ונוער נפגעי טראומה](https://www.sheba.co.il/pediatrics/clinics/trauma-treatment/) | שיבא, תל השומר, בית החולים ספרא לילדים, קומת קרקע ל | טקסט | בניין מכוסה |
| 1 | [אשפוז יום המטואונקולוגי](https://www.sheba.co.il/pediatrics/clinics/hematooncology-pediatric-day-hospitalization/) | בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [הדרכת הורים במרפאה לפסיכיאטריה של הילד](https://www.sheba.co.il/pediatrics/clinics/parent-training-childs-psychiatry-clinic/) | בניין ספרא ילדים קומה 1 אגף צפון | טקסט | בניין מכוסה |
| 1 | [היחידה לגסטרואנטרולוגיה, תזונה ומחלות כבד בילדים](https://www.sheba.co.il/pediatrics/clinics/gastroenterology-unit/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאה אנדוקרינית לילדים חולי X שביר ולנשאיות](https://www.sheba.co.il/pediatrics/clinics/endocrine-fragile-x-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1, מרפאות חוץ | טקסט | בניין מכוסה |
| 1 | [מרפאה לבעיות פונקציונליות](https://www.sheba.co.il/pediatrics/clinics/functional-problems-clinic/) | בניין ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאה לגנטיקה התנהגותית](https://www.sheba.co.il/pediatrics/clinics/behavioral-genetics-clinic/) | בניין ספרא ילדים, קומה 1, אגף צפון | טקסט | בניין מכוסה |
| 1 | [מרפאה לדיסאוטונמיה משפחתית](https://www.sheba.co.il/pediatrics/clinics/family-dysautonomia-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 1 (גסטרואנטרולוגיה) | טקסט | בניין מכוסה |
| 1 | [מרפאה לטיפול בהפרעות חרדה וכפייתיות אצל ילדים ומתבגרים](https://www.sheba.co.il/pediatrics/clinics/anxiety-clinic/) | בניין ספרא ילדים קומה 1, אגף צפון | טקסט | בניין מכוסה |
| 1 | [מרפאה לטיפול בהפרעת קשב וריכוז ADHD](https://www.sheba.co.il/pediatrics/clinics/adhd-clinic/) | בניין ספרא ילדים קומה 1, אגף צפון | טקסט | בניין מכוסה |
| 1 | [מרפאה לכבד שומני בילדים](https://www.sheba.co.il/pediatrics/clinics/fatty-liver-children-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאה למחלות מעי דלקתיות בגיל הרך](https://www.sheba.co.il/pediatrics/clinics/early-age-inflammatory-bowel-diseases/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאה למחלות מעי דלקתיות בילדים](https://www.sheba.co.il/pediatrics/clinics/inflammatory-bowel-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאות למעי קצר](https://www.sheba.co.il/pediatrics/clinics/short-bowel-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת אונקולוגיה מונעת](https://www.sheba.co.il/pediatrics/clinics/preventive-oncology-clinic/) | בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת אלרגיה ילדים](https://www.sheba.co.il/pediatrics/clinics/allergy-clinic/) | בניין בית החולים ספרא לילדים, קומה 1, אגף דרומי שימו לב: המרפאה עברה באופן זמני למתחם בית לין הממוקם בכניסה האחורית של בית החולים ספרא | טקסט | בניין מכוסה |
| 1 | [מרפאת ברי"א – בירור ואבחון מותאם אישית](https://www.sheba.co.il/pediatrics/clinics/barie-clinic-inquiry-and-personalized-diagnosis/) | בית החולים לילדים אדמונד ולילי ספרא, אגף דרומי, קומה 1 דרכי הגעה | טקסט | בניין מכוסה |
| 1 | [מרפאת גפן – גינקו-אנדוקרינולוגיה ופוריות בנערות](https://www.sheba.co.il/pediatrics/clinics/geffen-adolescent-girls-endocrinology-clinic/) | היחידה לאנדוקרינולוגיה ילדים בבניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 מרפאות חוץ, או מרפאות נשים (תלוי ביום) | טקסט | בניין מכוסה |
| 1 | [מרפאת התערבות במשבר](https://www.sheba.co.il/pediatrics/clinics/crisis-intervention-clinic/) | בניין ספרא ילדים קומה 1 אגף צפון | טקסט | בניין מכוסה |
| 1 | [מרפאת ליפידים ילדים/הורים](https://www.sheba.co.il/pediatrics/clinics/lipids-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1, מרפאות חוץ אנדוקרינולוגיה | טקסט | בניין מכוסה |
| 1 | [מרפאת מגווני מגדר לילדים ונוער (מרפאת טרנסג'נדרים)](https://www.sheba.co.il/pediatrics/clinics/youth-transgender-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1, מרפאות חוץ אנדוקרינולוגיה | טקסט | בניין מכוסה |
| 1 | [מרפאת מעבר למטופלים עם מחלת מעי דלקתית](https://www.sheba.co.il/pediatrics/clinics/ibd-transition-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת מעקב מחלימים](https://www.sheba.co.il/pediatrics/clinics/recovery-follow-up-clinic/) | בית החולים אדמונד ולילד ספרא לילדים, המערך להמטואונקולוגיה ילדים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת נונן](https://www.sheba.co.il/pediatrics/clinics/noonan-syndrome-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 1, מרפאות חוץ אנדוקרינולוגיה | טקסט | בניין מכוסה |
| 1 | [מרפאת סוכרת ילדים](https://www.sheba.co.il/pediatrics/clinics/diabetes-clinic/) | קומה 1, בניין אדמונד ולילי ספרא לילדים | טקסט | בניין מכוסה |
| 1 | [מרפאת פונטן](https://www.sheba.co.il/pediatrics/clinics/fontan-procedure-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 1 (גסטרואנטרולוגיה) | טקסט | בניין מכוסה |
| 1 | [שירות למושתלי מח עצם ילדים](https://www.sheba.co.il/pediatrics/services/pediatric-bone-marrow-transplant-service/) | בית החולים אדמונד ולילי ספרא לילדים, קומה 1 וקומה 3 | טקסט | בניין מכוסה |
| 2 | [אף-אוזן-גרון וניתוחי ראש-צוואר בילדים](https://www.sheba.co.il/pediatrics/clinics/otorhinolaryngology-surgery-clinic) | בניין אדמונד ולילי ספרא לילדים, קומה 2, אגף צפוני | טקסט | בניין מכוסה |
| 2 | [מרפאה טרום ניתוחית ילדים](https://www.sheba.co.il/pediatrics/clinics/preoperative-clinic/) | בניין אדמונד ולילי ספרא לילדים, קומה 2, אגף צפוני שימו לב: המרפאה עברה באופן זמני למתחם בית לין הממוקם בכניסה האחורית של בית החולים ספרא | טקסט | בניין מכוסה |
| 2 | [מרפאה כירורגית לילדים](https://www.sheba.co.il/pediatrics/clinics/surgery-clinic/) | בניין אדמונד ולילי ספרא לילדים, קומה 2, אגף צפוני | טקסט | בניין מכוסה |
| 2 | [מרפאת אולטראסאונד מפרקי ירכיים של היילוד](https://www.sheba.co.il/pediatrics/clinics/neonatal-hip-ultrasound-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 2, אגף צפוני | טקסט | בניין מכוסה |
| 3 | [אשפוז יום שיקומי ילדים](https://www.sheba.co.il/pediatrics/departments/rehabilitation-day-hospitalization/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 3 המשרד נמצא בחדר B 216 (מעבר לדלתות הזכוכית שמול המעליות וימינה) חדר אח אחראי: 211B | טקסט | בניין מכוסה |
| 3 | [היחידה לנוירולוגיה של הילד](https://www.sheba.co.il/pediatrics/clinics/neurology-unit/) | בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 3 במרפאה זו ניתן לקבל גם ייעוץ אונליין | טקסט | בניין מכוסה |
| 3 | [המחלקה להמטואונקולוגיה והשתלות מח עצם](https://www.sheba.co.il/pediatrics/departments/hemato-oncology-department/) | בית החולים אדמונד ולילד ספרא לילדים, קומה 3 | טקסט | בניין מכוסה |
| 3 | [המרכז הרב-תחומי לנוירוגנטיקה](https://www.sheba.co.il/pediatrics/clinics/neurogenetics-multidisciplinary-center/) | בניין ילדים, אגף דרומי, קומה 3 | טקסט | בניין מכוסה |
| 3 | [מרפאה רב-תחומית לתסמונת רט](https://www.sheba.co.il/pediatrics/clinics/rett-syndrome-clinic/) | בית החולים אדמונד ולילי ספרא לילדים, היחידה לנוירולוגיה, קומה 3 | טקסט | בניין מכוסה |
| 3 | [מרפאת ידיים ילדים - ריפוי בעיסוק](https://www.sheba.co.il/pediatrics/clinics/hand-occupational-therapy/) | בניין בית חולים ספרא לילדים, קומה 3 | טקסט | בניין מכוסה |
| 3 | [מרפאת כאב ילדים](https://www.sheba.co.il/pediatrics/clinics/pain-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 3 אגף דרומי | טקסט | בניין מכוסה |
| 3 | [מרפאת סוגרים](https://www.sheba.co.il/pediatrics/clinics/sphincters-pediatric-rehabilitation-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, מרפאות חוץ, קומה 3 במרפאה זו ניתן לקבל גם ייעוץ אונליין | טקסט | בניין מכוסה |
| 3 | [מרפאת שיקום ילדים](https://www.sheba.co.il/pediatrics/clinics/rehab-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 3 במרפאה זו ניתן לקבל גם ייעוץ אונליין. | טקסט | בניין מכוסה |
| 5 | [היחידה לאבחון נוירופסיכולוגי](https://www.sheba.co.il/pediatrics/clinics/neuropsychology-diagnosis-unit/) | בית החולים לילדים ע"ש אדמונד ולילי ספרא, קומה 5 (אגף דרום) | טקסט | בניין מכוסה |
| 8 | [מרכז הלב לילדים](https://www.sheba.co.il/pediatrics/clinics/heart-center/) | בניין בית החולים אדמונד ולילי ספרא לילדים, המרכז הבינלאומי למומי לב מולדים ע"ש אדמונד ספרא, קומה 8 | טקסט | בניין מכוסה |
| 8 | [מרפאה קרדיוגנטית](https://www.sheba.co.il/pediatrics/clinics/cardiogenetic-clinic/) | בניין בית החולים ספרא לילדים, קומה 8 המכון למחלות נדירות ל | טקסט | בניין מכוסה |
| 8 | [מרפאת אלקטרופיזיולוגיה והפרעות קצב בילדים](https://www.sheba.co.il/pediatrics/clinics/electrophysiology-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 8, המרכז הבינלאומי למומי לב מולדים | טקסט | בניין מכוסה |
| 8 | [מרפאת קוצבי לב ילדים](https://www.sheba.co.il/pediatrics/clinics/pacemaker-clinic/) | בניין בית החולים אדמונד ולילי ספרא לילדים, קומה 8, המרכז הבינלאומי למומי לב מולדים. ל | טקסט | בניין מכוסה |
| 8 | [שירות צנתורי לב ילדים](https://www.sheba.co.il/pediatrics/clinics/cardiac-catheterization/) | בית החולים אדמונד ולילי ספרא לילדים, קומה 8 | טקסט | בניין מכוסה |
| 9 | [מרפאה נפרוגנטית](https://www.sheba.co.il/pediatrics/clinics/nephrogenetic-clinic/) | בניין בית החולים ספרא לילדים, קומה 9, מחלקת ילדים ב’ | טקסט | בניין מכוסה |
| ? | [אשפוז יום הפרעות אכילה](https://www.sheba.co.il/pediatrics/clinics/day-hospitalization-eating-disorders/) | — | קישור הגעה | בניין מכוסה |
| ? | [היחידה לאורולוגיה ילדים](https://www.sheba.co.il/pediatrics/clinics/urology-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [המעבדה לנוירופסיכיאטריה של הילד](https://www.sheba.co.il/pediatrics/clinics/neuropsychiatry-laboratory/) | — | קישור הגעה | בניין מכוסה |
| ? | [המרכז החינוכי ע"ש ויצמן](https://www.sheba.co.il/pediatrics/services/weizman-educational-center-school/) | בניין בית החולים לילדים אדמונד ולילי ספרא, כירורגיית ילדים | טקסט | בניין מכוסה |
| ? | [המרכז הרב-תחומי לאנומליות וסקולריות](https://www.sheba.co.il/pediatrics/clinics/vascular-anomalies-center/) | בניין בית החולים אדמונד ולילי ספרא לילדים | טקסט | בניין מכוסה |
| ? | [מערך האַחֲיוּת בבית החולים ספרא לילדים](https://www.sheba.co.il/pediatrics/clinics/nursing-array-safra/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה אנדוקרינית למחלימים ממחלות ממאירות](https://www.sheba.co.il/pediatrics/clinics/cancer-survivors-endocrine-pediatric-clinic/) | מכון המטואונקולוגיה ילדים, בניין בית החולים אדמונד ולילי ספרא לילדים | טקסט | בניין מכוסה |
| ? | [מרפאת אג"ס](https://www.sheba.co.il/pediatrics/clinics/gastroenterology-difficulties-in-autistic-children-agas-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת אולטרסאונד ומפרקי ירכיים של היילוד](https://www.sheba.co.il/pediatrics/clinics/ultrasound-hip-joint-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת גסטרוסטום](https://www.sheba.co.il/pediatrics/clinics/gastrostomy-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת על''ה עזרה לילד המיוחד](https://www.sheba.co.il/pediatrics/clinics/aleh-children-special-care-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת פוליפוזיס](https://www.sheba.co.il/pediatrics/clinics/polyposis-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת פנילקטונוריה (PKU)](https://www.sheba.co.il/pediatrics/clinics/phenylketonuria-pku-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [ריפוי בעיסוק באגף לפסיכיאטריה של הילד והמתבגר](https://www.sheba.co.il/pediatrics/services/occupational-therapy-child-psychiatry/) | בית החולים אדמונד ולילי ספרא לילדים, קומה א', ג' ל | טקסט | בניין מכוסה |
| ? | [ריפוי בעיסוק בבית החולים אדמונד ולילי ספרא לילדים](https://www.sheba.co.il/pediatrics/services/occupational-therapy-safra-childrens-hospital/) | — | קישור הגעה | בניין מכוסה |
| ? | [ריפוי בעיסוק בפגייה](https://www.sheba.co.il/pediatrics/services/occupational-therapy-prematurity/) | בית החולים אדמונד ולילי ספרא לילדים/ בניין יולדות ל | טקסט | בניין מכוסה |

</details>

### מרכז הסרטן (32)

<details><summary>הצג את 32 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [מכון אלה לאימונו-אונקולוגיה, מלנומה וסרטן העור](https://www.sheba.co.il/cancer/oncology/ella-institute/) | מרכז הסרטן, קומה 0 (מול מכון המופיליה) | טקסט | בניין מכוסה |
| 0 | [מכון רדיותרפיה (קרינה)](https://www.sheba.co.il/cancer/radiotherapy/radiotherapy-institute/) | מרכז הסרטן, מכון רדיותרפיה, קומת קרקע לכתוב ב- : חניון אונקולוגיה שיבא כדאי לדעת: מטופלים במהלך טיפולי קרינה זכאים לחניה שמורה בחניון מרכז הסרטן - בהרשמה מראש במזכירות. | טקסט | בניין מכוסה |
| 0 | [מרפאה משותפת לסרטן שלפוחית שתן מקומי](https://www.sheba.co.il/cancer/oncology/localized-bladder-cancer-clinic/) | מרכז הסרטן, קומה 0 | טקסט | בניין מכוסה |
| 1 | [איסוף תאי אב המטולוגיים](https://www.sheba.co.il/cancer/hematology/stem-cells-collection) | בניין מרכז הסרטן, קומה 1 | טקסט | בניין מכוסה |
| 1 | [היחידה לקרישת דם](https://www.sheba.co.il/cancer/hematology/coagulation-unit/) | מרכז הסרטן, קומת כניסה לתשומת לבך: עקב שיפוצים הגישה תתאפשר באופן זמני דרך קומה 1 בבניין, שאליה ניתן יהיה לעלות במעליות החניון. הגישה מקומת הקרקע לבית הקפה הנמצא בקומת הפנאי והרווחה תתאפשר דרך מעליות החניון | טקסט | בניין מכוסה |
| 1 | [המכון הארצי להמופיליה](https://www.sheba.co.il/cancer/hematology/hemophilia-national-institute/) | בניין מרכז הסרטן, קומת כניסה לתשומת לבך: עקב שיפוצים הגישה תתאפשר באופן זמני דרך קומה 1 בבניין, אליה ניתן יהיה לעלות במעליות החניון. הגישה מקומת הקרקע לבית הקפה הנמצא בקומת הפנאי והרווחה תתאפשר דרך מעליות החניון. | טקסט | בניין מכוסה |
| 1 | [מכון המופיליה וקרישת דם](https://www.sheba.co.il/cancer/hematology/hemophilia-and-coagulation-institute/) | בניין מרכז הסרטן, קומת כניסה לתשומת לבך: עקב שיפוצים הגישה תתאפשר באופן זמני דרך קומה 1 בבניין, אליה ניתן יהיה לעלות במעליות החניון. הגישה מקומת הקרקע לבית הקפה הנמצא בקומת הפנאי והרווחה תתאפשר דרך מעליות החניון. | טקסט | בניין מכוסה |
| 1 | [מרפאה לטיפול בחולי איידס והמופיליה](https://www.sheba.co.il/cancer/hematology/hiv-hemophilia-clinic/) | מרכז הסרטן, קומת כניסה לתשומת לבך: עקב שיפוצים הגישה תתאפשר באופן זמני דרך קומה 1 בבניין, אליה ניתן יהיה לעלות במעליות החניון. הגישה מקומת הקרקע לבית הקפה הנמצא בקומת הפנאי והרווחה תתאפשר דרך מעליות החניון. | טקסט | בניין מכוסה |
| 1 | [שירות קרישה ילדים](https://www.sheba.co.il/cancer/hematology/coagulation-pediatric-clinic/) | מרכז הסרטן, קומת כניסה לתשומת לבך: עקב שיפוצים הגישה תתאפשר באופן זמני דרך קומה 1 בבניין, אליה ניתן יהיה לעלות במעליות החניון. הגישה מקומת הקרקע לבית הקפה הנמצא בקומת הפנאי והרווחה תתאפשר דרך מעליות החניון. | טקסט | בניין מכוסה |
| 2 | [היחידה לטיפול תומך](https://www.sheba.co.il/cancer/palliative-care/supportive-care-unit/) | מרכז הסרטן, קומה 2 | טקסט | בניין מכוסה |
| 2 | [היחידה לכאב אונקולוגי - מרכז תירוש](https://www.sheba.co.il/cancer/oncology/oncology-pain-unit/) | מרכז הסרטן, קומה 2 ל | טקסט | בניין מכוסה |
| 2 | [מרכז טל לאונקולוגיה אינטגרטיבית](https://www.sheba.co.il/cancer/palliative-care/tal-center-oncology/) | מרכז הסרטן, קומה 2 עקב עבודות בינוי, החל מתאריך 14.12.25, ניתן להגיע למחלקה דרך חניון מרכז הסרטן. משם עולים במעליות לקומה השנייה, חוצים את הלובי לכיוון המעליות המרכזיות וממשיכים למיקום המדויק. | טקסט | בניין מכוסה |
| 2 | [מרפאה לסרקומות של רקמות רכות וגידולי שלד](https://www.sheba.co.il/cancer/oncology/sarcoma-clinic/) | מרכז הסרטן, קומה 2, אשכול 1 עקב עבודות בינוי, החל מתאריך 14.12.25, ניתן להגיע למחלקה דרך חניון מרכז הסרטן. משם עולים במעליות לקומה השנייה, חוצים את הלובי לכיוון המעליות המרכזיות וממשיכים למיקום המדויק. | טקסט | בניין מכוסה |
| 2 | [מרפאה קרדיו-אונקולוגית](https://www.sheba.co.il/cancer/oncology/cardio-oncology-clinic/) | מרכז הסרטן, קומה 2, אשכול 1 | טקסט | בניין מכוסה |
| 2 | [מרפאת יתר לחץ דם למטופלים אונקולוגיים](https://www.sheba.co.il/cancer/palliative-care/oncology-hypertension-clinic/) | בניין מרכז הסרטן, קומה 2 | טקסט | בניין מכוסה |
| 2 | [שירות לשיכוך כאב במחלימים אונקולוגיים](https://www.sheba.co.il/cancer/palliative-care/cancer-survivors-pain-management-service/) | מרכז הסרטן, קומה 2 ל | טקסט | בניין מכוסה |
| 2 | [שירות ריפוי בעיסוק לחולי סרטן ומחלימים](https://www.sheba.co.il/cancer/palliative-care/occupational-therapy-cancer-patients/) | בניין מרכז הסרטן, קומה 2 ל | טקסט | בניין מכוסה |
| 3 | [אשפוז יום המטולוגי](https://www.sheba.co.il/cancer/hematology/hematology-day-hospitalization/) | מרכז הסרטן, קומה 3 | טקסט | בניין מכוסה |
| 3 | [המכון לאונקולוגיה של השד](https://www.sheba.co.il/cancer/oncology/breast-cancer-institute/) | מרכז הסרטן, קומה 3 | טקסט | בניין מכוסה |
| 3 | [מרפאת ייעוץ גנטי](https://www.sheba.co.il/cancer/clinics/genetic-consultation-clinic/) | בניין מרכז הסרטן, קומה 3, בתוך המכון לאונקולוגיה של השד | טקסט | בניין מכוסה |
| 3 | [מרפאת לימפומה](https://www.sheba.co.il/cancer/hematology/lymphoma-clinic/) | מרכז הסרטן, קומה 3, אשכול לימפומה עקב עבודות בינוי, החל מתאריך 14.12.25, ניתן להגיע למחלקה דרך חניון מרכז הסרטן. משם עולים במעליות לקומה השנייה, חוצים את הלובי לכיוון המעליות המרכזיות וממשיכים למיקום המדויק. | טקסט | בניין מכוסה |
| 4 | [מרכז לאבחון מהיר של סרטן](https://www.sheba.co.il/cancer/oncology/rapid-cancer-diagnosis/) | בניין מרכז הסרטן, קומה 4 קבלה למרפאה - בקומה 2 עקב עבודות בינוי, החל מתאריך 14.12.25, ניתן להגיע למחלקה דרך חניון מרכז הסרטן. משם עולים במעליות לקומה השנייה, חוצים את הלובי לכיוון המעליות המרכזיות וממשיכים למיקום המדויק. | טקסט | בניין מכוסה |
| ? | [אונקולוגיה מונעת למבוגרים](https://www.sheba.co.il/cancer/oncology/adults-preventive-oncology-clinic) | — | קישור הגעה | בניין מכוסה |
| ? | [המערך האונקולוגי](https://www.sheba.co.il/cancer/oncology/oncology-array/) | — | קישור הגעה | בניין מכוסה |
| ? | [המערך להמטולוגיה, השתלות מח עצם וטיפול תאי](https://www.sheba.co.il/cancer/hematology/hemato-oncology-array/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לגידולי ריאות](https://www.sheba.co.il/cancer/oncology/lung-cancer-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה למחלימים מסרטן](https://www.sheba.co.il/cancer/palliative-care/cancer-survivorship-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לקרינת גידולי ראש-צוואר](https://www.sheba.co.il/cancer/oncology/head-neck-tumors-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לקרינת גידולי ראש-צוואר](https://www.sheba.co.il/cancer/radiotherapy/head-neck-tumors-radiation-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת RESTART חוזרים למסלול](https://www.sheba.co.il/cancer/oncology/afternoon-young-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [שירות תזונה במרכז הסרטן](https://www.sheba.co.il/cancer/palliative-care/nutrition-service-cancer-center/) | — | קישור הגעה | בניין מכוסה |
| ? | [תוכנית לטיפול בחולי סרטן צעירים](https://www.sheba.co.il/cancer/oncology/young-patients-cancer-treatment/) | — | קישור הגעה | בניין מכוסה |

</details>

### בית החולים לנשים ויולדות (32)

<details><summary>הצג את 32 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [המחלקה לגינקולוגיה אונקולוגית](https://www.sheba.co.il/gynecology/departments/gynecology-oncology-department/) | בית חולים לנשים ויולדות, קומת כניסה, בהמשך למיון יולדות | טקסט | בניין מכוסה |
| 0 | [ניטור עוברי](https://www.sheba.co.il/pregnancy/clinics/fetal-monitoring/) | בית חולים לנשים ויולדות, קומת כניסה | טקסט | בניין מכוסה |
| 1 | [בנק הזרע](https://www.sheba.co.il/pregnancy/clinics/the-sperm-bank/) | בית חולים לנשים ויולדות, קומה 1 | טקסט | בניין מכוסה |
| 1 | [המחלקה להריון בסיכון גבוה](https://www.sheba.co.il/pregnancy/departments/high-risk-pregnancy-department/) | בית חולים לנשים ויולדות ע"ש יוסף בוכמן, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מעבדת בנק הזרע](https://www.sheba.co.il/general/labs/sperm-bank-lab/) | בניין נשים ויולדות, קומה 1, פריון הגבר | טקסט | בניין מכוסה |
| 1 | [מרפאת אנדומנופאוזה](https://www.sheba.co.il/gynecology/clinics/endo-menopause-clinic/) | בית חולים לנשים ויולדות, קומה 1 התור יתקיים במרכז לטיפול באנדומטריוזיס, בהמלצת מומחה אנדומטריוזיס. יש להצטייד בטופס 17 לפני הביקור. | טקסט | בניין מכוסה |
| 1 | [מרפאת כאב אגן משולבת במרכז לאנדומטריוזיס](https://www.sheba.co.il/gynecology/clinics/pelvic-pain-endometriosis-patients/) | בית חולים לנשים ויולדות, קומה 1 (במרכז לאנדומטריוזיס) טיפולים פולשניים תחת דימות מתבצעים במערך לשיכוך כאב, בניין אשפוז כללי, קומה 1 | טקסט | בניין מכוסה |
| 2 | [אנדוקרינולוגיה גינקולוגית](https://www.sheba.co.il/gynecology/clinics/endocrinology-gynecology-clinic) | בית חולים לנשים ומיילדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [היחידה לאולטרסאונד גינקולוגי ומיילדותי](https://www.sheba.co.il/gynecology/clinics/gynecological-obstetrical-ultrasound/) | בית החולים לנשים ויולדות, קומה שנייה | טקסט | בניין מכוסה |
| 2 | [היחידה לאורוגינקולוגיה ורצפת האגן](https://www.sheba.co.il/gynecology/clinics/urogynecology-pelvic-floor-unit/) | בית חולים נשים ויולדות, קומה 2 לידיעתך, אנו מכבדים טופסי התחייבות (טופס 17) של כל קופות החולים | טקסט | בניין מכוסה |
| 2 | [היחידה לנוירוגנטיקה](https://www.sheba.co.il/general/labs/neurogenetics-unit/) | בניין נשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [היחידה לרפואת העובר](https://www.sheba.co.il/pregnancy/clinics/fetal-medicine-unit/) | בית חולים לנשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [המכון הגנטי לתורשת האדם על שם גרטנר](https://www.sheba.co.il/general/labs/genetics-institute/) | בניין נשים ויולדות, קומה 2 ליצירת קשר וקביעת תורים ל | טקסט | בניין מכוסה |
| 2 | [המרכז לאבחון גנטי בעוברים טרום השרשה ברחם (PGD)](https://www.sheba.co.il/pregnancy/clinics/genetic-diagnosis-pgd-center/) | בית חולים לנשים ויולדות, המכון הגנטי, קומה 2 במרכז זה ניתן לקבל ייעוץ אונליין | טקסט | בניין מכוסה |
| 2 | [מרפאה טרטולוגית ייעוץ תרופתי לנשים בהריון](https://www.sheba.co.il/pregnancy/clinics/teratological-consultation/) | מרכז נשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [מרפאה לגינקולוגיה אונקולוגית](https://www.sheba.co.il/gynecology/clinics/gynecologic-oncology-clinic/) | בית חולים לנשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [מרפאה לייעוץ ותכנון לידה](https://www.sheba.co.il/pregnancy/clinics/birth-planning/) | בית חולים לנשים ויולדות, קומה 2, מרפאות הריון בסיכון | טקסט | בניין מכוסה |
| 2 | [מרפאה לכירורגיה פלסטית של איברי המין](https://www.sheba.co.il/gynecology/clinics/plastic-surgery-genitalia-clinic/) | בית חולים לנשים ויולדות, קומה 2 לידיעתך, אנו מכבדים טופסי התחייבות (טופס 17) של כל קופות החולים. אם אין לך טופס התחייבות, ניתן לשלם בעבור ביקור רופא בהתאם לתעריף משרד הבריאות. | טקסט | בניין מכוסה |
| 2 | [מרפאה לנוירולוגיה של העובר](https://www.sheba.co.il/pregnancy/clinics/fetal-neurology-clinic/) | בית חולים לנשים ויולדות, קומה 2, מכון גנטי לידיעתך, אנו מכבדים טופסי התחייבות (טופס 17) של כל קופות החולים. אם אין לך טופס התחייבות, ניתן לשלם בעבור ביקור רופא בהתאם לתעריף משרד הבריאות. | טקסט | בניין מכוסה |
| 2 | [מרפאה לניבוי רעלת הריון](https://www.sheba.co.il/pregnancy/clinics/prediction-of-preeclampsia/) | בית חולים לנשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [מרפאות הריון בסיכון גבוה](https://www.sheba.co.il/pregnancy/clinics/high-risk-pregnancy-clinics/) | בית החולים לנשים ויולדות, קומה 2 לידיעתך, אנו מכבדים טופסי התחייבות (טופס 17) של כל קופות החולים. אם אין לך טופס התחייבות, ניתן לשלם בעבור ביקור רופא בהתאם לתעריף משרד הבריאות. | טקסט | בניין מכוסה |
| 2 | [מרפאת גנטיקה למבוגרים](https://www.sheba.co.il/general/labs/adults-genetics-clinic/) | אגף נשים ומיילדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [מרפאת מעקב הריון לנשים עם אנדומטריוזיס](https://www.sheba.co.il/pregnancy/clinics/pregnancy-endometriosis-monitoring-clinic/) | בית חולים לנשים ויולדות, קומה 2 | טקסט | בניין מכוסה |
| 2 | [מרפאת נוירו הריון בסיכון גבוה](https://www.sheba.co.il/pregnancy/clinics/neuro-high-risk-pregnancy-clinic/) | בית החולים לנשים ויולדות, קומה 2, מרפאות הריון בסיכון | טקסט | בניין מכוסה |
| 2 | [מרפאת סוכרת בהריון](https://www.sheba.co.il/pregnancy/clinics/diabetes-pregnancy-clinic/) | אגף נשים ומיילדות, קומה 2 | טקסט | בניין מכוסה |
| ? | [היחידה להפלות חוזרות](https://www.sheba.co.il/pregnancy/clinics/recurrent-miscarriages/) | — | קישור הגעה | בניין מכוסה |
| ? | [היחידה לפריון הגבר](https://www.sheba.co.il/pregnancy/clinics/the-male-fertility-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [המערך לגינקולוגיה אונקולוגית](https://www.sheba.co.il/gynecology/departments/gynecology-oncology-array/) | בית החולים לנשים ויולדות | טקסט | בניין מכוסה |
| ? | [מערך היילודים](https://www.sheba.co.il/pediatrics/departments/neonatology-division/) | בניין נשים ויולדות היחידות שלנו יחידת קבלות יחידת אשפוז תינוקייה מלון יולדות שיבא בייבי | טקסט | בניין מכוסה |
| ? | [מרפאה לנשאיות X שביר](https://www.sheba.co.il/pregnancy/clinics/fragile-x-carriers-pregnancy-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לנשים עם קרישיות יתר ומחלות ראומטולוגיות](https://www.sheba.co.il/pregnancy/clinics/clinic-for-women-with-hypercoagulability-and-rheumatological-diseases/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת זיהומים בגינקולוגיה](https://www.sheba.co.il/gynecology/clinics/infections-gynecology-clinic/) | — | קישור הגעה | בניין מכוסה |

</details>

### בניין השיקום (32)

<details><summary>הצג את 32 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| -2 | [היחידה לריפוי בעיסוק - שיקום מרחוק](https://www.sheba.co.il/rehabilitation/clinics/occupational-therapy-online-remote-rehabilitation/) | בניין השיקום, קומה 2- | טקסט | בניין מכוסה |
| -1 | [אשפוז יום נפגעי ראש](https://www.sheba.co.il/rehabilitation/clinics/head-injuries-day-hospitalization/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| -1 | [היחידה לשיקום כאב](https://www.sheba.co.il/rehabilitation/clinics/pain-rehabilitation-unit/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| -1 | [מרכז נועם לטיפול, שיקום ובריאות האישה עם מוגבלות](https://www.sheba.co.il/rehabilitation/clinics/women-with-disabilities-noam-rehabilitation-center/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| -1 | [מרפאה לטיפול בפצעים קשיי ריפוי, פצעי לחץ וכף רגל סוכרתית](https://www.sheba.co.il/rehabilitation/clinics/wounds-pressure-sores-and-diabetic-foot-clinic/) | קומה 1-, בניין השיקום החדש | טקסט | בניין מכוסה |
| -1 | [מרפאת בריאות העצם לבעלי מוגבלות](https://www.sheba.co.il/rehabilitation/clinics/bone-health-for-the-disabled-clinic/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| -1 | [מרפאת פוסט-פוליו סינדרום (PPS)](https://www.sheba.co.il/rehabilitation/clinics/post-polio-syndrome-pps-clinic/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| -1 | [מרפאת פסיכולוגים בשיקום](https://www.sheba.co.il/rehabilitation/clinics/psychologists-rehabilitation-clinic/) | בניין השיקום, קומה 1- | טקסט | בניין מכוסה |
| 0 | [הבריכה הטיפולית - הידרותרפיה](https://www.sheba.co.il/rehabilitation/clinics/therapeutic-pool-hydrotherapy/) | בניין השיקום, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [היחידה לטיפול רפואי מתמשך](https://www.sheba.co.il/rehabilitation/clinics/continuous-medical-care-unit/) | בית החולים השיקומי, בניין השיקום, קומת קרקע (כניסה דרך מחלקת שיקום נוירולוגי) | טקסט | בניין מכוסה |
| 0 | [היחידה לריפוי בעיסוק – אשפוז יום שיקומי](https://www.sheba.co.il/rehabilitation/clinics/occupational-therapy-unit-rehabilitation-day-hospitalization/) | בניין השיקום, קומת הכניסה | טקסט | בניין מכוסה |
| 0 | [היחידה לריפוי בעיסוק – מכון צעדים](https://www.sheba.co.il/rehabilitation/clinics/occupational-therapy-unit-steps-institute/) | בניין השיקום, קומת הכניסה | טקסט | בניין מכוסה |
| 0 | [מכון צעדים – שיקום בתנועה](https://www.sheba.co.il/rehabilitation/clinics/steps-movement-rehabilitation-institute/) | בניין השיקום, קומת כניסה מה צריך להביא? הטיפול מותנה בבדיקה על ידי הצוות המקצועי של המכון, ובהמצאת טופס התחייבות (טופס 17) מהגורם המבטח. | טקסט | בניין מכוסה |
| 0 | [מרפאת נוהגים](https://www.sheba.co.il/rehabilitation/clinics/driving-clinic/) | בניין השיקום, יחידת ריפוי בעיסוק, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [פיזיותרפיה במחלקת שיקום נוירולוגי](https://www.sheba.co.il/rehabilitation/clinics/physiotherapy-neurological-rehabilitation/) | קומת הכניסה, מרכז השיקום החדש | טקסט | בניין מכוסה |
| 0 | [פיזיותרפיה לקטועי גפיים תחתונות](https://www.sheba.co.il/rehabilitation/clinics/physiotherapy-for-lower-limb-amputees-clinic/) | מזכירות ריפוי בעיסוק – מרכז השיקום קומת קרקע, כניסה מהלובי, בסוף המסדרון | טקסט | בניין מכוסה |
| 0 | [שיקום נוירו-אונקולוגי](https://www.sheba.co.il/rehabilitation/clinics/neuro-oncological-rehabilitation/) | בניין השיקום, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [תוכנית לשיקום פרקינסון](https://www.sheba.co.il/rehabilitation/clinics/parkinson-rehabilitation-program/) | בניין שיקום, קומת כניסה, מכון צעדים | טקסט | בניין מכוסה |
| 1 | [המחלקה להפרעות אכילה ומשקל](https://www.sheba.co.il/psychiatry/departments/eating-disorders-and-weight-department/) | בניין השיקום כניסה נפרדת בסמוך לכניסת הלובי, יש לעלות לקומה ראשונה | טקסט | בניין מכוסה |
| ? | [אשפוז יום נשימתי](https://www.sheba.co.il/rehabilitation/clinics/respiratory-day-hospitalization/) | — | קישור הגעה | בניין מכוסה |
| ? | [אשפוז יום שיקומי כללי](https://www.sheba.co.il/rehabilitation/clinics/general-rehabilitation-day-hospitalization/) | בניין השיקום | טקסט | בניין מכוסה |
| ? | [היחידה לריפוי בעיסוק – טרשת נפוצה](https://www.sheba.co.il/neuroscience/clinics/multiple-sclerosis-occupational-therapy-unit/) | מרכז השיקום החדש | טקסט | בניין מכוסה |
| ? | [מכון פיזיותרפיה פעילות משקמת](https://www.sheba.co.il/rehabilitation/clinics/restorative-activity-physiotherapy-institute/) | בניין השיקום החדש | טקסט | בניין מכוסה |
| ? | [מעבדת תנועה – הליכה ויציבה](https://www.sheba.co.il/rehabilitation/clinics/gait-posture-movement-laboratory/) | בניין השיקום, קומת טכנולוגיות מתקדמות (3-), מציאות מדומה | טקסט | בניין מכוסה |
| ? | [מרפאה לשיקום נוירו-אורולוגי](https://www.sheba.co.il/rehabilitation/clinics/neuro-urological-rehabilitation-clinic/) | בניין השיקום | טקסט | בניין מכוסה |
| ? | [מרפאת טרשת נפוצה לילדים ונוער](https://www.sheba.co.il/neuroscience/clinics/multiple-sclerosis-children/) | מרכז השיקום החדש | טקסט | בניין מכוסה |
| ? | [מרפאת מעקב לנפגעי שבץ או חבלה מוחית](https://www.sheba.co.il/rehabilitation/clinics/stroke-follow-up-clinic/) | בניין השיקום החדש | טקסט | בניין מכוסה |
| ? | [מרפאת משרד הביטחון – טיפול בפוסט טראומה](https://www.sheba.co.il/psychiatry/clinics/defense-ministry-ptsd/) | בניין השיקום | טקסט | בניין מכוסה |
| ? | [מרפאת פוריות הגבר בשיקום](https://www.sheba.co.il/rehabilitation/clinics/male-fertility-rehab-clinic/) | בניין השיקום | טקסט | בניין מכוסה |
| ? | [סדנת גל](https://www.sheba.co.il/rehabilitation/clinics/gal-workshop/) | בניין השיקום | טקסט | בניין מכוסה |
| ? | [פיזיותרפיה במחלקת שיקום אורתופדי](https://www.sheba.co.il/rehabilitation/clinics/orthopedic-rehabilitation-physiotherapy/) | בניין השיקום החדש | טקסט | בניין מכוסה |
| ? | [קלינאות תקשורת בשיקום נוירולוגי](https://www.sheba.co.il/rehabilitation/clinics/communication-speech-therapy-neurological-rehabilitation/) | — | קישור הגעה | בניין מכוסה |

</details>

### מרכז הלב, חזה וכלי דם (22)

<details><summary>הצג את 22 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [היחידה לקרדיולוגיה פולשנית: צנתור לב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/invasive-cardiology-unit/) | מרכז לב, חזה וכלי דם, קומת כניסה (0) | טקסט | בניין מכוסה |
| 0 | [המכון לאי-ספיקת לב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-failure-institute/) | בניין מרכז הלב, קומה 0 | טקסט | בניין מכוסה |
| 0 | [מרכז דוידאי להפרעות קצב וקוצבים](https://www.sheba.co.il/cardiovascular/cardiology-clinics/davidai-center-arrhythmias/) | בניין מרכז הלב, קומה 0 | טקסט | בניין מכוסה |
| 0 | [מרפאת קוצבים](https://www.sheba.co.il/cardiovascular/cardiology-clinics/pacemaker-clinic/) | בניין מרכז הלב, קומה 0 | טקסט | בניין מכוסה |
| 1 | [היחידה לקרדיולוגיה לא פולשנית - אקו לב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/non-invasive-cardiology-unit/) | בניין מרכז הלב, קומה 1 (דרך הלובי החדש) | טקסט | בניין מכוסה |
| 1 | [מרפאה לטיפול במומי לב מולדים במבוגרים](https://www.sheba.co.il/cardiovascular/cardiology-clinics/adult-congenital-heart/) | בניין מרכז הלב, קומה 1, מרפאות מרכז הלב | טקסט | בניין מכוסה |
| 1 | [מרפאת התעלפויות (סינקופה)](https://www.sheba.co.il/cardiovascular/cardiology-clinics/fainting-syncope-clinic/) | מרכז הלב, קומה 1, מרפאה קרדיולוגית | טקסט | בניין מכוסה |
| 1 | [מרפאת מעקב תמיכה מכנית ללב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/mechanical-heart-support-monitoring-clinic/) | מרכז לב, חזה וכלי דם, קומה 1 | טקסט | בניין מכוסה |
| 1 | [שירות תזונה (דיאטנית) במרכז הלב](https://www.sheba.co.il/cardiovascular/heart-surgeries-clinics/nutrition-service-heart-center/) | מרכז הלב, קומה 1 | טקסט | בניין מכוסה |
| 2 | [מכון כלי דם](https://www.sheba.co.il/cardiovascular/vascular-clinics/vascular-institute/) | בניין מרכז הלב, חזה וכלי דם, קומה 2 | טקסט | ✔ יעד: vascular |
| 2 | [מכון לשיקום חולי לב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-rehabilitation-institute/) | בניין מרכז הלב, קומה 2 | טקסט | בניין מכוסה |
| ? | [היחידה למחקרים קליניים במרכז הלב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-clinical-research-unit/) | — | קישור הגעה | בניין מכוסה |
| ? | [המערך הקרדיולוגי](https://www.sheba.co.il/cardiovascular/cardiology-clinics/cardiology-array/) | בניין מרכז הלב | טקסט | בניין מכוסה |
| ? | [מרפאה לחולי תסמונת מרפן](https://www.sheba.co.il/cardiovascular/heart-surgeries-clinics/marfan-syndrome-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לטיפול תומך בחולי אי-ספיקת לב מתקדמת](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-failure-supportive-care/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לכירורגיית כלי דם](https://www.sheba.co.il/cardiovascular/vascular-clinics/vascular-surgery-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאה לקרדיומיופתיות ומחלות לב תורשתיות](https://www.sheba.co.il/cardiovascular/cardiology-clinics/cardiomyopathies-hereditary-heart-diseases-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת טאבי TAVI](https://www.sheba.co.il/cardiovascular/cardiology-clinics/tavi-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת טיפול בפצעים לאחר ניתוח לב](https://www.sheba.co.il/cardiovascular/heart-surgeries-clinics/post-surgery-wounds/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת ייעוץ ומעקב קרדיאלי כללי](https://www.sheba.co.il/cardiovascular/cardiology-clinics/general-cardiac-consultation-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [מרפאת מעקב אחר מושתלי לב](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-transplant-follow-up-clinic/) | — | קישור הגעה | בניין מכוסה |
| ? | [תוכנית רב-תחומית לטיפול ברגל בסיכון](https://www.sheba.co.il/cardiovascular/vascular-clinics/leg-vascular-program/) | — | קישור הגעה | בניין מכוסה |

</details>

### אגף המעבדות (14)

<details><summary>הצג את 14 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [היחידה לטרנוסטיקה: טיפול באיזוטופים רדיואקטיביים](https://www.sheba.co.il/imaging/clinics/theranostics-unit/) | אגף מעבדות, קומת כניסה (בסמוך למכוני הרנטגן והאונקולוגיה). | טקסט | בניין מכוסה |
| 0 | [המכון לפתולוגיה](https://www.sheba.co.il/general/labs/pathology-institute/) | אגף מעבדות, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [המעבדה ההמטולוגית](https://www.sheba.co.il/general/labs/hematology-lab/) | אגף המעבדות, קומת קרקע (בין בנק הדם למרפאות מכון אלה) | טקסט | בניין מכוסה |
| 0 | [המעבדה העל-אוטומטית (מגה-לאב)](https://www.sheba.co.il/general/labs/mega-automatic-lab/) | בניין מעבדות, קומת קרקע | טקסט | בניין מכוסה |
| 0 | [מעבדה למיקרוסקופיה אלקטרונית](https://www.sheba.co.il/general/labs/electronic-microscopy-lab/) | בניין אגף המעבדות, קומת קרקע | טקסט | בניין מכוסה |
| 0 | [מעבדה מטבולית](https://www.sheba.co.il/general/labs/metabolic-laboratory/) | אגף מעבדות, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [מרכז לטרנוסטיקה ורפואה גרעינית](https://www.sheba.co.il/imaging/clinics/nuclear-medicine-institute/) | אגף מעבדות, קומת כניסה (בסמוך למכוני הרנטגן והאונקולוגיה). | טקסט | בניין מכוסה |
| 1 | [המעבדה המחקרית התרגומית במכון הגסטרואנטרולוגי](https://www.sheba.co.il/internal-medicine/laboratories/gastroenterology-laboratory/) | אגף המעבדות, קומה 1 | טקסט | בניין מכוסה |
| 1 | [המרכז לאונקו-פרמקולוגיה אבחונית](https://www.sheba.co.il/general/labs/diagnostic-oncopharmacology-center/) | אגף מעבדות, קומה 1, חדר 214 ל | טקסט | בניין מכוסה |
| 1 | [מכון עמליה בירון לחקר קרישת הדם](https://www.sheba.co.il/research/units/coagulation-research-institute/) | בנין מעבדות, קומה ראשונה מעל מרפאות המופיליה וקרישה ל | טקסט | בניין מכוסה |
| 1 | [מעבדה לקרישת דם](https://www.sheba.co.il/general/labs/blood-coagulation-lab/) | בניין אגף המעבדות, קומה 1, חדר 236, מכון עמליה בירון חדר 284 | טקסט | בניין מכוסה |
| 1 | [מעבדת HIV](https://www.sheba.co.il/general/labs/hiv-lab/) | אגף המעבדות קומה 1, מסדרון מחלת זיהומיות, חדר 206 קפיצה לראש העמוד קפיצה לראש העמוד שיבא במקום ה-7 בבתי החולים הטובים בעולם שנה שמינית ברציפות ב-TOP העולמי! רוצה להיות עם אצבע על הדופק? תרשמו אותי תחומים רפואיים | טקסט | בניין מכוסה |
| ? | [המעבדה המרכזית לנגיפים](https://www.sheba.co.il/general/labs/viruses-central-laboratory/) | — | Waze | בניין מכוסה |
| ? | [מעבדת ציטולוגיה](https://www.sheba.co.il/general/labs/cytology-lab/) | בניין אגף המעבדות | טקסט | בניין מכוסה |

</details>

### המכון להתפתחות הילד (13)

<details><summary>הצג את 13 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| ? | [אַחֲיוּת במכון להתפתחות הילד](https://www.sheba.co.il/pediatrics/clinics/nursing-at-child-development-institute) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרכז המחקר במכון להתפתחות הילד](https://www.sheba.co.il/pediatrics/clinics/research-center-child-development-institute/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאה התפתחותית כללית לילדים בגילאי 18-3](https://www.sheba.co.il/pediatrics/clinics/development-ages-3-18-clinic/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאה פארמה-התפתחותית](https://www.sheba.co.il/pediatrics/clinics/pharma-developmental-clinic/) | — | קישור הגעה | — |
| ? | [מרפאה רגשית התפתחותית לגיל הרך](https://www.sheba.co.il/pediatrics/clinics/early-age-emotional-development-clinic/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאת אופק לילדים אחרי אשפוז](https://www.sheba.co.il/pediatrics/clinics/ofek-children-after-hospitalization/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאת אכילה לילדים על הספקטרום האוטיסטי](https://www.sheba.co.il/pediatrics/clinics/eating-clinic-autistic-children/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאת הורות בקשב: ADHD לילדים צעירים גילאי 6-3](https://www.sheba.co.il/pediatrics/clinics/adhd-children-3-6/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [מרפאת התפתחות כללית לתינוקות ופעוטות בגילי 3-0](https://www.sheba.co.il/pediatrics/clinics/development-ages-0-3-clinic/) | המכון להתפתחות הילד, שיבא במרפאה זו ניתן לקבל גם ייעוץ אונליין. | טקסט | — |
| ? | [מרפאת מעקב אחר פגים בסיכון התפתחותי](https://www.sheba.co.il/pediatrics/clinics/monitoring-of-premature-infants/) | המכון להתפתחות הילד, שיבא במרפאה זו ניתן לקבל גם ייעוץ אונליין | טקסט | — |
| ? | [מרפאת פגים "ליווי קרוב"](https://www.sheba.co.il/pediatrics/clinics/premature-preemies-close-support-clinic/) | המכון להתפתחות הילד, שיבא במרפאה זו ניתן לקבל גם ייעוץ אונליין | טקסט | — |
| ? | [שירות פיזיותרפיה במכון להתפתחות הילד](https://www.sheba.co.il/pediatrics/clinics/physiotherapy-child-development-institute/) | המכון להתפתחות הילד, שיבא | טקסט | — |
| ? | [תוכנית טיפול למתבגרים על הרצף האוטיסטי](https://www.sheba.co.il/pediatrics/clinics/treatment-program-autistic-adolescents/) | המכון להתפתחות הילד, שיבא דרכי התקשרות | טקסט | — |

</details>

### מכון עיניים (11)

<details><summary>הצג את 11 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [היחידה הנוירו-אופתלמולוגית](https://www.sheba.co.il/surgery/units/neuro-ophthalmological-unit/) | בניין מכון עיניים, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [המכון לפלסטיקה של העין וארובות העיניים](https://www.sheba.co.il/surgery/clinics/eye-plastic-institute/) | בניין מכון עיניים, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [מרפאת אובאיטיס](https://www.sheba.co.il/surgery/clinics/uveitis-clinic/) | בניין מכון עיניים, קומת כניסה | טקסט | בניין מכוסה |
| 0 | [מרפאת רשתית ילדים](https://www.sheba.co.il/surgery/clinics/pediatric-retina-clinic/) | בניין מכון עיניים, קומת כניסה | טקסט | בניין מכוסה |
| 1 | [המכון לבריאות העין של הילד](https://www.sheba.co.il/pediatrics/clinics/eye-health-center/) | מכון עיניים, קומת הכניסה בימי שלישי, רביעי וחמישי - בבית החולים אדמונד ולילי ספרא לילדים, בקומה 1 | טקסט | בניין מכוסה |
| 1 | [מכון הדמיה עיניים](https://www.sheba.co.il/surgery/clinics/eye-imaging-institute/) | בניין מכון עיניים, קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרכז גלאוקומה](https://www.sheba.co.il/surgery/clinics/glaucoma-center/) | בניין מכון עיניים, קומה 1 | טקסט | בניין מכוסה |
| 2 | [מרפאה למחלות רשתית תורשתיות ואלקטרופיזיולוגיה של העצב והרשתית](https://www.sheba.co.il/surgery/clinics/nerve-and-retina-electrophysiology/) | בניין מכון עיניים, קומה 2 | טקסט | בניין מכוסה |
| ? | [מרפאה לייעוץ גנטי למטופלים עם מחלות עיניים על רקע תורשתי](https://www.sheba.co.il/internal-medicine/clinics/eyes-genetic-counseling-clinic/) | מכון עיניים | טקסט | בניין מכוסה |
| ? | [מרפאת אוקולופלסטיקה ילדים](https://www.sheba.co.il/surgery/clinics/pediatric-oculoplastic-clinic/) | בניין מכון עיניים לקביעת תור למרפאה נדרש טופס הפניה רגיל מקופת החולים. | טקסט | בניין מכוסה |
| ? | [מרפאת הפרעות תנועה המערבות את העיניים](https://www.sheba.co.il/surgery/clinics/movement-disorders-involving-the-eyes-clinic/) | בניין מכון עיניים | טקסט | בניין מכוסה |

</details>

### בניין האגף לרפואת הנפש (9)

<details><summary>הצג את 9 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| -1 | [מרכז חוה](https://www.sheba.co.il/pregnancy/clinics/chava-center-mental-health-for-women/) | מרפאת חוה - בניין פסיכיאטריה יחידת טיפול יום אם-תינוק - קומה 1-, מתחת למלון שי-לב, צמוד לחדר כושר עובדים WE. לפנייה למרכז ומילוי השאלונים | טקסט | ✔ יעד: psychiatry |
| ? | [אדווה – מרפאה לטיפול בהפרעת אישיות גבולית](https://www.sheba.co.il/psychiatry/clinics/adva-borderline-disorder-clinic) | בניין פסיכיאטריה | טקסט | — |
| ? | [אשפוז יום פסיכיאטרי](https://www.sheba.co.il/psychiatry/departments/psychiatry-day-hospitalization/) | בניין פסיכיאטריה, מול בניין שיקום המבוגר | טקסט | — |
| ? | [מרפאת דרור - לטיפול קוגנטיבי-התנהגותי (CBT)](https://www.sheba.co.il/psychiatry/clinics/dror-cbt-treatment/) | בניין פסיכיאטריה | טקסט | — |
| ? | [מרפאת חוה](https://www.sheba.co.il/pregnancy/clinics/chava-clinic/) | בניין פסיכיאטריה | טקסט | — |
| ? | [מרפאת פסיכיאטריה כללית (אופק)](https://www.sheba.co.il/psychiatry/clinics/ofek-general-psychiatry/) | בניין פסיכיאטריה | טקסט | — |
| ? | [מרפאת שחר – צעירים החווים משבר פסיכוטי ראשון](https://www.sheba.co.il/psychiatry/clinics/shachar-first-crisis/) | בניין פסיכיאטריה | טקסט | — |
| ? | [נוירופידבק לטיפול בפוסט טראומה](https://www.sheba.co.il/psychiatry/clinics/neurofeedback-treatment-ptsd-clinic/) | האגף לרפואת הנפש, בניין פסיכיאטריה, חדר 87 | טקסט | — |
| ? | [שירות הריפוי בעיסוק באגף רפואת הנפש](https://www.sheba.co.il/psychiatry/clinics/occupational-therapy-psychiatry-wing/) | בניין פסיכיאטריה | טקסט | — |

</details>

### מכון אף-אוזן-גרון (6)

<details><summary>הצג את 6 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [מכון שמיעה שפה ודיבור](https://www.sheba.co.il/surgery/clinics/hearing-speech-institute/) | בניין מכון שמיעה, שפה ודיבור (צמוד לבניין אף-אוזן-גרון), קומת כניסה | טקסט | בניין מכוסה |
| ? | [דרכי הדמעות - מרפאה משותפת של פלסטיקה, עיניים ואף-אוזן-גרון](https://www.sheba.co.il/surgery/clinics/tear-ducts-clinic/) | בניין אף אוזן גרון | טקסט | בניין מכוסה |
| ? | [המרכז הווסטיבולרי – סחרחורות והפרעות בשיווי המשקל](https://www.sheba.co.il/surgery/clinics/vestibular-center/) | בניין אף אוזן גרון | טקסט | בניין מכוסה |
| ? | [מרפאה משותפת כירורגיה ואונקולוגיה של ראש וצוואר](https://www.sheba.co.il/surgery/clinics/head-and-neck-surgery-and-oncology-clinic/) | בניין אף אוזן גרון | טקסט | בניין מכוסה |
| ? | [מרפאת דום נשימה](https://www.sheba.co.il/surgery/clinics/sleep-apnea-clinic/) | בניין אף אוזן גרון | טקסט | בניין מכוסה |
| ? | [מרפאת רפואת האוזן](https://www.sheba.co.il/surgery/clinics/ear-medicine/) | בניין אף אוזן גרון בכניסה הראשית לשיבא פונים מיד שמאלה, הבניין נמצא משמאל לכיכר התנועה הראשונה | טקסט | בניין מכוסה |

</details>

### בניין פדה לשיקום המבוגר (5)

<details><summary>הצג את 5 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| -1 | [מרפאה גריאטרית](https://www.sheba.co.il/geriatrics/clinics/geriatric-clinic/) | הבניין לשיקום המבוגר ע"ש פדה, קומה 1- | טקסט | בניין מכוסה |
| 1 | [מרפאת גרנולומטוס מסטיטיס](https://www.sheba.co.il/internal-medicine/clinics/granulomatous-mastitis-clinic/) | הבניין לשיקום המבוגר (פדה), קומה 1 | טקסט | בניין מכוסה |
| 1 | [מרפאת מעקב פנימית ט](https://www.sheba.co.il/internal-medicine/clinics/internal-i-follow-up-clinic/) | הבניין לשיקום המבוגר (פדה), קומה 1 | טקסט | בניין מכוסה |
| ? | [האגף לרפואת הגיל השלישי](https://www.sheba.co.il/geriatrics/departments/geriatrics-division/) | הבניין לשיקום המבוגר ע"ש פדה | טקסט | בניין מכוסה |
| ? | [מרפאה לטיפול בכאב גריאטרי](https://www.sheba.co.il/geriatrics/clinics/geriatric-pain-treatment-clinic/) | הבניין לשיקום המבוגר ע"ש פדה | טקסט | בניין מכוסה |

</details>

### ביתן 16 (4)

<details><summary>הצג את 4 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| ? | [היחידה למענקי מחקר ושיתופי פעולה אקדמיים](https://www.sheba.co.il/research/units/grants-and-research-collaborations/) | ביתן 16 ג, סמוך למכון אף-אוזן-גרון | טקסט | — |
| ? | [מרפאת בריאות הנפש בני ברק](https://www.sheba.co.il/psychiatry/clinics/bnei-brak-mental-health-clinic/) | ביתן 16, לשעבר קלאס קליניק, סמוך לבית אבות גיל-עד ל | טקסט | — |
| ? | [מרפאת דודאים למגזר הדתי](https://www.sheba.co.il/preventive-medicine/clinics/dudaim-for-religious-sector/) | ביתן 16א, המרכז הרפואי שיבא | טקסט | — |
| ? | [מרפאת נג"ה - נשים ונפש בגיל המעבר](https://www.sheba.co.il/gynecology/clinics/menopause-psychiatry-noga-clinic/) | מרכז "בדרכך" - ביתן 16, שיבא | טקסט | — |

</details>

### בניין סוכרת ואנדוקרינולוגיה (4)

<details><summary>הצג את 4 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [מרפאה לכירורגיה בריאטרית ומטבולית](https://www.sheba.co.il/surgery/clinics/bariatric-metabolic-surgery-clinic/) | בניין סוכרת (בניין שמוק), קומת כניסה | טקסט | — |
| 2 | [המכון לאנדוקרינולוגיה וסוכרת](https://www.sheba.co.il/internal-medicine/clinics/endocrinology-institute/) | בניין סוכרת ואנדוקרינולוגיה (בניין שמוק), קומה 2 | טקסט | — |
| 2 | [סוכרת 360⁰ לבני 60+](https://www.sheba.co.il/internal-medicine/clinics/multidisciplinary-program-healthy-living-diabetes/) | בניין שמוק (בניין אנדוקרינולוגיה וסוכרת), קומה 2 | טקסט | — |
| 3 | [מעבדת מחקר לסוכרת ולאנדוקרינולוגיה](https://www.sheba.co.il/research/units/diabetes-and-endocrinology-research-laboratory/) | בניין שמוק (בניין אנדוקרינולוגיה וסוכרת), קומה 3 | טקסט | — |

</details>

### החניון המרכזי + מרכז הצומת (3)

<details><summary>הצג את 3 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 4 | [היחידה לדימות שד](https://www.sheba.co.il/imaging/clinics/breast-imaging-unit/) | לחונים בחניון הצומת: קומה 4, פרוזדור מכונים ומרפאות, פנייה ראשונה שמאלה | טקסט | — |
| 4 | [מרפאה לכירורגיה פלסטית של השד](https://www.sheba.co.il/surgery/clinics/breast-plastic-surgery-clinic/) | לחונים בחניון הצומת: קומה 4, פרוזדור מכונים ומרפאות, פנייה ראשונה שמאלה | טקסט | — |
| ? | [מרפאת מעקב לנשאיות BRCA](https://www.sheba.co.il/surgery/clinics/brca-clinic/) | — | Waze | — |

</details>

### מיון (1)

<details><summary>הצג את 1 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 2 | [אגף טיפול נמרץ](https://www.sheba.co.il/general/clinics/intensive-care-division) | קומה שנייה מעל המחלקה לרפואה דחופה (מיון) | טקסט | בניין מכוסה |

</details>

### בנק הדם (1)

<details><summary>הצג את 1 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| 0 | [מכון לרפואת עירויים - בנק דם](https://www.sheba.co.il/general/labs/blood-bank-labs/) | מעבדת בנק הדם: בניין המעבדות, קומת קרקע תרומות דם: בלובי המרכזי של בניין האשפוז או ביחידת התרמות הדם שנמצאת באגף מרפאות החוץ (צמוד לדלפק המרפאה הכירורגית) בקומת הכניסה של בניין האשפוז. | טקסט | בניין מכוסה |

</details>

### מכון פה ולסת (1)

<details><summary>הצג את 1 המרפאות</summary>

| קומה | מרפאה | מיקום כפי שמופיע באתר | נלמד מ- | באפליקציה |
|---|---|---|---|---|
| ? | [מרפאה רגרנטיבית במכון פה ולסת](https://www.sheba.co.il/surgery/clinics/regenerative-clinic-oral-maxillofacial/) | — | קישור הגעה | בניין מכוסה |

</details>

## ללא מיקום ידוע (191)

בדפים האלה אין שדה "מיקום" ואין קישור הגעה שמזהה בניין. אפשר לברר בשטח (העורך `?edit=1`) או ללחוץ על חיפוש במפות.

<details open><summary>הצג את 191 המרפאות</summary>

| מרפאה | תחום | חיפוש |
|---|---|---|
| [אגף דיאגנוסטיקה (מעבדות קליניות)](https://www.sheba.co.il/general/labs/diagnostics-division) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%90%D7%92%D7%A3%20%D7%93%D7%99%D7%90%D7%92%D7%A0%D7%95%D7%A1%D7%98%D7%99%D7%A7%D7%94%20(%D7%9E%D7%A2%D7%91%D7%93%D7%95%D7%AA%20%D7%A7%D7%9C%D7%99%D7%A0%D7%99%D7%95%D7%AA)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [אנחנו כאן בשבילך](https://www.sheba.co.il/general/clinics/sheba-services-for-you) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%90%D7%A0%D7%97%D7%A0%D7%95%20%D7%9B%D7%90%D7%9F%20%D7%91%D7%A9%D7%91%D7%99%D7%9C%D7%9A%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [בנק המוח – מאגר רקמות מוח](https://www.sheba.co.il/neuroscience/neuro-surgery/brain-tissue-repository-brain-bank/) | מוח ועצבים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%91%D7%A0%D7%A7%20%D7%94%D7%9E%D7%95%D7%97%20%E2%80%93%20%D7%9E%D7%90%D7%92%D7%A8%20%D7%A8%D7%A7%D7%9E%D7%95%D7%AA%20%D7%9E%D7%95%D7%97%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [גיוס סטודנטים למחקרים](https://www.sheba.co.il/research/units/students-recruitment/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%92%D7%99%D7%95%D7%A1%20%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D%20%D7%9C%D7%9E%D7%97%D7%A7%D7%A8%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [גן תקשורת אבחוני](https://www.sheba.co.il/pediatrics/services/diagnostic-communication-kindergarten/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%92%D7%9F%20%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%A0%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [הוספיס טיפול תומך](https://www.sheba.co.il/rehabilitation/clinics/hospice/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%95%D7%A1%D7%A4%D7%99%D7%A1%20%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%AA%D7%95%D7%9E%D7%9A%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה לאיכות ובטיחות הטיפול](https://www.sheba.co.il/general/clinics/treatment-quality-and-safety-unit/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA%20%D7%95%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA%20%D7%94%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה לכירורגיה אונקולוגית, שד ומלנומה](https://www.sheba.co.il/surgery/units/oncological-surgery-breast-and-melanoma-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%2C%20%D7%A9%D7%93%20%D7%95%D7%9E%D7%9C%D7%A0%D7%95%D7%9E%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה לכירורגיה של מערכת העיכול העליונה וניתוחים בריאטריים](https://www.sheba.co.il/surgery/units/bariatric-surgery-ugi-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%A9%D7%9C%20%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A2%D7%99%D7%9B%D7%95%D7%9C%20%D7%94%D7%A2%D7%9C%D7%99%D7%95%D7%A0%D7%94%20%D7%95%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%D7%9D%20%D7%91%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה לכליות ומערכת השתן](https://www.sheba.co.il/imaging/clinics/kidney-and-urinary-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9B%D7%9C%D7%99%D7%95%D7%AA%20%D7%95%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A9%D7%AA%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה למחקרים קליניים מוקדמים](https://www.sheba.co.il/research/units/early-phase-clinical-trials/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9E%D7%97%D7%A7%D7%A8%D7%99%D7%9D%20%D7%A7%D7%9C%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%9E%D7%95%D7%A7%D7%93%D7%9E%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [היחידה לניתוחי כבד, לבלב, דרכי מרה והשתלות](https://www.sheba.co.il/surgery/units/hepatobiliary-and-transplants-surgery-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%20%D7%9B%D7%91%D7%93%2C%20%D7%9C%D7%91%D7%9C%D7%91%2C%20%D7%93%D7%A8%D7%9B%D7%99%20%D7%9E%D7%A8%D7%94%20%D7%95%D7%94%D7%A9%D7%AA%D7%9C%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המאיץ האקדמי](https://www.sheba.co.il/education/clinics/academic-accelerator-program/) | הכשרה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%90%D7%99%D7%A5%20%D7%94%D7%90%D7%A7%D7%93%D7%9E%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המחלקה לתזונה](https://www.sheba.co.il/general/allied-health-professions/nutrition-and-diet-service/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%AA%D7%96%D7%95%D7%A0%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המכון הלאומי לרפואת ספורט](https://www.sheba.co.il/preventive-medicine/clinics/the-national-institute-of-sports-medicine/) | רפואה מונעת | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%9B%D7%95%D7%9F%20%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%A1%D7%A4%D7%95%D7%A8%D7%98%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המכון לחקר תאי אב בילדים](https://www.sheba.co.il/research/units/pediatric-stem-cell-research-institute/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%9B%D7%95%D7%9F%20%D7%9C%D7%97%D7%A7%D7%A8%20%D7%AA%D7%90%D7%99%20%D7%90%D7%91%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המכון לרפואת הפה](https://www.sheba.co.il/surgery/units/oral-health-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%9B%D7%95%D7%9F%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%94%D7%A4%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המעבדה לחקר טרנס-דיפרנציאציה וגמישיות (Plasticity) של תאי סרטן](https://www.sheba.co.il/research/units/laboratory-study-trans-differentiation-and-plasticity-of-cancer-cells/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%97%D7%A7%D7%A8%20%D7%98%D7%A8%D7%A0%D7%A1-%D7%93%D7%99%D7%A4%D7%A8%D7%A0%D7%A6%D7%99%D7%90%D7%A6%D7%99%D7%94%20%D7%95%D7%92%D7%9E%D7%99%D7%A9%D7%99%D7%95%D7%AA%20(Plasticity)%20%D7%A9%D7%9C%20%D7%AA%D7%90%D7%99%20%D7%A1%D7%A8%D7%98%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המערך להפרעות אכילה ומשקל](https://www.sheba.co.il/psychiatry/clinics/weight-and-eating-disorders-array/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A2%D7%A8%D7%9A%20%D7%9C%D7%94%D7%A4%D7%A8%D7%A2%D7%95%D7%AA%20%D7%90%D7%9B%D7%99%D7%9C%D7%94%20%D7%95%D7%9E%D7%A9%D7%A7%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז הרב-תחומי לטיפול בכאבי אגן כרוניים ונוירופלביולוגיה](https://www.sheba.co.il/gynecology/clinics/pelvic-pain-and-neuro-phlebology-center/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%94%D7%A8%D7%91-%D7%AA%D7%97%D7%95%D7%9E%D7%99%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%9B%D7%90%D7%91%D7%99%20%D7%90%D7%92%D7%9F%20%D7%9B%D7%A8%D7%95%D7%A0%D7%99%D7%99%D7%9D%20%D7%95%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%A4%D7%9C%D7%91%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לביותרפיה מתקדמת (ABC)](https://www.sheba.co.il/research/units/advanced-biotherapy-center/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%91%D7%99%D7%95%D7%AA%D7%A8%D7%A4%D7%99%D7%94%20%D7%9E%D7%AA%D7%A7%D7%93%D7%9E%D7%AA%20(ABC)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז להנדסת שתלי עור (בנק העור)](https://www.sheba.co.il/surgery/clinics/skin-bank-and-laboratory/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%94%D7%A0%D7%93%D7%A1%D7%AA%20%D7%A9%D7%AA%D7%9C%D7%99%20%D7%A2%D7%95%D7%A8%20(%D7%91%D7%A0%D7%A7%20%D7%94%D7%A2%D7%95%D7%A8)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז להשתלות כליה](https://www.sheba.co.il/general/transplant-centers/kidney-transplants-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%94%D7%A9%D7%AA%D7%9C%D7%95%D7%AA%20%D7%9B%D7%9C%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז להשתלות ריאה](https://www.sheba.co.il/general/transplant-centers/lung-transplants-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%94%D7%A9%D7%AA%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%90%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לטיפול באנדומטריוזיס](https://www.sheba.co.il/gynecology/clinics/endometriosis-care-center/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%90%D7%A0%D7%93%D7%95%D7%9E%D7%98%D7%A8%D7%99%D7%95%D7%96%D7%99%D7%A1%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לטיפול בהגדלה שפירה של הערמונית](https://www.sheba.co.il/surgery/clinics/benign-prostatic-hyperplasia-center/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%94%D7%92%D7%93%D7%9C%D7%94%20%D7%A9%D7%A4%D7%99%D7%A8%D7%94%20%D7%A9%D7%9C%20%D7%94%D7%A2%D7%A8%D7%9E%D7%95%D7%A0%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לטיפול בעודף משקל](https://www.sheba.co.il/internal-medicine/clinics/weight-management-center/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%A2%D7%95%D7%93%D7%A3%20%D7%9E%D7%A9%D7%A7%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לטיפול נוירוכירורגי בכאב](https://www.sheba.co.il/neuroscience/neuro-surgery/neurosurgical-pain-center/) | מוח ועצבים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%20%D7%91%D7%9B%D7%90%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לטכנולוגיות מתקדמות](https://www.sheba.co.il/surgery/clinics/advanced-technology-center/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%9B%D7%A0%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%95%D7%AA%20%D7%9E%D7%AA%D7%A7%D7%93%D7%9E%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז למדעי המוח ע"ש יוסף סגול](https://www.sheba.co.il/research/units/the-joseph-sagol-neuroscience-center/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%9E%D7%93%D7%A2%D7%99%20%D7%94%D7%9E%D7%95%D7%97%20%D7%A2%22%D7%A9%20%D7%99%D7%95%D7%A1%D7%A3%20%D7%A1%D7%92%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לרדיולוגיה פולשנית](https://www.sheba.co.il/imaging/clinics/interventional-radiology/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%93%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A4%D7%95%D7%9C%D7%A9%D7%A0%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לריפוי פצעים](https://www.sheba.co.il/surgery/clinics/wound-healing-center/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%99%D7%A4%D7%95%D7%99%20%D7%A4%D7%A6%D7%A2%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לרפואת העתיד](https://www.sheba.co.il/general/clinics/future-health-care-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%94%D7%A2%D7%AA%D7%99%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לרפואת שינה ילדים](https://www.sheba.co.il/pediatrics/clinics/sleep-center/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%A9%D7%99%D7%A0%D7%94%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לשיקום הפרעת תנועה ספסטית](https://www.sheba.co.il/rehabilitation/clinics/spastic-movement-disorder-center/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%94%D7%A4%D7%A8%D7%A2%D7%AA%20%D7%AA%D7%A0%D7%95%D7%A2%D7%94%20%D7%A1%D7%A4%D7%A1%D7%98%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרכז לשיקום מיני לאנשים בעלי מוגבלות](https://www.sheba.co.il/rehabilitation/clinics/sexual-rehabilitation-for-people-with-disabilities-center/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%9E%D7%99%D7%A0%D7%99%20%D7%9C%D7%90%D7%A0%D7%A9%D7%99%D7%9D%20%D7%91%D7%A2%D7%9C%D7%99%20%D7%9E%D7%95%D7%92%D7%91%D7%9C%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה האנדוקרינית להתאמה מגדרית](https://www.sheba.co.il/internal-medicine/clinics/gender-reassignment-endocrine-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%94%D7%90%D7%A0%D7%93%D7%95%D7%A7%D7%A8%D7%99%D7%A0%D7%99%D7%AA%20%D7%9C%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%9E%D7%92%D7%93%D7%A8%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה המשולבת לאטרזיה בוושט](https://www.sheba.co.il/pediatrics/clinics/esophageal-atresia-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%94%D7%9E%D7%A9%D7%95%D7%9C%D7%91%D7%AA%20%D7%9C%D7%90%D7%98%D7%A8%D7%96%D7%99%D7%94%20%D7%91%D7%95%D7%95%D7%A9%D7%98%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה המשולבת לדלקת ושט אאוזינופילית ומחלות אלרגיות של דרכי העיכול](https://www.sheba.co.il/pediatrics/clinics/combined-clinic-eosinophilic-esophagitis-and-allergic-gastrointestinal-diseases/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%94%D7%9E%D7%A9%D7%95%D7%9C%D7%91%D7%AA%20%D7%9C%D7%93%D7%9C%D7%A7%D7%AA%20%D7%95%D7%A9%D7%98%20%D7%90%D7%90%D7%95%D7%96%D7%99%D7%A0%D7%95%D7%A4%D7%99%D7%9C%D7%99%D7%AA%20%D7%95%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%9C%D7%A8%D7%92%D7%99%D7%95%D7%AA%20%D7%A9%D7%9C%20%D7%93%D7%A8%D7%9B%D7%99%20%D7%94%D7%A2%D7%99%D7%9B%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה לבעיות אכילה בגיל הרך](https://www.sheba.co.il/pediatrics/clinics/early-childhood-eating-disorders-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%91%D7%A2%D7%99%D7%95%D7%AA%20%D7%90%D7%9B%D7%99%D7%9C%D7%94%20%D7%91%D7%92%D7%99%D7%9C%20%D7%94%D7%A8%D7%9A%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה לגידולים גינקו-אונקולוגיים](https://www.sheba.co.il/cancer/oncology/gynecologic-tumors-clinic/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%D7%9D%20%D7%92%D7%99%D7%A0%D7%A7%D7%95-%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה לפסיכולוגיה רפואית בילדים](https://www.sheba.co.il/pediatrics/clinics/medical-psychology-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A8%D7%A4%D7%95%D7%90%D7%99%D7%AA%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [המרפאה לתקשורת תומכת חלופית (תת"ח)](https://www.sheba.co.il/pediatrics/clinics/alternative-supportive-communication-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA%20%D7%AA%D7%95%D7%9E%D7%9B%D7%AA%20%D7%97%D7%9C%D7%95%D7%A4%D7%99%D7%AA%20(%D7%AA%D7%AA%22%D7%97)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [הנהלת בית החולים לנשים ויולדות](https://www.sheba.co.il/gynecology/about/management/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A0%D7%94%D7%9C%D7%AA%20%D7%91%D7%99%D7%AA%20%D7%94%D7%97%D7%95%D7%9C%D7%99%D7%9D%20%D7%9C%D7%A0%D7%A9%D7%99%D7%9D%20%D7%95%D7%99%D7%95%D7%9C%D7%93%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [הסדרת תשלומים לביקור במיון](https://www.sheba.co.il/general/emergency-units/er-payments/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A1%D7%93%D7%A8%D7%AA%20%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D%20%D7%9C%D7%91%D7%99%D7%A7%D7%95%D7%A8%20%D7%91%D7%9E%D7%99%D7%95%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [הקליניקה הגאה](https://www.sheba.co.il/preventive-medicine/clinics/sexual-therapy-lgbtq-service/) | רפואה מונעת | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A7%D7%9C%D7%99%D7%A0%D7%99%D7%A7%D7%94%20%D7%94%D7%92%D7%90%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [הריונית מדוברת – מילון למונחי הריון ולידה](https://www.sheba.co.il/pregnancy/clinics/pregnancy-and-birth-glossary/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A8%D7%99%D7%95%D7%A0%D7%99%D7%AA%20%D7%9E%D7%93%D7%95%D7%91%D7%A8%D7%AA%20%E2%80%93%20%D7%9E%D7%99%D7%9C%D7%95%D7%9F%20%D7%9C%D7%9E%D7%95%D7%A0%D7%97%D7%99%20%D7%94%D7%A8%D7%99%D7%95%D7%9F%20%D7%95%D7%9C%D7%99%D7%93%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הסוציאלי בבית החולים ספרא לילדים](https://www.sheba.co.il/pediatrics/services/social-services-safra-childrens-hospital/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%20%D7%91%D7%91%D7%99%D7%AA%20%D7%94%D7%97%D7%95%D7%9C%D7%99%D7%9D%20%D7%A1%D7%A4%D7%A8%D7%90%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הסוציאלי במחלקות לרפואה דחופה](https://www.sheba.co.il/pediatrics/services/social-service-emergency-departments/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%20%D7%91%D7%9E%D7%97%D7%9C%D7%A7%D7%95%D7%AA%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%94%20%D7%93%D7%97%D7%95%D7%A4%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הסוציאלי במחלקת שיקום ילדים](https://www.sheba.co.il/pediatrics/services/social-service-childrens-rehabilitation-department/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%20%D7%91%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הסוציאלי במכון להתפתחות הילד](https://www.sheba.co.il/pediatrics/services/social-service-child-development-institute/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%20%D7%91%D7%9E%D7%9B%D7%95%D7%9F%20%D7%9C%D7%94%D7%AA%D7%A4%D7%AA%D7%97%D7%95%D7%AA%20%D7%94%D7%99%D7%9C%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הפסיכולוגי במרכז לטרשת נפוצה](https://www.sheba.co.il/rehabilitation/clinics/psychological-service-multiple-sclerosis/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%9C%D7%95%D7%92%D7%99%20%D7%91%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%98%D7%A8%D7%A9%D7%AA%20%D7%A0%D7%A4%D7%95%D7%A6%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הפסיכולוגי לילדים ונוער](https://www.sheba.co.il/pediatrics/services/pediatric-psychological-service/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%9C%D7%95%D7%92%D7%99%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%95%D7%A0%D7%95%D7%A2%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות הפסיכוסוציאלי במערך להמטואונקולוגיה ילדים](https://www.sheba.co.il/pediatrics/services/psychosocial-service-pediatric-hemato-oncology-unit/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%94%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%20%D7%91%D7%9E%D7%A2%D7%A8%D7%9A%20%D7%9C%D7%94%D7%9E%D7%98%D7%95%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות לגידולי מוח בילדים](https://www.sheba.co.il/pediatrics/clinics/brain-tumors-children-service/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%9E%D7%95%D7%97%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות לטיפול במחלות אאוזינופיליות](https://www.sheba.co.il/internal-medicine/clinics/eosinophilic-diseases-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%90%D7%95%D7%96%D7%99%D7%A0%D7%95%D7%A4%D7%99%D7%9C%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות לעבודה סוציאלית](https://www.sheba.co.il/general/allied-health-professions/social-work-service/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%9C%D7%A2%D7%91%D7%95%D7%93%D7%94%20%D7%A1%D7%95%D7%A6%D7%99%D7%90%D7%9C%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [השירות לריפוי בעיסוק](https://www.sheba.co.il/general/allied-health-professions/occupational-therapy-service/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%9C%D7%A8%D7%99%D7%A4%D7%95%D7%99%20%D7%91%D7%A2%D7%99%D7%A1%D7%95%D7%A7%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [התקשרויות מסחריות](https://www.sheba.co.il/research/units/commercial-department/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%94%D7%AA%D7%A7%D7%A9%D7%A8%D7%95%D7%99%D7%95%D7%AA%20%D7%9E%D7%A1%D7%97%D7%A8%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [חדר מיון פסיכיאטרי](https://www.sheba.co.il/psychiatry/departments/psychiatric-emergency-room/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%97%D7%93%D7%A8%20%D7%9E%D7%99%D7%95%D7%9F%20%D7%A4%D7%A1%D7%99%D7%9B%D7%99%D7%90%D7%98%D7%A8%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [חדרי התאוששות לאחר ניתוח באגף נשים ויולדות](https://www.sheba.co.il/gynecology/clinics/recovery-rooms-after-surgery-womens-and-maternity-wing/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%97%D7%93%D7%A8%D7%99%20%D7%94%D7%AA%D7%90%D7%95%D7%A9%D7%A9%D7%95%D7%AA%20%D7%9C%D7%90%D7%97%D7%A8%20%D7%A0%D7%99%D7%AA%D7%95%D7%97%20%D7%91%D7%90%D7%92%D7%A3%20%D7%A0%D7%A9%D7%99%D7%9D%20%D7%95%D7%99%D7%95%D7%9C%D7%93%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [חושבים תנועה, מרפאה לילדים עם הפרעה התפתחותית קואורדינטיבית (DCD)](https://www.sheba.co.il/pediatrics/clinics/dcd-coordination-movement-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%97%D7%95%D7%A9%D7%91%D7%99%D7%9D%20%D7%AA%D7%A0%D7%95%D7%A2%D7%94%2C%20%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A2%D7%9D%20%D7%94%D7%A4%D7%A8%D7%A2%D7%94%20%D7%94%D7%AA%D7%A4%D7%AA%D7%97%D7%95%D7%AA%D7%99%D7%AA%20%D7%A7%D7%95%D7%90%D7%95%D7%A8%D7%93%D7%99%D7%A0%D7%98%D7%99%D7%91%D7%99%D7%AA%20(DCD)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [טיפול באמצעות אמנויות](https://www.sheba.co.il/rehabilitation/clinics/art-therapy/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%90%D7%9E%D7%A6%D7%A2%D7%95%D7%AA%20%D7%90%D7%9E%D7%A0%D7%95%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [טיפול בהפרעות בתקשורת במכון להתפתחות הילד](https://www.sheba.co.il/pediatrics/clinics/speech-therapy-child-development-institute/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%94%D7%A4%D7%A8%D7%A2%D7%95%D7%AA%20%D7%91%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA%20%D7%91%D7%9E%D7%9B%D7%95%D7%9F%20%D7%9C%D7%94%D7%AA%D7%A4%D7%AA%D7%97%D7%95%D7%AA%20%D7%94%D7%99%D7%9C%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [טיפול נמרץ ניתוחי לב](https://www.sheba.co.il/cardiovascular/heart-surgeries-clinics/heart-surgery-icu/) | לב וכלי דם | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%A0%D7%9E%D7%A8%D7%A5%20%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%20%D7%9C%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [טכנולוגיות בשיקום](https://www.sheba.co.il/rehabilitation/clinics/rehabilitation-technologies/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%98%D7%9B%D7%A0%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%95%D7%AA%20%D7%91%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [טראומה עיניים](https://www.sheba.co.il/surgery/clinics/eye-trauma/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%98%D7%A8%D7%90%D7%95%D7%9E%D7%94%20%D7%A2%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה אורתופדית-אונקולוגית](https://www.sheba.co.il/surgery/units/orthopedic-oncology-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%90%D7%95%D7%A8%D7%AA%D7%95%D7%A4%D7%93%D7%99%D7%AA-%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לאונקוגנטיקה](https://www.sheba.co.il/general/labs/oncogenetics-unit/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%92%D7%A0%D7%98%D7%99%D7%A7%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לגידולי מערכת העיכול](https://www.sheba.co.il/cancer/oncology/gastrointestinal-cancer-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A2%D7%99%D7%9B%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לדימות הבטן ומערכת העיכול](https://www.sheba.co.il/imaging/clinics/abdominal-and-gastrointestinal-imaging-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%93%D7%99%D7%9E%D7%95%D7%AA%20%D7%94%D7%91%D7%98%D7%9F%20%D7%95%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A2%D7%99%D7%9B%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה למחלות מטבוליות בילדים](https://www.sheba.co.il/pediatrics/clinics/metabolic-diseases-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%9E%D7%98%D7%91%D7%95%D7%9C%D7%99%D7%95%D7%AA%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה למחלות מעי דלקתיות IBD](https://www.sheba.co.il/internal-medicine/clinics/ibd-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%9E%D7%A2%D7%99%20%D7%93%D7%9C%D7%A7%D7%AA%D7%99%D7%95%D7%AA%20IBD%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה למחקרים קליניים ברפואת הסרטן](https://www.sheba.co.il/cancer/clinics/clinical-research-cancer-medicine/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9E%D7%97%D7%A7%D7%A8%D7%99%D7%9D%20%D7%A7%D7%9C%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%91%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%94%D7%A1%D7%A8%D7%98%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה למלנומה ונגעים עוריים](https://www.sheba.co.il/surgery/units/melanoma-and-skin-lesions-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%9E%D7%9C%D7%A0%D7%95%D7%9E%D7%94%20%D7%95%D7%A0%D7%92%D7%A2%D7%99%D7%9D%20%D7%A2%D7%95%D7%A8%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לנוירוכירורגיה ילדים](https://www.sheba.co.il/pediatrics/clinics/neurosurgery-unit/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לנוירולוגיה קוגניטיבית והתנהגותית](https://www.sheba.co.il/neuroscience/neuro-surgery/cognitive-behavioral-neurology-unit/) | מוח ועצבים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A7%D7%95%D7%92%D7%A0%D7%99%D7%98%D7%99%D7%91%D7%99%D7%AA%20%D7%95%D7%94%D7%AA%D7%A0%D7%94%D7%92%D7%95%D7%AA%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לנוירורדיולוגיה אבחנתית](https://www.sheba.co.il/imaging/clinics/diagnostic-neuroradiology-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%A8%D7%93%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%90%D7%91%D7%97%D7%A0%D7%AA%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לפיזיותרפיה סקסולוגית של רצפת האגן (אגנה)](https://www.sheba.co.il/preventive-medicine/clinics/pelvic-floor-sexological-physiotherapy/) | רפואה מונעת | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A4%D7%99%D7%96%D7%99%D7%95%D7%AA%D7%A8%D7%A4%D7%99%D7%94%20%D7%A1%D7%A7%D7%A1%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%20%D7%A9%D7%9C%20%D7%A8%D7%A6%D7%A4%D7%AA%20%D7%94%D7%90%D7%92%D7%9F%20(%D7%90%D7%92%D7%A0%D7%94)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לפסיכיאטריה של הילד והמתבגר](https://www.sheba.co.il/pediatrics/clinics/psychiatry-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A4%D7%A1%D7%99%D7%9B%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%94%20%D7%A9%D7%9C%20%D7%94%D7%99%D7%9C%D7%93%20%D7%95%D7%94%D7%9E%D7%AA%D7%91%D7%92%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידה לצנתורי מוח ועמוד שדרה](https://www.sheba.co.il/imaging/clinics/interventional-neuroradiology-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%94%20%D7%9C%D7%A6%D7%A0%D7%AA%D7%95%D7%A8%D7%99%20%D7%9E%D7%95%D7%97%20%D7%95%D7%A2%D7%9E%D7%95%D7%93%20%D7%A9%D7%93%D7%A8%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת אורתופדיה ילדים](https://www.sheba.co.il/pediatrics/clinics/orthopedics-unit/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%90%D7%95%D7%A8%D7%AA%D7%95%D7%A4%D7%93%D7%99%D7%94%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת אסקטמין (ספראבטו)](https://www.sheba.co.il/psychiatry/clinics/spravato-ketamine-unit/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%90%D7%A1%D7%A7%D7%98%D7%9E%D7%99%D7%9F%20(%D7%A1%D7%A4%D7%A8%D7%90%D7%91%D7%98%D7%95)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת בית החזה והריאות](https://www.sheba.co.il/imaging/clinics/chest-and-lungs-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%91%D7%99%D7%AA%20%D7%94%D7%97%D7%96%D7%94%20%D7%95%D7%94%D7%A8%D7%99%D7%90%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת דימות ילדים](https://www.sheba.co.il/pediatrics/services/pediatric-imaging-radiology-unit/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%93%D7%99%D7%9E%D7%95%D7%AA%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת דימות רפואה דחופה וטראומה](https://www.sheba.co.il/imaging/clinics/er-imaging-unit/) | דימות | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%93%D7%99%D7%9E%D7%95%D7%AA%20%D7%A8%D7%A4%D7%95%D7%90%D7%94%20%D7%93%D7%97%D7%95%D7%A4%D7%94%20%D7%95%D7%98%D7%A8%D7%90%D7%95%D7%9E%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת הלייזרים הארצית](https://www.sheba.co.il/surgery/units/national-laser-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%94%D7%9C%D7%99%D7%99%D7%96%D7%A8%D7%99%D7%9D%20%D7%94%D7%90%D7%A8%D7%A6%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת השהיה](https://www.sheba.co.il/general/emergency-units/delay-unit/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%94%D7%A9%D7%94%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת התאוששות](https://www.sheba.co.il/surgery/units/recovery-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%94%D7%AA%D7%90%D7%95%D7%A9%D7%A9%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת טיפול יום אם-תינוק](https://www.sheba.co.il/pregnancy/clinics/mother-baby-intensive-therapy-unit/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%99%D7%95%D7%9D%20%D7%90%D7%9D-%D7%AA%D7%99%D7%A0%D7%95%D7%A7%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת טראומה ושברים](https://www.sheba.co.il/surgery/units/trauma-and-fracture-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%98%D7%A8%D7%90%D7%95%D7%9E%D7%94%20%D7%95%D7%A9%D7%91%D7%A8%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת ניטור וידאו EEG](https://www.sheba.co.il/internal-medicine/clinics/eeg-video-unit/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A0%D7%99%D7%98%D7%95%D7%A8%20%D7%95%D7%99%D7%93%D7%90%D7%95%20EEG%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת קרינה לגידולי מערכת העיכול](https://www.sheba.co.il/cancer/radiotherapy/gastrointestinal-cancer-radiation-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A7%D7%A8%D7%99%D7%A0%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A2%D7%99%D7%9B%D7%95%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת קרינה לגידולי מערכת השתן והמין](https://www.sheba.co.il/cancer/radiotherapy/genitourinary-radiation-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A7%D7%A8%D7%99%D7%A0%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A9%D7%AA%D7%9F%20%D7%95%D7%94%D7%9E%D7%99%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת קרינה לגידולי שד](https://www.sheba.co.il/cancer/radiotherapy/breast-radiation-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A7%D7%A8%D7%99%D7%A0%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%A9%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת קרינה לגידולים גינקולוגיים](https://www.sheba.co.il/cancer/radiotherapy/gynecologic-tumors-radiation-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A7%D7%A8%D7%99%D7%A0%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%D7%9D%20%D7%92%D7%99%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת קרנית](https://www.sheba.co.il/surgery/clinics/cornea-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [יחידת רשתית](https://www.sheba.co.il/surgery/units/retinal-unit/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%97%D7%99%D7%93%D7%AA%20%D7%A8%D7%A9%D7%AA%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [ייעוץ טרום-הריוני ומעקב הריון לנשים עם מחלות מעי דלקתיות](https://www.sheba.co.il/pregnancy/clinics/high-risk-pregnancy-ibd/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%99%D7%A2%D7%95%D7%A5%20%D7%98%D7%A8%D7%95%D7%9D-%D7%94%D7%A8%D7%99%D7%95%D7%A0%D7%99%20%D7%95%D7%9E%D7%A2%D7%A7%D7%91%20%D7%94%D7%A8%D7%99%D7%95%D7%9F%20%D7%9C%D7%A0%D7%A9%D7%99%D7%9D%20%D7%A2%D7%9D%20%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%9E%D7%A2%D7%99%20%D7%93%D7%9C%D7%A7%D7%AA%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [ייעוץ לספורטאים צעירים](https://www.sheba.co.il/pediatrics/clinics/counseling-for-young-athletes/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%99%D7%A2%D7%95%D7%A5%20%D7%9C%D7%A1%D7%A4%D7%95%D7%A8%D7%98%D7%90%D7%99%D7%9D%20%D7%A6%D7%A2%D7%99%D7%A8%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [ייעוץ מיני למטופלי המרכז לרפואת הסרטן](https://www.sheba.co.il/cancer/palliative-care/sexual-counseling-cancer-center/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%99%D7%99%D7%A2%D7%95%D7%A5%20%D7%9E%D7%99%D7%A0%D7%99%20%D7%9C%D7%9E%D7%98%D7%95%D7%A4%D7%9C%D7%99%20%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%94%D7%A1%D7%A8%D7%98%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה לטיפול נמרץ לב ילדים](https://www.sheba.co.il/pediatrics/departments/cardiac-intensive-care/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%A0%D7%9E%D7%A8%D7%A5%20%D7%9C%D7%91%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה לכירורגיה פלסטית וכוויות](https://www.sheba.co.il/surgery/departments/plastic-surgery-department/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%A4%D7%9C%D7%A1%D7%98%D7%99%D7%AA%20%D7%95%D7%9B%D7%95%D7%95%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה לניתוחי חזה](https://www.sheba.co.il/cardiovascular/chest-surgery-clinics/thoracic-surgery-department/) | לב וכלי דם | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%20%D7%97%D7%96%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה נוירווסקולרית ושבץ מוחי](https://www.sheba.co.il/neuroscience/neuro-surgery/neurovascular-and-stroke-department/) | מוח ועצבים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%95%D7%A1%D7%A7%D7%95%D7%9C%D7%A8%D7%99%D7%AA%20%D7%95%D7%A9%D7%91%D7%A5%20%D7%9E%D7%95%D7%97%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית א](https://www.sheba.co.il/internal-medicine/departments/internal-department-a/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%90%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית ב](https://www.sheba.co.il/internal-medicine/departments/internal-department-b/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית ג](https://www.sheba.co.il/internal-medicine/departments/internal-department-c/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%92%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית גריאטרית ג](https://www.sheba.co.il/geriatrics/departments/internal-geriatric-c/) | גריאטריה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%92%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%AA%20%D7%92%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית גריאטרית ד](https://www.sheba.co.il/geriatrics/departments/internal-geriatric-department-d/) | גריאטריה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%92%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%AA%20%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקה פנימית ד](https://www.sheba.co.il/internal-medicine/departments/internal-department-d/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%A4%D7%A0%D7%99%D7%9E%D7%99%D7%AA%20%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת אף-אוזן-גרון וניתוחי ראש וצוואר](https://www.sheba.co.il/surgery/departments/otolaryngology-ent-head-neck-surgery/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%90%D7%A3-%D7%90%D7%95%D7%96%D7%9F-%D7%92%D7%A8%D7%95%D7%9F%20%D7%95%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%20%D7%A8%D7%90%D7%A9%20%D7%95%D7%A6%D7%95%D7%95%D7%90%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת אשפוז אונקולוגית](https://www.sheba.co.il/cancer/oncology/oncology-department/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%90%D7%A9%D7%A4%D7%95%D7%96%20%D7%90%D7%95%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת אשפוז דיאדי אם-תינוק](https://www.sheba.co.il/pregnancy/departments/mother-baby-hospitalization-department/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%90%D7%A9%D7%A4%D7%95%D7%96%20%D7%93%D7%99%D7%90%D7%93%D7%99%20%D7%90%D7%9D-%D7%AA%D7%99%D7%A0%D7%95%D7%A7%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת גריאטריה שיקומית א](https://www.sheba.co.il/geriatrics/departments/rehabilitation-geriatrics-department-a/) | גריאטריה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%92%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%94%20%D7%A9%D7%99%D7%A7%D7%95%D7%9E%D7%99%D7%AA%20%D7%90%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת גריאטריה שיקומית ב](https://www.sheba.co.il/geriatrics/departments/rehabilitation-geriatrics-department-b/) | גריאטריה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%92%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%94%20%D7%A9%D7%99%D7%A7%D7%95%D7%9E%D7%99%D7%AA%20%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת המטולוגיה](https://www.sheba.co.il/cancer/hematology/hematology-department/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%94%D7%9E%D7%98%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת יולדות](https://www.sheba.co.il/pregnancy/departments/maternity-department/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%99%D7%95%D7%9C%D7%93%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת ילדים א](https://www.sheba.co.il/pediatrics/departments/department-a/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%90%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת ילדים ב](https://www.sheba.co.il/pediatrics/departments/department-b/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת ילדים ג – טיפול בהפרעות אכילה בילדים ונוער](https://www.sheba.co.il/pediatrics/departments/department-c/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%92%20%E2%80%93%20%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%94%D7%A4%D7%A8%D7%A2%D7%95%D7%AA%20%D7%90%D7%9B%D7%99%D7%9C%D7%94%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%95%D7%A0%D7%95%D7%A2%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת עור ומין](https://www.sheba.co.il/internal-medicine/departments/dermatology-venerology-department/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A2%D7%95%D7%A8%20%D7%95%D7%9E%D7%99%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת עיניים](https://www.sheba.co.il/surgery/departments/eye-department/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A2%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת פגים וטיפול נמרץ יילודים (פגייה)](https://www.sheba.co.il/pediatrics/departments/premature-preterm-department-neonatal-icu/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A4%D7%92%D7%99%D7%9D%20%D7%95%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%A0%D7%9E%D7%A8%D7%A5%20%D7%99%D7%99%D7%9C%D7%95%D7%93%D7%99%D7%9D%20(%D7%A4%D7%92%D7%99%D7%99%D7%94)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת פסיכיאטריה ב](https://www.sheba.co.il/psychiatry/departments/psychiatry-department-b/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A4%D7%A1%D7%99%D7%9B%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%94%20%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת פסיכיאטריה ג](https://www.sheba.co.il/psychiatry/departments/psychiatry-department-c/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A4%D7%A1%D7%99%D7%9B%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%94%20%D7%92%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת קינוחים](https://www.sheba.co.il/adi-hospital/adi-clinics/department/) | בית חולים עדי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A7%D7%99%D7%A0%D7%95%D7%97%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת קרדיולוגיה](https://www.sheba.co.il/cardiovascular/cardiology-clinics/cardiology-department/) | לב וכלי דם | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A7%D7%A8%D7%93%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת רשומות ומידע רפואי](https://www.sheba.co.il/general/clinics/medical-records-and-information/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A8%D7%A9%D7%95%D7%9E%D7%95%D7%AA%20%D7%95%D7%9E%D7%99%D7%93%D7%A2%20%D7%A8%D7%A4%D7%95%D7%90%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת שיקום אורתופדי](https://www.sheba.co.il/rehabilitation/departments/orthopedic-rehabilitation-department/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%90%D7%95%D7%A8%D7%AA%D7%95%D7%A4%D7%93%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מחלקת שיקום ילדים](https://www.sheba.co.il/pediatrics/departments/rehabilitation-department/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%97%D7%9C%D7%A7%D7%AA%20%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מיון יולדות](https://www.sheba.co.il/pregnancy/clinics/maternity-triage-er/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%99%D7%95%D7%9F%20%D7%99%D7%95%D7%9C%D7%93%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מיון כללי – המחלקה לרפואה דחופה](https://www.sheba.co.il/general/emergency-units/emergency-medicine-department/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%99%D7%95%D7%9F%20%D7%9B%D7%9C%D7%9C%D7%99%20%E2%80%93%20%D7%94%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%94%20%D7%93%D7%97%D7%95%D7%A4%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מיון נשים - המחלקה לרפואה דחופה](https://www.sheba.co.il/gynecology/departments/gynecology-emergency-department/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%99%D7%95%D7%9F%20%D7%A0%D7%A9%D7%99%D7%9D%20-%20%D7%94%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%94%20%D7%93%D7%97%D7%95%D7%A4%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מיון עיניים](https://www.sheba.co.il/surgery/clinics/eye-emergency/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%99%D7%95%D7%9F%20%D7%A2%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מכון גסטרואנטרולוגיה](https://www.sheba.co.il/internal-medicine/clinics/gastroenterology-institute/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%9B%D7%95%D7%9F%20%D7%92%D7%A1%D7%98%D7%A8%D7%95%D7%90%D7%A0%D7%98%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מכון נפרולוגיה ויתר לחץ דם](https://www.sheba.co.il/internal-medicine/clinics/institute-of-nephrology-and-hypertension/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%9B%D7%95%D7%9F%20%D7%A0%D7%A4%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%95%D7%99%D7%AA%D7%A8%20%D7%9C%D7%97%D7%A5%20%D7%93%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מכון עיניים](https://www.sheba.co.il/surgery/clinics/eye-institute/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%9B%D7%95%D7%9F%20%D7%A2%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדה לחקר תרגומי של סרטן השד](https://www.sheba.co.il/research/units/breast-cancer-laboratory/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%97%D7%A7%D7%A8%20%D7%AA%D7%A8%D7%92%D7%95%D7%9E%D7%99%20%D7%A9%D7%9C%20%D7%A1%D7%A8%D7%98%D7%9F%20%D7%94%D7%A9%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדה למחלות אוטואימוניות](https://www.sheba.co.il/general/labs/autoimmune-disease-lab/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%95%D7%98%D7%95%D7%90%D7%99%D7%9E%D7%95%D7%A0%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדה למיקרוביולוגיה קלינית](https://www.sheba.co.il/general/labs/clinical-microbiology-laboratory/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%9E%D7%99%D7%A7%D7%A8%D7%95%D7%91%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%A7%D7%9C%D7%99%D7%A0%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדה למיקרוכירורגיה](https://www.sheba.co.il/surgery/labs/microsurgery-laboratory/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%9E%D7%99%D7%A7%D7%A8%D7%95%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדה לסיווג רקמות והשתלות](https://www.sheba.co.il/general/labs/tissue-typing-lab/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%94%20%D7%9C%D7%A1%D7%99%D7%95%D7%95%D7%92%20%D7%A8%D7%A7%D7%9E%D7%95%D7%AA%20%D7%95%D7%94%D7%A9%D7%AA%D7%9C%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעבדת נוירואימונולוגיה (טרשת נפוצה)](https://www.sheba.co.il/general/labs/neuroimmunology-lab/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%91%D7%93%D7%AA%20%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%90%D7%99%D7%9E%D7%95%D7%A0%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20(%D7%98%D7%A8%D7%A9%D7%AA%20%D7%A0%D7%A4%D7%95%D7%A6%D7%94)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מעון יום טיפולי - אשכול גני תקשורת](https://www.sheba.co.il/pediatrics/clinics/therapeutic-daycare-center/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%95%D7%9F%20%D7%99%D7%95%D7%9D%20%D7%98%D7%99%D7%A4%D7%95%D7%9C%D7%99%20-%20%D7%90%D7%A9%D7%9B%D7%95%D7%9C%20%D7%92%D7%A0%D7%99%20%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מערך האַחֲיוּת](https://www.sheba.co.il/general/clinics/nursing-division/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%A8%D7%9A%20%D7%94%D7%90%D6%B7%D7%97%D6%B2%D7%99%D7%95%D6%BC%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מערך ההנקה](https://www.sheba.co.il/pregnancy/clinics/breastfeeding-array/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A2%D7%A8%D7%9A%20%D7%94%D7%94%D7%A0%D7%A7%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז החדשנות ARC](https://www.sheba.co.il/general/clinics/arc-innovation-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%94%D7%97%D7%93%D7%A9%D7%A0%D7%95%D7%AA%20ARC%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז חדשנות "המאירים"](https://www.sheba.co.il/cardiovascular/cardiology-clinics/heart-innovation-center/) | לב וכלי דם | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%97%D7%93%D7%A9%D7%A0%D7%95%D7%AA%20%22%D7%94%D7%9E%D7%90%D7%99%D7%A8%D7%99%D7%9D%22%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז על רב-תחומי להשתלות איברים](https://www.sheba.co.il/general/transplant-centers/transplants-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%A2%D7%9C%20%D7%A8%D7%91-%D7%AA%D7%97%D7%95%D7%9E%D7%99%20%D7%9C%D7%94%D7%A9%D7%AA%D7%9C%D7%95%D7%AA%20%D7%90%D7%99%D7%91%D7%A8%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז קש"ת – קשיי שפה ותקשורת אצל ילדים](https://www.sheba.co.il/pediatrics/clinics/keshet-children-communicating-center/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%A7%D7%A9%22%D7%AA%20%E2%80%93%20%D7%A7%D7%A9%D7%99%D7%99%20%D7%A9%D7%A4%D7%94%20%D7%95%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA%20%D7%90%D7%A6%D7%9C%20%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז רב-תחומי למחלות אדרנל](https://www.sheba.co.il/surgery/clinics/adrenal-disorders-center/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%A8%D7%91-%D7%AA%D7%97%D7%95%D7%9E%D7%99%20%D7%9C%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%93%D7%A8%D7%A0%D7%9C%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז רב-תחומי של חולי תסמונת X שביר ונשאים](https://www.sheba.co.il/general/labs/fragile-x-syndrome-multidisciplinary-center/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%A8%D7%91-%D7%AA%D7%97%D7%95%D7%9E%D7%99%20%D7%A9%D7%9C%20%D7%97%D7%95%D7%9C%D7%99%20%D7%AA%D7%A1%D7%9E%D7%95%D7%A0%D7%AA%20X%20%D7%A9%D7%91%D7%99%D7%A8%20%D7%95%D7%A0%D7%A9%D7%90%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרכז שבים לחיים](https://www.sheba.co.il/beyond/clinics/support-center-for-captivity-survivors/) | שיבא Beyond | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%9B%D7%96%20%D7%A9%D7%91%D7%99%D7%9D%20%D7%9C%D7%97%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה בריאטרית - ניתוחים לטיפול בהשמנת יתר לנוער](https://www.sheba.co.il/pediatrics/clinics/teenagers-bariatric-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%91%D7%A8%D7%99%D7%90%D7%98%D7%A8%D7%99%D7%AA%20-%20%D7%A0%D7%99%D7%AA%D7%95%D7%97%D7%99%D7%9D%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%94%D7%A9%D7%9E%D7%A0%D7%AA%20%D7%99%D7%AA%D7%A8%20%D7%9C%D7%A0%D7%95%D7%A2%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה גינקולוגית למתבגרות](https://www.sheba.co.il/gynecology/clinics/gynecological-adolescent-clinic/) | גינקולוגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%92%D7%99%D7%A0%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%20%D7%9C%D7%9E%D7%AA%D7%91%D7%92%D7%A8%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה וסקולרית](https://www.sheba.co.il/internal-medicine/clinics/vascular-clinic-nephrology/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%95%D7%A1%D7%A7%D7%95%D7%9C%D7%A8%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לגידולי מערכת השתן והמין](https://www.sheba.co.il/cancer/oncology/genitourinary-cancer-unit/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%20%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA%20%D7%94%D7%A9%D7%AA%D7%9F%20%D7%95%D7%94%D7%9E%D7%99%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לגידולים נוירואנדוקריניים](https://www.sheba.co.il/internal-medicine/clinics/neuroendocrine-tumors-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%92%D7%99%D7%93%D7%95%D7%9C%D7%99%D7%9D%20%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%90%D7%A0%D7%93%D7%95%D7%A7%D7%A8%D7%99%D7%A0%D7%99%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לכירורגיה זעיר-פולשנית: מפרקי הלסת ובלוטות הרוק](https://www.sheba.co.il/surgery/clinics/minimally-invasive-surgery-jaw-joints-and-salivary-glands/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%94%20%D7%96%D7%A2%D7%99%D7%A8-%D7%A4%D7%95%D7%9C%D7%A9%D7%A0%D7%99%D7%AA%3A%20%D7%9E%D7%A4%D7%A8%D7%A7%D7%99%20%D7%94%D7%9C%D7%A1%D7%AA%20%D7%95%D7%91%D7%9C%D7%95%D7%98%D7%95%D7%AA%20%D7%94%D7%A8%D7%95%D7%A7%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לקרישת דם במבוגרים](https://www.sheba.co.il/cancer/hematology/adult-coagulation-clinic/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%A7%D7%A8%D7%99%D7%A9%D7%AA%20%D7%93%D7%9D%20%D7%91%D7%9E%D7%91%D7%95%D7%92%D7%A8%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לשימור ושיפור תפקודי ולבעיות על רקע שריר-שלד (מוסקולוסקלטלית)](https://www.sheba.co.il/rehabilitation/clinics/musculoskeletal-clinic/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%A9%D7%99%D7%9E%D7%95%D7%A8%20%D7%95%D7%A9%D7%99%D7%A4%D7%95%D7%A8%20%D7%AA%D7%A4%D7%A7%D7%95%D7%93%D7%99%20%D7%95%D7%9C%D7%91%D7%A2%D7%99%D7%95%D7%AA%20%D7%A2%D7%9C%20%D7%A8%D7%A7%D7%A2%20%D7%A9%D7%A8%D7%99%D7%A8-%D7%A9%D7%9C%D7%93%20(%D7%9E%D7%95%D7%A1%D7%A7%D7%95%D7%9C%D7%95%D7%A1%D7%A7%D7%9C%D7%98%D7%9C%D7%99%D7%AA)%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה לשיקום פנים](https://www.sheba.co.il/surgery/clinics/facial-reconstruction-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%9C%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%A4%D7%A0%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה נפרולוגית כללית ויתר לחץ דם מורכב](https://www.sheba.co.il/internal-medicine/clinics/nephrology-complex-hypertension/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%A0%D7%A4%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA%20%D7%9B%D7%9C%D7%9C%D7%99%D7%AA%20%D7%95%D7%99%D7%AA%D7%A8%20%D7%9C%D7%97%D7%A5%20%D7%93%D7%9D%20%D7%9E%D7%95%D7%A8%D7%9B%D7%91%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה פרה-דיאליטית](https://www.sheba.co.il/internal-medicine/clinics/pre-dialysis-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%A4%D7%A8%D7%94-%D7%93%D7%99%D7%90%D7%9C%D7%99%D7%98%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאה קרדיו-רנלית](https://www.sheba.co.il/internal-medicine/clinics/cardio-renal-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%A7%D7%A8%D7%93%D7%99%D7%95-%D7%A8%D7%A0%D7%9C%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאות אף-אוזן-גרון](https://www.sheba.co.il/surgery/clinics/ent-clinics/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%95%D7%AA%20%D7%90%D7%A3-%D7%90%D7%95%D7%96%D7%9F-%D7%92%D7%A8%D7%95%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת אבני כליה](https://www.sheba.co.il/internal-medicine/clinics/kidney-stone-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%90%D7%91%D7%A0%D7%99%20%D7%9B%D7%9C%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת בלוטת התריס ובלוטת יותרת התריס](https://www.sheba.co.il/surgery/clinics/thyroid-parathyroid-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%91%D7%9C%D7%95%D7%98%D7%AA%20%D7%94%D7%AA%D7%A8%D7%99%D7%A1%20%D7%95%D7%91%D7%9C%D7%95%D7%98%D7%AA%20%D7%99%D7%95%D7%AA%D7%A8%D7%AA%20%D7%94%D7%AA%D7%A8%D7%99%D7%A1%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת הפרעות בבלוטות הרוק](https://www.sheba.co.il/surgery/clinics/salivary-gland-disorders-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%94%D7%A4%D7%A8%D7%A2%D7%95%D7%AA%20%D7%91%D7%91%D7%9C%D7%95%D7%98%D7%95%D7%AA%20%D7%94%D7%A8%D7%95%D7%A7%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת מומי פנים](https://www.sheba.co.il/surgery/clinics/cranio-facial-anomalies-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%9E%D7%95%D7%9E%D7%99%20%D7%A4%D7%A0%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת מחלות אוטואימוניות של העור](https://www.sheba.co.il/internal-medicine/clinics/autoimmune-diseases-of-the-skin-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%95%D7%98%D7%95%D7%90%D7%99%D7%9E%D7%95%D7%A0%D7%99%D7%95%D7%AA%20%D7%A9%D7%9C%20%D7%94%D7%A2%D7%95%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת מחלות עצם מטבוליות בילדים](https://www.sheba.co.il/pediatrics/clinics/metabolic-bone-clinic/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%A2%D7%A6%D7%9D%20%D7%9E%D7%98%D7%91%D7%95%D7%9C%D7%99%D7%95%D7%AA%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת מעקב אחר מושתלי כליה](https://www.sheba.co.il/internal-medicine/clinics/follow-up-clinic-for-kidney-transplant-recipients/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%9E%D7%A2%D7%A7%D7%91%20%D7%90%D7%97%D7%A8%20%D7%9E%D7%95%D7%A9%D7%AA%D7%9C%D7%99%20%D7%9B%D7%9C%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת סטיבן א. כהן במודיעין](https://www.sheba.co.il/psychiatry/clinics/the-steven-a-cohen-clinic/) | רפואת הנפש | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%A1%D7%98%D7%99%D7%91%D7%9F%20%D7%90.%20%D7%9B%D7%94%D7%9F%20%D7%91%D7%9E%D7%95%D7%93%D7%99%D7%A2%D7%99%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת קטרקט](https://www.sheba.co.il/surgery/clinics/cataract-clinic/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%A7%D7%98%D7%A8%D7%A7%D7%98%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת שיקום כירורגיית כף יד](https://www.sheba.co.il/rehabilitation/clinics/hand-surgery-rehabilitation/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%9B%D7%99%D7%A8%D7%95%D7%A8%D7%92%D7%99%D7%99%D7%AA%20%D7%9B%D7%A3%20%D7%99%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [מרפאת FMF ומחלות אוטואינפלמטוריות](https://www.sheba.co.il/internal-medicine/clinics/fmf-clinic/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A8%D7%A4%D7%90%D7%AA%20FMF%20%D7%95%D7%9E%D7%97%D7%9C%D7%95%D7%AA%20%D7%90%D7%95%D7%98%D7%95%D7%90%D7%99%D7%A0%D7%A4%D7%9C%D7%9E%D7%98%D7%95%D7%A8%D7%99%D7%95%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [משכן מריון ואלי ויזל לטיפול תומך בילדים](https://www.sheba.co.il/pediatrics/clinics/marion-eli-wiesel-supportive-care-center/) | ילדים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%9E%D7%A9%D7%9B%D7%9F%20%D7%9E%D7%A8%D7%99%D7%95%D7%9F%20%D7%95%D7%90%D7%9C%D7%99%20%D7%95%D7%99%D7%96%D7%9C%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%AA%D7%95%D7%9E%D7%9A%20%D7%91%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [פתרונות רפואיים מותאמים אישית בטכנולוגיות תלת-ממד](https://www.sheba.co.il/surgery/clinics/plannet-3d-personalized-medical-solutions/) | כירורגיה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA%20%D7%A8%D7%A4%D7%95%D7%90%D7%99%D7%99%D7%9D%20%D7%9E%D7%95%D7%AA%D7%90%D7%9E%D7%99%D7%9D%20%D7%90%D7%99%D7%A9%D7%99%D7%AA%20%D7%91%D7%98%D7%9B%D7%A0%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%95%D7%AA%20%D7%AA%D7%9C%D7%AA-%D7%9E%D7%9E%D7%93%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [קליטת כוכבים – תוכנית לקידום מצוינות ברפואה ובמחקר](https://www.sheba.co.il/research/units/stars/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A7%D7%9C%D7%99%D7%98%D7%AA%20%D7%9B%D7%95%D7%9B%D7%91%D7%99%D7%9D%20%E2%80%93%20%D7%AA%D7%95%D7%9B%D7%A0%D7%99%D7%AA%20%D7%9C%D7%A7%D7%99%D7%93%D7%95%D7%9D%20%D7%9E%D7%A6%D7%95%D7%99%D7%A0%D7%95%D7%AA%20%D7%91%D7%A8%D7%A4%D7%95%D7%90%D7%94%20%D7%95%D7%91%D7%9E%D7%97%D7%A7%D7%A8%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [רק בשיבא יולדות: כל חדרי הלידה חכמים](https://www.sheba.co.il/pregnancy/departments/delivery-rooms/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%A7%20%D7%91%D7%A9%D7%99%D7%91%D7%90%20%D7%99%D7%95%D7%9C%D7%93%D7%95%D7%AA%3A%20%D7%9B%D7%9C%20%D7%97%D7%93%D7%A8%D7%99%20%D7%94%D7%9C%D7%99%D7%93%D7%94%20%D7%97%D7%9B%D7%9E%D7%99%D7%9D%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שיקום לב אונליין מהבית](https://www.sheba.co.il/beyond/clinics/remote-cardiac-rehabilitation-program/) | שיבא Beyond | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%9C%D7%91%20%D7%90%D7%95%D7%A0%D7%9C%D7%99%D7%99%D7%9F%20%D7%9E%D7%94%D7%91%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שירות אונקו-נפרולוגי](https://www.sheba.co.il/internal-medicine/clinics/onco-nephrology-service/) | רפואה פנימית | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%90%D7%95%D7%A0%D7%A7%D7%95-%D7%A0%D7%A4%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שירות פיזיותרפיה](https://www.sheba.co.il/general/allied-health-professions/physiotherapy-service/) | כללי | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%A4%D7%99%D7%96%D7%99%D7%95%D7%AA%D7%A8%D7%A4%D7%99%D7%94%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שירות פיזיותרפיה במרכז לרפואת הסרטן](https://www.sheba.co.il/cancer/palliative-care/physiotherapy-service-cancer-center/) | רפואת הסרטן | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%A4%D7%99%D7%96%D7%99%D7%95%D7%AA%D7%A8%D7%A4%D7%99%D7%94%20%D7%91%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%A8%D7%A4%D7%95%D7%90%D7%AA%20%D7%94%D7%A1%D7%A8%D7%98%D7%9F%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שירות פסיכולוגי במחלקה לשיקום נוירולוגי](https://www.sheba.co.il/rehabilitation/clinics/psychological-neurological-rehabilitation/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%9C%D7%95%D7%92%D7%99%20%D7%91%D7%9E%D7%97%D7%9C%D7%A7%D7%94%20%D7%9C%D7%A9%D7%99%D7%A7%D7%95%D7%9D%20%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [שירותי פריון לקהילה הטרנסית](https://www.sheba.co.il/pregnancy/clinics/trans-community-fertility-services/) | הריון ולידה | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%20%D7%A4%D7%A8%D7%99%D7%95%D7%9F%20%D7%9C%D7%A7%D7%94%D7%99%D7%9C%D7%94%20%D7%94%D7%98%D7%A8%D7%A0%D7%A1%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [תוכנית רב-תחומית לטיפול בניוון שרירים אוקולו פאריניאלי](https://www.sheba.co.il/neuroscience/neurology/opmd-clinic/) | מוח ועצבים | [מפות ↗](https://www.google.com/maps/search/?api=1&query=%D7%AA%D7%95%D7%9B%D7%A0%D7%99%D7%AA%20%D7%A8%D7%91-%D7%AA%D7%97%D7%95%D7%9E%D7%99%D7%AA%20%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C%20%D7%91%D7%A0%D7%99%D7%95%D7%95%D7%9F%20%D7%A9%D7%A8%D7%99%D7%A8%D7%99%D7%9D%20%D7%90%D7%95%D7%A7%D7%95%D7%9C%D7%95%20%D7%A4%D7%90%D7%A8%D7%99%D7%A0%D7%99%D7%90%D7%9C%D7%99%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [EMG והמרפאה הנוירומוסקולרית](https://www.sheba.co.il/rehabilitation/clinics/emg-neuromuscular-clinic/) | שיקום | [מפות ↗](https://www.google.com/maps/search/?api=1&query=EMG%20%D7%95%D7%94%D7%9E%D7%A8%D7%A4%D7%90%D7%94%20%D7%94%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%9E%D7%95%D7%A1%D7%A7%D7%95%D7%9C%D7%A8%D7%99%D7%AA%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |
| [SMNRC](https://www.sheba.co.il/research/units/smnrc/) | מחקר | [מפות ↗](https://www.google.com/maps/search/?api=1&query=SMNRC%20%D7%A9%D7%99%D7%91%D7%90%20%D7%AA%D7%9C%20%D7%94%D7%A9%D7%95%D7%9E%D7%A8) |

</details>

## בדיקות (225)

דפי הבדיקות באתר אינם מציינים מיקום – בדיקה מתבצעת ביחידה שמציעה אותה. רק לשני תחומים המיקום נגזר בבטחה:

| תחום | דפי בדיקות | יחידה / מיקום |
|---|---|---|
| דימות | 104 | אגף דימות – מגדל האשפוז, קומה 0 |
| רפואה פנימית | 41 | לא צוין – יש לברר מול המחלקה |
| כירורגיה | 25 | לא צוין – יש לברר מול המחלקה |
| ילדים | 19 | לא צוין – יש לברר מול המחלקה |
| הריון ולידה | 19 | לא צוין – יש לברר מול המחלקה |
| לב וכלי דם | 8 | מרכז הלב, חזה וכלי דם – מרכז הלב, חזה וכלי דם |
| מוח ועצבים | 4 | לא צוין – יש לברר מול המחלקה |
| רפואת הסרטן | 3 | לא צוין – יש לברר מול המחלקה |
| גינקולוגיה | 2 | לא צוין – יש לברר מול המחלקה |

**ללא קישור למרפאה (101)** – בדיקת PHI לגילוי מוקדם של סרטן הערמונית; מיפוי לב; בדיקה להערכת תפקוד האנדותל במכשיר אנדופאט; היסטרוסקופיה; CT של מערכת המין והרבייה; 5 עובדות על CT; בדיקת MRI של הלב; טומוגרפיה ממוחשבת CT; בדיקות דימות בהרדמה; בדיקת MRI של כלי הדם (אנגיוגרפיה); צנתור וירטואלי - CT לב; מיפוי עצמות; בדיקת CT עם חומר ניגוד; mammography-breast-checks; CT בטן ומערכת העיכול …

<details><summary>כל כתובות דפי הבדיקות</summary>

**דימות**

- [ct-scan-reproductive-system](https://www.sheba.co.il/imaging/tests/ct-scan-reproductive-system)
- [5-facts-about-ct-scan](https://www.sheba.co.il/imaging/tests/5-facts-about-ct-scan)
- [ultrasound-breast](https://www.sheba.co.il/imaging/tests/ultrasound-breast)
- [cardiac-mri](https://www.sheba.co.il/imaging/tests/cardiac-mri)
- [computed-tomography-ct-scan](https://www.sheba.co.il/imaging/tests/computed-tomography-ct-scan)
- [imaging-tests-under-anesthesia](https://www.sheba.co.il/imaging/tests/imaging-tests-under-anesthesia)
- [mr-angiography-mra](https://www.sheba.co.il/imaging/tests/mr-angiography-mra)
- [ct-heart-scan](https://www.sheba.co.il/imaging/tests/ct-heart-scan)
- [bone-mapping](https://www.sheba.co.il/imaging/tests/bone-mapping)
- [computed-tomography-ct-scan-contrast-material](https://www.sheba.co.il/imaging/tests/computed-tomography-ct-scan-contrast-material)
- [prostate-mri](https://www.sheba.co.il/imaging/tests/prostate-mri)
- [heart-mri-children](https://www.sheba.co.il/imaging/tests/heart-mri-children)
- [mammography-breast-checks](https://www.sheba.co.il/imaging/tests/mammography-breast-checks)
- [brain-catheterization-cerebral-angiography](https://www.sheba.co.il/imaging/tests/brain-catheterization-cerebral-angiography)
- [abdominal-digestive-system-ct-scan](https://www.sheba.co.il/imaging/tests-ct/abdominal-digestive-system-ct-scan)
- [angiography-blood-vessels-ct-scan](https://www.sheba.co.il/imaging/tests-ct/angiography-blood-vessels-ct-scan)
- [arthrography-ct-scan](https://www.sheba.co.il/imaging/tests-ct/arthrography-ct-scan)
- [biopsy-ct-guided](https://www.sheba.co.il/imaging/tests-ct/biopsy-ct-guided)
- [kidney-stones-ct-scan](https://www.sheba.co.il/imaging/tests-ct/kidney-stones-ct-scan)
- [kidneys-urinary-system-ct-scan](https://www.sheba.co.il/imaging/tests-ct/kidneys-urinary-system-ct-scan)
- [myelography-ct-scan](https://www.sheba.co.il/imaging/tests-ct/myelography-ct-scan)
- [preparation-for-ct-scan-brain-chest-neck](https://www.sheba.co.il/imaging/tests-ct/preparation-for-ct-scan-brain-chest-neck)
- [skeletal-ct-scan](https://www.sheba.co.il/imaging/tests-ct/skeletal-ct-scan)
- [urography-ct-scan-ctu](https://www.sheba.co.il/imaging/tests-ct/urography-ct-scan-ctu)
- [ct-ai-lung-cancer-early-detection-scan](https://www.sheba.co.il/imaging/tests-ct/ct-ai-lung-cancer-early-detection-scan)
- [drainage-ct-guided](https://www.sheba.co.il/imaging/tests-ct/drainage-ct-guided)
- [pediatric-ct-scan](https://www.sheba.co.il/imaging/tests-ct/pediatric-ct-scan)
- [brain-ct-scan](https://www.sheba.co.il/imaging/tests-ct/brain-ct-scan)
- [abdomen-pelvis-ct-scan](https://www.sheba.co.il/imaging/tests-ct/abdomen-pelvis-ct-scan)
- [head-and-neck-angiography](https://www.sheba.co.il/imaging/tests-ct/head-and-neck-angiography)
- [abdominal-organs-mri-scans](https://www.sheba.co.il/imaging/tests-mri/abdominal-organs-mri-scans)
- [arthrography-joints-mri](https://www.sheba.co.il/imaging/tests-mri/arthrography-joints-mri)
- [brain-mri-scan](https://www.sheba.co.il/imaging/tests-mri/brain-mri-scan)
- [breast-mri-scan](https://www.sheba.co.il/imaging/tests-mri/breast-mri-scan)
- [chest-lungs-mri-scan](https://www.sheba.co.il/imaging/tests-mri/chest-lungs-mri-scan)
- [defecography-mri](https://www.sheba.co.il/imaging/tests-mri/defecography-mri)
- [dynamic-abdominal-wall-mri-valsalva](https://www.sheba.co.il/imaging/tests-mri/dynamic-abdominal-wall-mri-valsalva)
- [dynamic-pelvic-mri-valsalva-inguinal-hernia](https://www.sheba.co.il/imaging/tests-mri/dynamic-pelvic-mri-valsalva-inguinal-hernia)
- [fetal-brain-mri](https://www.sheba.co.il/imaging/tests-mri/fetal-brain-mri)
- [joint-cartilage-evaluation-mri-scan](https://www.sheba.co.il/imaging/tests-mri/joint-cartilage-evaluation-mri-scan)
- [kidneys-urography-mru-mri-scan](https://www.sheba.co.il/imaging/tests-mri/kidneys-urography-mru-mri-scan)
- [mri-scans-under-anesthesia-videos](https://www.sheba.co.il/imaging/tests-mri/mri-scans-under-anesthesia-videos)
- [mri-general](https://www.sheba.co.il/imaging/tests-mri/mri-general)
- [pediatric-mri-scan](https://www.sheba.co.il/imaging/tests-mri/pediatric-mri-scan)
- [pediatric-mri-scan-under-anesthesia](https://www.sheba.co.il/imaging/tests-mri/pediatric-mri-scan-under-anesthesia)
- [pelvic-mri-scan](https://www.sheba.co.il/imaging/tests-mri/pelvic-mri-scan)
- [placental-mri](https://www.sheba.co.il/imaging/tests-mri/placental-mri)
- [prenatal-fetal-mri-scan](https://www.sheba.co.il/imaging/tests-mri/prenatal-fetal-mri-scan)
- [prostate-biopsy-with-mri-guidnace](https://www.sheba.co.il/imaging/tests-mri/prostate-biopsy-with-mri-guidnace)
- [skeletal-mri](https://www.sheba.co.il/imaging/tests-mri/skeletal-mri)
- [preoperative-brain-mapping](https://www.sheba.co.il/imaging/tests-mri/preoperative-brain-mapping)
- [active-bleeding-digestive-system-mapping](https://www.sheba.co.il/imaging/tests-nuclear/active-bleeding-digestive-system-mapping)
- [bile-duct-mapping](https://www.sheba.co.il/imaging/tests-nuclear/bile-duct-mapping)
- [bone-mapping-pet-ct-technetium-99m-mdp](https://www.sheba.co.il/imaging/tests-nuclear/bone-mapping-pet-ct-technetium-99m-mdp)
- [bone-marrow-mapping-technetium-99-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/bone-marrow-mapping-technetium-99-pet-ct)
- [brain-mapping-flutemetamol-f-18-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/brain-mapping-flutemetamol-f-18-pet-ct)
- [brain-mapping-pet-ct-f18-dopa](https://www.sheba.co.il/imaging/tests-nuclear/brain-mapping-pet-ct-f18-dopa)
- [dynamic-kidney-mapping-dtpamag-3](https://www.sheba.co.il/imaging/tests-nuclear/dynamic-kidney-mapping-dtpamag-3)
- [esophageal-movement-mapping](https://www.sheba.co.il/imaging/tests-nuclear/esophageal-movement-mapping)
- [gastric-emptying-mapping](https://www.sheba.co.il/imaging/tests-nuclear/gastric-emptying-mapping)
- [heart-mapping-muga](https://www.sheba.co.il/imaging/tests-nuclear/heart-mapping-muga)
- [liver-mapping-marked-red-blood-cells-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/liver-mapping-marked-red-blood-cells-pet-ct)
- [lungs-mapping-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/lungs-mapping-pet-ct)
- [lymphatic-tract-mapping](https://www.sheba.co.il/imaging/tests-nuclear/lymphatic-tract-mapping)
- [mapping-thyroid-gland-parathyroid-tc99m](https://www.sheba.co.il/imaging/tests-nuclear/mapping-thyroid-gland-parathyroid-tc99m)
- [pediatric-mapping-pet-ct-in-children](https://www.sheba.co.il/imaging/tests-nuclear/pediatric-mapping-pet-ct-in-children)
- [pet-ct-examination-in-children](https://www.sheba.co.il/imaging/tests-nuclear/pet-ct-examination-in-children)
- [pet-ct-examination-ga-dotatae68](https://www.sheba.co.il/imaging/tests-nuclear/pet-ct-examination-ga-dotatae68)
- [pet-ct-fdg-injection](https://www.sheba.co.il/imaging/tests-nuclear/pet-ct-fdg-injection)
- [pet-ct-tests](https://www.sheba.co.il/imaging/tests-nuclear/pet-ct-tests)
- [pet-ct-mapping-body-ga68-fapi](https://www.sheba.co.il/imaging/tests-nuclear/pet-ct-mapping-body-ga68-fapi)
- [renal-mapping-dmsa-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/renal-mapping-dmsa-pet-ct)
- [renal-mapping-dtpa-pet-ct-kidney](https://www.sheba.co.il/imaging/tests-nuclear/renal-mapping-dtpa-pet-ct-kidney)
- [salivary-gland-mapping-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/salivary-gland-mapping-pet-ct)
- [tear-duct-mapping](https://www.sheba.co.il/imaging/tests-nuclear/tear-duct-mapping)
- [thyroid-mapping](https://www.sheba.co.il/imaging/tests-nuclear/thyroid-mapping)
- [white-blood-cells-mapping-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/white-blood-cells-mapping-pet-ct)
- [whole-body-mapping-pet-ct](https://www.sheba.co.il/imaging/tests-nuclear/whole-body-mapping-pet-ct)
- [fluoroscopy](https://www.sheba.co.il/imaging/tests-rentgen/fluoroscopy)
- [x-ray-imaging-appointment-scheduling](https://www.sheba.co.il/imaging/tests-rentgen/x-ray-imaging-appointment-scheduling)
- [chest-x-ray](https://www.sheba.co.il/imaging/tests-rentgen/chest-x-ray)
- [skeletal-x-ray](https://www.sheba.co.il/imaging/tests-rentgen/skeletal-x-ray)
- [what-is-x-ray-imaging](https://www.sheba.co.il/imaging/tests-rentgen/what-is-x-ray-imaging)
- [esophagus-stomach-fluoroscopy-imaging](https://www.sheba.co.il/imaging/tests-rentgen/esophagus-stomach-fluoroscopy-imaging)
- [cystography-imaging-test](https://www.sheba.co.il/imaging/tests-rentgen/cystography-imaging-test)
- [small-bowel-fluoroscopy-test](https://www.sheba.co.il/imaging/tests-rentgen/small-bowel-fluoroscopy-test)
- [barium-enema-fluoroscopy-test](https://www.sheba.co.il/imaging/tests-rentgen/barium-enema-fluoroscopy-test)
- [pediatric-x-ray-scan-for-children](https://www.sheba.co.il/imaging/tests-rentgen/pediatric-x-ray-scan-for-children)
- [pediatric-fluroscopy](https://www.sheba.co.il/imaging/tests-rentgen/pediatric-fluroscopy)
- [gastrografin-enema-before-stoma-closure](https://www.sheba.co.il/imaging/tests-rentgen/gastrografin-enema-before-stoma-closure)
- [cystography-children-with-ultrasound](https://www.sheba.co.il/imaging/tests-us/cystography-children-with-ultrasound)
- [kidneys-urinary-tract-ultrasound](https://www.sheba.co.il/imaging/tests-us/kidneys-urinary-tract-ultrasound)
- [abdominal-ultrasound](https://www.sheba.co.il/imaging/tests-us/abdominal-ultrasound)
- [orthopedic-ultrasound-scan](https://www.sheba.co.il/imaging/tests-us/orthopedic-ultrasound-scan)
- [neck-ultrasound](https://www.sheba.co.il/imaging/tests-us/neck-ultrasound)
- [ultrasound-guided-biopsy](https://www.sheba.co.il/imaging/tests-us/ultrasound-guided-biopsy)
- [ultrasound-examination](https://www.sheba.co.il/imaging/tests-us/ultrasound-examination)
- [focused-ultrasound-mri-guidance](https://www.sheba.co.il/imaging/tests-us/focused-ultrasound-mri-guidance)
- [testicular-ultrasound](https://www.sheba.co.il/imaging/tests-us/testicular-ultrasound)
- [pediatric-ultrasound](https://www.sheba.co.il/imaging/tests-us/pediatric-ultrasound)
- [msk-us-skeletal-muscle-ultrasound](https://www.sheba.co.il/imaging/tests-us/msk-us-skeletal-muscle-ultrasound)
- [vascular-ultrasound-duplex-veins-legs](https://www.sheba.co.il/imaging/tests-us/vascular-ultrasound-duplex-veins-legs)
- [soft-tissue-ultrasound](https://www.sheba.co.il/imaging/tests-us/soft-tissue-ultrasound)
- [drainage-us-guided](https://www.sheba.co.il/imaging/tests-us/drainage-us-guided)

**רפואה פנימית**

- [catheterization-hypertensive-patients](https://www.sheba.co.il/internal-medicine/tests/catheterization-hypertensive-patients)
- [colonoscopy-general-instructions](https://www.sheba.co.il/internal-medicine/tests/colonoscopy-general-instructions)
- [colonoscopy-without-anesthesia](https://www.sheba.co.il/internal-medicine/tests/colonoscopy-without-anesthesia)
- [liver-diseases-tests](https://www.sheba.co.il/internal-medicine/tests/liver-diseases-tests)
- [preparation-colonoscopy-all-the-movies](https://www.sheba.co.il/internal-medicine/tests/preparation-colonoscopy-all-the-movies)
- [preparation-colonoscopy-anesthesia](https://www.sheba.co.il/internal-medicine/tests/preparation-colonoscopy-anesthesia)
- [intestinal-ultrasound](https://www.sheba.co.il/internal-medicine/tests/intestinal-ultrasound)
- [endoscopic-tests](https://www.sheba.co.il/internal-medicine/tests/endoscopic-tests)
- [fibroscan-630](https://www.sheba.co.il/internal-medicine/tests/fibroscan-630)
- [bronchoscopy-lungs-test](https://www.sheba.co.il/internal-medicine/tests/bronchoscopy-lungs-test)
- [allergies-patch-test](https://www.sheba.co.il/internal-medicine/tests/allergies-patch-test)
- [tryptase-test](https://www.sheba.co.il/internal-medicine/tests/tryptase-test)
- [kidney-biopsy](https://www.sheba.co.il/internal-medicine/tests/kidney-biopsy)
- [24-hour-esophagus-acidity-monitoring-test](https://www.sheba.co.il/internal-medicine/test/24-hour-esophagus-acidity-monitoring-test)
- [allergy-tests](https://www.sheba.co.il/internal-medicine/test/allergy-tests)
- [anal-rectal-manometry-gastro-tests](https://www.sheba.co.il/internal-medicine/test/anal-rectal-manometry-gastro-tests)
- [capsule-endoscopy-small-intestine-test](https://www.sheba.co.il/internal-medicine/test/capsule-endoscopy-small-intestine-test)
- [colon-transit-time-test](https://www.sheba.co.il/internal-medicine/test/colon-transit-time-test)
- [colonoscopy](https://www.sheba.co.il/internal-medicine/test/colonoscopy)
- [colonoscopy-prep-with-moviprep-guide](https://www.sheba.co.il/internal-medicine/test/colonoscopy-prep-with-moviprep-guide)
- [defecography-gastroenterology-imaging](https://www.sheba.co.il/internal-medicine/test/defecography-gastroenterology-imaging)
- [eeg-test](https://www.sheba.co.il/internal-medicine/test/eeg-test)
- [endoscopic-ultrasound](https://www.sheba.co.il/internal-medicine/test/endoscopic-ultrasound)
- [ercp](https://www.sheba.co.il/internal-medicine/test/ercp)
- [esophagus-manometry-pressure-test-gastro-exams](https://www.sheba.co.il/internal-medicine/test/esophagus-manometry-pressure-test-gastro-exams)
- [gastroscopy](https://www.sheba.co.il/internal-medicine/test/gastroscopy)
- [helicobacter-pylori-breath-test](https://www.sheba.co.il/internal-medicine/test/helicobacter-pylori-breath-test)
- [holter-blood-pressure-test](https://www.sheba.co.il/internal-medicine/test/holter-blood-pressure-test)
- [lactose-intolerance-breath-test-gastroenterology](https://www.sheba.co.il/internal-medicine/test/lactose-intolerance-breath-test-gastroenterology)
- [liver-ascites-puncture](https://www.sheba.co.il/internal-medicine/test/liver-ascites-puncture)
- [liver-biopsy](https://www.sheba.co.il/internal-medicine/test/liver-biopsy)
- [dbe](https://www.sheba.co.il/internal-medicine/test/dbe)
- [motorized-spiral-enteroscopy](https://www.sheba.co.il/internal-medicine/test/motorized-spiral-enteroscopy)
- [preparing-colonoscopy-anesthesia-meroken](https://www.sheba.co.il/internal-medicine/test/preparing-colonoscopy-anesthesia-meroken)
- [preparing-for-colonoscopy-with-meroken](https://www.sheba.co.il/internal-medicine/test/preparing-for-colonoscopy-with-meroken)
- [preparing-for-colonoscopy-with-picosalax](https://www.sheba.co.il/internal-medicine/test/preparing-for-colonoscopy-with-picosalax)
- [transrectal-ultrasound](https://www.sheba.co.il/internal-medicine/test/transrectal-ultrasound)
- [virtual-colonoscopy](https://www.sheba.co.il/internal-medicine/test/virtual-colonoscopy)
- [endoflip](https://www.sheba.co.il/internal-medicine/test/endoflip)
- [sigmoidoscopy-endoscopic-test](https://www.sheba.co.il/internal-medicine/test/sigmoidoscopy-endoscopic-test)
- [bravo-wireless-esophageal-ph-monitoring-test](https://www.sheba.co.il/internal-medicine/test/bravo-wireless-esophageal-ph-monitoring-test)

**כירורגיה**

- [engvng-functional-assessment-balance](https://www.sheba.co.il/surgery/test/engvng-functional-assessment-balance)
- [corneal-topography-mapping](https://www.sheba.co.il/surgery/test/corneal-topography-mapping)
- [corneal-pachymetry-measuring-thickness](https://www.sheba.co.il/surgery/test/corneal-pachymetry-measuring-thickness)
- [apd-central-auditory-processing-disorders](https://www.sheba.co.il/surgery/test/apd-central-auditory-processing-disorders)
- [oct-eye-coherence-tomography-test](https://www.sheba.co.il/surgery/test/oct-eye-coherence-tomography-test)
- [tympanometry-test-acoustic-admittance](https://www.sheba.co.il/surgery/test/tympanometry-test-acoustic-admittance)
- [visual-field-test](https://www.sheba.co.il/surgery/test/visual-field-test)
- [ophthalmologic-eyes-ultrasound](https://www.sheba.co.il/surgery/test/ophthalmologic-eyes-ultrasound)
- [counting-endothelial-cells-cornea](https://www.sheba.co.il/surgery/test/counting-endothelial-cells-cornea)
- [biometry-eye-test](https://www.sheba.co.il/surgery/test/biometry-eye-test)
- [fluorescein-angiography-fa-eye-test](https://www.sheba.co.il/surgery/test/fluorescein-angiography-fa-eye-test)
- [acoustic-reflex-test](https://www.sheba.co.il/surgery/test/acoustic-reflex-test)
- [autofluorescence-faf-retina-eye-disease](https://www.sheba.co.il/surgery/test/autofluorescence-faf-retina-eye-disease)
- [color-photography-eye-test](https://www.sheba.co.il/surgery/test/color-photography-eye-test)
- [indocyanine-green-angiography-icg-eye-test](https://www.sheba.co.il/surgery/test/indocyanine-green-angiography-icg-eye-test)
- [abr-test](https://www.sheba.co.il/surgery/test/abr-test)
- [nasal-endoscopy-biopsy](https://www.sheba.co.il/surgery/test/nasal-endoscopy-biopsy)
- [fine-needle-aspiration-fna-thyroid](https://www.sheba.co.il/surgery/test/fine-needle-aspiration-fna-thyroid)
- [high-resolution-anoscopy](https://www.sheba.co.il/surgery/test/high-resolution-anoscopy)
- [video-rectoscopy-examination](https://www.sheba.co.il/surgery/test/video-rectoscopy-examination)
- [eustachian-tube-function-test-etf](https://www.sheba.co.il/surgery/test/eustachian-tube-function-test-etf)
- [endoscopic-nasal-exam-tel-hashomer](https://www.sheba.co.il/surgery/tests/endoscopic-nasal-exam-tel-hashomer)
- [advanced-mri-breasts](https://www.sheba.co.il/surgery/tests/advanced-mri-breasts)
- [cystoscopy-test](https://www.sheba.co.il/surgery/tests/cystoscopy-test)
- [urodynamic-test](https://www.sheba.co.il/surgery/tests/urodynamic-test)

**ילדים**

- [asthma-diagnosis-young-children](https://www.sheba.co.il/pediatrics/tests/asthma-diagnosis-young-children)
- [bone-marrow-test-children](https://www.sheba.co.il/pediatrics/tests/bone-marrow-test-children)
- [capsule-testing-children-hospital](https://www.sheba.co.il/pediatrics/tests/capsule-testing-children-hospital)
- [children-colonoscopy-test](https://www.sheba.co.il/pediatrics/tests/children-colonoscopy-test)
- [children-sigmoidoscopy-test](https://www.sheba.co.il/pediatrics/tests/children-sigmoidoscopy-test)
- [eeg-testing-children](https://www.sheba.co.il/pediatrics/tests/eeg-testing-children)
- [esophageal-expansion-test-children](https://www.sheba.co.il/pediatrics/tests/esophageal-expansion-test-children)
- [gastroscopy-in-children-testing](https://www.sheba.co.il/pediatrics/tests/gastroscopy-in-children-testing)
- [impedance-monitoring-children](https://www.sheba.co.il/pediatrics/tests/impedance-monitoring-children)
- [children-cardio-pulmonary-exercise-test-cpet](https://www.sheba.co.il/pediatrics/tests/children-cardio-pulmonary-exercise-test-cpet)
- [liver-biopsy-in-children](https://www.sheba.co.il/pediatrics/tests/liver-biopsy-in-children)
- [pediatric-heart-catheterization](https://www.sheba.co.il/pediatrics/tests/pediatric-heart-catheterization)
- [pediatric-heart-echo-test](https://www.sheba.co.il/pediatrics/tests/pediatric-heart-echo-test)
- [spinal-fluid-tap-test-children](https://www.sheba.co.il/pediatrics/tests/spinal-fluid-tap-test-children)
- [sweat-test-children-health](https://www.sheba.co.il/pediatrics/tests/sweat-test-children-health)
- [ultrasound-tests-children](https://www.sheba.co.il/pediatrics/tests/ultrasound-tests-children)
- [exome-accurate-genetic-test-safra](https://www.sheba.co.il/pediatrics/tests/exome-accurate-genetic-test-safra)
- [pediatric-bone-density-test](https://www.sheba.co.il/pediatrics/tests/pediatric-bone-density-test)
- [dcmrl-test](https://www.sheba.co.il/pediatrics/tests/dcmrl-test)

**הריון ולידה**

- [nuchal-translucency-scan-pregnancy-test-week-11-13plus6](https://www.sheba.co.il/pregnancy/test/nuchal-translucency-scan-pregnancy-test-week-11-13plus6)
- [pregnancy-ultrasound-week-30-33](https://www.sheba.co.il/pregnancy/test/pregnancy-ultrasound-week-30-33)
- [first-ultrasound-pulse-and-blood-test-weeks-6-12](https://www.sheba.co.il/pregnancy/test/first-ultrasound-pulse-and-blood-test-weeks-6-12)
- [gbs-test-pregnancy-week-35](https://www.sheba.co.il/pregnancy/test/gbs-test-pregnancy-week-35)
- [glucose-sugar-challenge-and-rh-test-pregnancy-week-24-28](https://www.sheba.co.il/pregnancy/test/glucose-sugar-challenge-and-rh-test-pregnancy-week-24-28)
- [alpha-fetoprotein-pregnancy-test-afp-week-16-20](https://www.sheba.co.il/pregnancy/test/alpha-fetoprotein-pregnancy-test-afp-week-16-20)
- [late-term-pregnancy-monitoring-week-40plus](https://www.sheba.co.il/pregnancy/test/late-term-pregnancy-monitoring-week-40plus)
- [shebasome-next-generation-sequencing-genetics-pregnancy-test](https://www.sheba.co.il/pregnancy/test/shebasome-next-generation-sequencing-genetics-pregnancy-test)
- [fetal-heart-echo-test](https://www.sheba.co.il/pregnancy/test/fetal-heart-echo-test)
- [genetic-test-post-miscarriage](https://www.sheba.co.il/pregnancy/test/genetic-test-post-miscarriage)
- [amniocentesis](https://www.sheba.co.il/pregnancy/tests/amniocentesis)
- [chorionic-villus-sampling-cvs](https://www.sheba.co.il/pregnancy/tests/chorionic-villus-sampling-cvs)
- [pgd-step-by-step](https://www.sheba.co.il/pregnancy/tests/pgd-step-by-step)
- [which-genetic-screening-to-do](https://www.sheba.co.il/pregnancy/tests/which-genetic-screening-to-do)
- [karyotype-test-adults](https://www.sheba.co.il/pregnancy/tests/karyotype-test-adults)
- [pregnancy-tests-guide-by-weeks](https://www.sheba.co.il/pregnancy/tests/pregnancy-tests-guide-by-weeks)
- [nipt-test](https://www.sheba.co.il/pregnancy/tests/nipt-test)
- [nips-clarity-test](https://www.sheba.co.il/pregnancy/tests/nips-clarity-test)
- [exome-test](https://www.sheba.co.il/pregnancy/tests/exome-test)

**לב וכלי דם**

- [echo-heart-test-echocardiography](https://www.sheba.co.il/cardiovascular/tests/echo-heart-test-echocardiography)
- [heart-mapping](https://www.sheba.co.il/cardiovascular/tests/heart-mapping)
- [transesophageal-echocardiogram](https://www.sheba.co.il/cardiovascular/tests/transesophageal-echocardiogram)
- [stress-echocardiogram](https://www.sheba.co.il/cardiovascular/tests/stress-echocardiogram)
- [adenosine-test](https://www.sheba.co.il/cardiovascular/tests/adenosine-test)
- [endopat-assessment-endothelial-function](https://www.sheba.co.il/cardiovascular/tests/endopat-assessment-endothelial-function)
- [brachial-artery-endothelial-function-test](https://www.sheba.co.il/cardiovascular/tests/brachial-artery-endothelial-function-test)
- [tilt-test](https://www.sheba.co.il/cardiovascular/tests/tilt-test)

**מוח ועצבים**

- [lumbar-puncture-test](https://www.sheba.co.il/neuroscience/tests/lumbar-puncture-test)
- [nfl-active-nerve-damage-test](https://www.sheba.co.il/neuroscience/tests/nfl-active-nerve-damage-test)
- [early-diagnosis-in-multiple-sclerosis](https://www.sheba.co.il/neuroscience/tests/early-diagnosis-in-multiple-sclerosis)
- [skin-biopsy-diagnosis-small-fiber-neuropathy](https://www.sheba.co.il/neuroscience/tests/skin-biopsy-diagnosis-small-fiber-neuropathy)

**רפואת הסרטן**

- [phi-prostate-cancer-early-detection-test](https://www.sheba.co.il/cancer/tests/phi-prostate-cancer-early-detection-test)
- [trus-trans-rectal-ultrasound-prostate](https://www.sheba.co.il/cancer/tests/trus-trans-rectal-ultrasound-prostate)
- [prostate-fusion-biopsy](https://www.sheba.co.il/cancer/test/prostate-fusion-biopsy)

**גינקולוגיה**

- [women-tests-guide-by-age](https://www.sheba.co.il/gynecology/tests/women-tests-guide-by-age)
- [hysteroscopy](https://www.sheba.co.il/gynecology/tests/hysteroscopy)

</details>
