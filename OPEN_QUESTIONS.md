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
- [x] **Bus lines per stop:** now from the Ministry of Transport GTFS (21 stops near the campus, lines 1 3 7 8 8א 48 65 104 inside; more on Derech Sheba). Still open: the data has no label for the east-gate terminal, line direction is not verified, and **the data licence must be checked** before the site goes public.
- [ ] **Indoor geometry is schematic.** There are no floor plans: nodes are placed *inside the building footprint* by a small force layout (`geo: "layout"`), so routes stay inside buildings, but lengths and directions are approximate. Only OSM corridors (ER ↔ tower ↔ cancer center) are true geometry.
- [ ] **Which doors really open to the public?** Only entrances marked `yes` are routed; 17 are `unknown`. Buildings with no mapped door (rehab, Pade, psychiatry…) are entered through an estimated link from the nearest path – flagged "לא מאומת".
- [ ] **Clinics with no location** (191) still open a screen, but only with the official page link and a "add a location" button – no route is invented.
- [ ] **Floor-confirmation prompts** ("which floor are you on?") rely on the elevator → floor lists in `data/topology-seed.json`. Floors not mentioned on Sheba's pages are attached to both elevator banks as `inferred`.
- [ ] **Accessibility outdoors is unverified:** OSM has no steps/ramps mapped inside the hospital area (the only 10 mapped flights are at a school complex ~480 m away), so the "accessible" route cannot yet exclude real hospital steps. The app says so when ♿ is on. Next: re-import crossings/ramps/step_count/incline/covered tags, then have the owner mark steps on one route.

## Night / evening local routes (2026-11-14) – see docs/LOCAL-ROUTES-CANDIDATES.md
Candidates are in `data/local-route-candidates.json`. Nothing is verified. Please answer on site:
- [ ] Is OSM way/295751880 (≈1,470 m², access=yes, surface, ≈220 m from the tower) the "small lot outside the central garage" you meant for night MRI? Or is it another lot?
- [ ] The lot OSM way/295696976 (access=yes) overlaps a disabled-designated zone (way/509023462) and is therefore rejected. Is it the lot you meant? (If so, we need another safe option.)
- [ ] Which door is the MRI "back entrance": service door node/6925716764 (east wall of the tower), service door node/2994451836 (north, 21 m off the wall), or another door not in OSM?
- [ ] Is node/6925716764 (entrance=service, wheelchair=yes) open to visitors at night? Card reader, intercom, or sign?
- [ ] Is node/2994451836 (entrance=service) a public door or staff-only?
- [ ] Is there a back door on the south or west side of the tower that is not mapped in OSM?
- [ ] Where does the back door lead: straight into the MRI corridor, or to the lobby / elevators?
- [ ] Is the chosen lot at ground level, with a direct walk into the tower? Any gate, barrier, or hours at night?
- [ ] Is the central-garage passage (floor 4) and the cancer-centre passage to the tower open at night? (Currently unknown.)
- [ ] Is the Safra south door node/4962942604 open to the public at night? (It is the campus-side door tagged access=yes.)
- [ ] Is the labs door node/4964789436 really closed after 19:00 (OSM opening_hours 06:00-19:00)?
- [ ] Are the women's-hospital side doors node/2994422647 and node/2994422668 open to the public?
- [ ] Is lot OSM way/295694762 the right lot for the women's hospital (low-confidence match)?
- [ ] Should a permanent rule exclude lots inside disabled-designated zones (way/509023462) from all recommendations?
