# Open questions – things I could not confirm (please check on site)

Nothing below was guessed into the app as fact. Where a placeholder exists it is marked
`confidence: "placeholder"` / `todo` and is either not routable (no coordinates) or shown with a warning.
`node tools/validate-data.mjs` prints the current TODO list.

## Your first tip – MRI at night
- [ ] **Coordinates** of the small lot next to the rear MRI corridor (`p-mri-night`) and of the rear door (`ent-mri-rear`).
- [ ] **Hours**: I used *night 20:00–06:00 = ok, day = risky* as a placeholder. What are the real hours / signs?
- [ ] Is the rear door open to the public all night? Any intercom / card reader?
- [ ] Step texts + a photo for the route note `rn-mri-night`.

## Official parking lots without a confident location
The official list (sheba.co.il/locations) names these, but I could not match them to an OSM area with confidence:
- [ ] חניון מד"א · חניון מאגר המים (אימהות ואבות) · חניון מרפאות חוץ · חניון אא"ג · חניון פסיכיאטריה · חניון בית סוראסקי · the lot next to the ER mentioned on the ER directions page.
- [ ] Matches marked *low confidence* (please confirm): women's center lot = OSM way 295694762, Shai-Lev = 295849257, rehab = 1445706667, "west of south gate" = 1092807977, heart center garage = 295736774.
- [ ] The eye-institute lot: the official Waze point (32.044866, 34.845693) sits between two OSM parking areas (1092808003 and 295743534).

## Disagreements between sources
- [ ] **Child Development Institute**: OSM shows it next to the women's hospital (way 295693054); Sheba says it moved to a new location near the east-gate bus terminal. App uses no coordinates until you mark the new place.
- [ ] **Heart center garage**: listed as "סגור זמנית" on sheba.co.il (13 Nov 2026). Marked `forbidden` (not recommended) for all hours – please tell me when it reopens.
- [ ] "שער צפון" in OSM (node 3983080570, far east) is not the "main / north gate" (שער יולדות) of the official directions. Gate coordinates are therefore not used.

## Walking network gaps (the router goes around because a link is missing in OSM)
- [ ] **Cancer-center garage → cancer center / tower**: no mapped footpath from the garage's pedestrian exit; the route goes ~550 m around by road. Where is the pedestrian exit?
- [ ] Indoor routes are estimated (straight line × 1.3–1.4) except OSM corridors. The official passages (garage → floor 4 → tower, tower lobby → cancer center, floor 4 → Safra) are modelled with estimated length and **unknown opening hours** – are they open at night?
- [ ] Buildings with **no mapped entrance** in OSM: rehabilitation hospital, Padeh building, oral & maxillofacial, Merkaz HaTzomet. Routes end at the building with "find the entrance" wording.
- [ ] 17 entrances are `publicAccess: "unknown"` (OSM `entrance=yes/service/staircase`). They are **never** used for routing until you confirm them.

## Gates / hours
- [ ] East gate (בקו"ם) and south gate: closing times are official, **opening times are not** (05:00 used as a placeholder, flagged `low`).
- [ ] Friday: "from Friday noon" – exact hour?
- [ ] Holidays are not modelled (treated like the weekday they fall on).

## Not available as open data
- [ ] Floor plans / building plans: the planning archive (mavat) does not allow automated download of plan files and states no reuse license. Indoor corridors therefore come only from OSM and from your edits.

## Campus graph (graph.html)
- [ ] **Clinic count:** the lobby page header says "773 results" but paging stops after 52 pages / 518 clinics. Is the other part hidden by a filter, or does the counter include something else?
- [ ] **Clinics with no location** (no "מיקום" field and no directions link) – see `docs/CLINICS-COVERAGE.md`, section "ללא מיקום ידוע". They have no node in the graph yet.
- [ ] **All indoor weights are estimates** (dashed lines). Only the OSM corridors and roads are measured. Walk the main routes (lobby → MRI, lobby → outpatient wing 9, garage floor 4 → tower floor 1 with the two moving walkways, garage → Safra) and correct `sec` in `data/topology-seed.json`.
- [ ] **Tower outpatient wing 9:** most pages put it on the ground floor (lung institute, gastro, movement disorders, pelvic floor), the urology page says "floor 1, wing 9, adjacent to the mall". Which is right?
- [ ] **East / west elevators:** the pages for internal departments D and F say "turn right … east elevators", A, C and E say "turn right … west elevators". Only one side can be on the right – which is?
- [ ] **Which floors do the tower elevators serve?** Only floors named in the pages (west: 0,2,4,5,6 · east: 0,1,2,4,5 · outpatient: −1,0,1) are assigned; other floors found in clinic texts are attached to both banks (`inferred`).
- [ ] **Unconfirmed passages (drawn dotted orange, NOT counted as inside connections):** central building ↔ women's hospital ("the mall is at the junction" – is there an indoor corridor?), outpatient wing 9 ↔ mall floor 4 ("adjacent to the mall").
- [ ] **Buildings with no known inside link** (grey dashed ⛔): heart center, eye institute, ENT, rehab, Pade, psychiatry, Shai-Lev, Sourasky, women's hospital, Child Development Institute, pavilions 16/17, Heller. "No known link" is not "no link" – e.g. does the heart center connect to the ER/tower underground?
- [ ] **Buildings with no position at all** (no OSM polygon): Child Development Institute (new site), pavilions 16 and 17, Heller institute. They float in the "dock" below the map.
- [ ] **Hospice / "בית פרידמן"** appears in clinic texts but is not a building we model.
- [ ] **Floors above 6 in the tower** (the building has more) are only created if a clinic page mentions them.
- [ ] **Tissue-typing lab:** its own page says "בניין וואהל (adjacent to the labs building), ground floor"; the official directions page says "tower, floor 1, east elevators". Which is current? (Kept unlocated until clarified.)

## Navigation (parking / bus / "I'm already here")
- [ ] **Bus lines per stop:** OSM only maps line 104 to stops. Sheba's page lists ~30 lines (and which enter the campus) but not which stop each uses. Stops show `קווים ב-OSM` only; the full list stays on sheba.co.il.
- [ ] **Indoor geometry is schematic.** There are no floor plans: nodes are placed *inside the building footprint* by a small force layout (`geo: "layout"`), so routes stay inside buildings, but lengths and directions are approximate. Only OSM corridors (ER ↔ tower ↔ cancer center) are true geometry.
- [ ] **Which doors really open to the public?** Only entrances marked `yes` are routed; 17 are `unknown`. Buildings with no mapped door (rehab, Pade, psychiatry…) are entered through an estimated link from the nearest path – flagged "לא מאומת".
- [ ] **Clinics with no location** (191) still open a screen, but only with the official page link and a "add a location" button – no route is invented.
- [ ] **Floor-confirmation prompts** ("which floor are you on?") rely on the elevator → floor lists in `data/topology-seed.json`. Floors not mentioned on Sheba's pages are attached to both elevator banks as `inferred`.
