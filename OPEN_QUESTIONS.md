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
