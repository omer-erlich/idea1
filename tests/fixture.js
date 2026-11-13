// A tiny synthetic campus used by the routing tests. NOT real Sheba data.
//
//                 P_night (unofficial; ok at night, "forbidden" by day)
//                    |
//      j_w ------- j_n
//       |            |
//       |         d_rear (public 07:00-19:00)
//       |       [  BUILDING  ]--d_staff (NOT public)--j_e--P_east (official)
//       |            |  (dest: MRI inside)                |
//       |         d_main (public 24/7)                    |
//       |         /stairs\  ramp                          |
//       +------ j1 ------ j_ramp -------------------------+
//                |  \__ P_bay (inside ambulance bay => never recommended)
//         P_risky   P_ok
//                |
//             P_main (official main garage, far)
const prov = { verified: true, lastVerified: '2026-11-01', source: 'test', confidence: 'high' };
const n = (id, lat, lon, extra = {}) => ({ id, lat, lon, kind: 'junction', prov, ...extra });
let eid = 0;
const e = (from, to, extra = {}) => ({ id: 'e' + (++eid), from, to, indoor: false, stairs: false, wheelchair: true, public: true, prov, ...extra });
const ALL = [0, 1, 2, 3, 4, 5, 6];

export function makeFixture() {
  eid = 0;
  const nodes = [
    n('P_main', 32.0430, 34.8442, { kind: 'parking' }),
    n('P_night', 32.0467, 34.8442, { kind: 'parking' }),
    n('P_east', 32.04615, 34.8452, { kind: 'parking' }),
    n('P_bay', 32.0458, 34.8438, { kind: 'parking' }),
    n('P_risky', 32.0455, 34.8441, { kind: 'parking' }),
    n('P_ok', 32.0455, 34.84435, { kind: 'parking' }),
    n('j1', 32.0457, 34.8442),
    n('j_ramp', 32.0457, 34.8447),
    n('j_w', 32.0466, 34.8434),
    n('j_n', 32.0466, 34.8442),
    n('j_e', 32.04615, 34.8448),
    n('d_main', 32.0459, 34.8442, { kind: 'door', entranceId: 'ent_main', landmark: 'דלתות זכוכית מסתובבות' }),
    n('d_rear', 32.0464, 34.8442, { kind: 'door', entranceId: 'ent_rear' }),
    n('d_staff', 32.04615, 34.8445, { kind: 'door', entranceId: 'ent_staff' }),
    n('mri', 32.04615, 34.8442, { kind: 'destination', buildingId: 'b1', floor: '-1' }),
  ];
  const edges = [
    e('P_main', 'j1'),
    e('P_risky', 'j1'), e('P_ok', 'j1'), e('P_bay', 'j1'),
    e('j1', 'd_main', { stairs: true, wheelchair: false }),          // short stairs
    e('j1', 'j_ramp'), e('j_ramp', 'd_main', { note: 'עלו ברמפה המקורה עד דלתות הזכוכית' }), // longer ramp
    e('j1', 'j_w'), e('j_w', 'j_n'), e('j_n', 'P_night'), e('j_n', 'd_rear'),
    e('P_east', 'j_e'), e('j_e', 'd_staff'), e('j_e', 'j_ramp'),
    e('d_main', 'mri', { indoor: true }), e('d_rear', 'mri', { indoor: true }), e('d_staff', 'mri', { indoor: true }),
  ];
  return {
    meta: { version: 1 },
    buildings: [{ id: 'b1', name: 'בניין הבדיקה', outline: [] }],
    destinations: [{ id: 'mri', name: 'MRI', aliases: ['תהודה מגנטית'], buildingId: 'b1', floor: '-1', nodeId: 'mri', lat: 32.04615, lon: 34.8442, prov }],
    entrances: [
      { id: 'ent_main', name: 'הכניסה הראשית', buildingId: 'b1', nodeId: 'd_main', publicAccess: 'yes', hours: null, prov },
      { id: 'ent_rear', name: 'הדלת האחורית', buildingId: 'b1', nodeId: 'd_rear', publicAccess: 'yes', hours: [{ days: ALL, from: '07:00', to: '19:00' }], prov },
      { id: 'ent_staff', name: 'דלת צוות', buildingId: 'b1', nodeId: 'd_staff', publicAccess: 'unknown', hours: null, prov },
    ],
    parkings: [
      { id: 'P_main', name: 'החניון המרכזי', type: 'garage', official: true, mainOfficial: true, nodeId: 'P_main', lat: 32.0430, lon: 34.8442, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'paid', note: '30 ₪ ליום' }], prov },
      { id: 'P_night', name: 'חניית לילה ליד MRI', type: 'lot', official: false, nodeId: 'P_night', lat: 32.0467, lon: 34.8442, rules: [
        { days: ALL, from: '19:00', to: '07:00', status: 'ok', note: 'בלילה פנוי' },
        { days: ALL, from: '07:00', to: '19:00', status: 'forbidden', note: 'ביום – חשש לדו"ח' },
      ], prov },
      { id: 'P_east', name: 'חניון מזרחי', type: 'lot', official: true, nodeId: 'P_east', lat: 32.04615, lon: 34.8452, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'paid' }], prov },
      { id: 'P_bay', name: 'מפרץ ליד המיון', type: 'street', official: false, nodeId: 'P_bay', lat: 32.0458, lon: 34.8438, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'ok' }], prov },
      { id: 'P_risky', name: 'שוליים ליד הכניסה', type: 'street', official: false, nodeId: 'P_risky', lat: 32.0455, lon: 34.8441, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'risky', note: 'אכיפה לפעמים' }], prov },
      { id: 'P_ok', name: 'מגרש קטן', type: 'lot', official: false, nodeId: 'P_ok', lat: 32.0455, lon: 34.84435, rules: [{ days: ALL, from: '00:00', to: '24:00', status: 'ok' }], prov },
    ],
    safetyZones: [
      { id: 'sz1', kind: 'ambulance_bay', polygon: [[32.0457, 34.8436], [32.0459, 34.8436], [32.0459, 34.8440], [32.0457, 34.8440]], prov },
    ],
    graph: { nodes, edges },
    routeNotes: [],
  };
}
export const at = (hh, mm = 0, day = 1) => ({ day, minutes: hh * 60 + mm });
