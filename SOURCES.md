# Sources

Every record in `data/sheba.json` has a `prov` field with `source`, `confidence`, and (where relevant) the
URL/OSM id and retrieval date. This file lists the sources themselves.

| Source | URL | License / terms | Retrieved | Used for |
|---|---|---|---|---|
| OpenStreetMap (via Overpass mirror `overpass.kumi.systems` and the OSM API) | https://www.openstreetmap.org/copyright | **ODbL 1.0** – attribution "© OpenStreetMap contributors" shown in the app footer and map; the derived `data/sheba.json` is a Derivative Database and stays under ODbL | 2026-11-13 | building outlines and names, footways/roads/steps/corridors (walking graph), entrances/doors and their tags, parking areas, emergency-access way, ER entrance, helipad, disabled-only parking |
| OSM map tiles (tile.openstreetmap.org) | https://operations.osmfoundation.org/policies/tiles/ | OSMF tile usage policy (no bulk download / no prefetch) | live | base map. The app only caches tiles you actually viewed; offline it falls back to drawing buildings/paths from our own data |
| Sheba – "הגעה, חנייה ונגישות" | https://www.sheba.co.il/locations | © Sheba, all rights reserved. **Facts only** (names of official lots, price 30 ₪/24h, free first 30 min from same gate, payment, EV chargers), written in our own words with a link back | 2026-11-13 | official parking list, prices, the two official Waze points (cancer-center garage, eye-institute lot) |
| Sheba – "איך מגיעים" directions pages (85 pages under `/general/directions-clinics/`) | https://www.sheba.co.il/general/directions-clinics/ | © Sheba. Facts only (building, floor, which lobby/corridor), shortened paraphrase + link to the page | 2026-11-13 | destination list, building + floor, official indoor passages (garage → floor 4 → hospital tower; tower lobby → cancer center; floor 4 → Safra), gate hours (east gate closes 21:00 & weekends, south gate closes 17:30 & weekends) |
| Sheba sitemap | https://www.sheba.co.il/sitemap | public | 2026-11-13 | list of directions pages |

## Added with the campus graph (2026-11-13)

| Source | URL | Terms | Used for |
|---|---|---|---|
| Sheba – clinics lobby ("חיפוש מרפאה") | https://www.sheba.co.il/lobbies/clinics-lobby | © Sheba. Clinic **names and page links only** | list of clinics (`data/clinics-directory.json`) |
| Sheba – each clinic's public page, field "מיקום" and its "דרכי הגעה" link | https://www.sheba.co.il/ (paths in the directory file) | © Sheba. Only the short location sentence is kept, with a link to the page. **Phone numbers and e-mail addresses on those pages are deliberately not stored.** | building / floor / wing per clinic |
| Sheba sitemap | https://www.sheba.co.il/sitemap | public | list of the 248 "tests" pages (`data/tests-directory.json`) |
| Sheba – "איך מגיעים" pages (re-read for indoor structure) | https://www.sheba.co.il/general/directions-clinics/ | © Sheba. Facts only (turns, landmarks, floors, elevators), re-expressed in `data/topology-seed.json` with the page named in each `src` | lobbies, elevators, floors, wings, indoor passages |
| OSM indoor corridors (way 509092926 etc.) | https://www.openstreetmap.org/ | ODbL | the long ground-floor corridor ER → tower → cancer center and the central-building link (measured weights) |

| OSM bus stops + bus route relations | https://www.openstreetmap.org/ | ODbL | `data/bus-stops.json` (40 stops, 26 near the campus graph) – extracted from the OSM extract by the `data-gatherer` agent and spot-checked against the raw file; only line 104 is mapped to stops |

| **Israel Ministry of Transport GTFS** via the Open Bus Stride API (https://open-bus-stride-api.hasadna.org.il) | state-run public-transport data | **Licence not confirmed**: no explicit open licence found; the file says "verify terms" (MOT terms are Hebrew and revisable) – used for bus stops and line numbers (`data/bus-stops-gov.json`, 25 stops, retrieved 2026-11-13). Replaces the thin OSM bus data (kept as a fallback). Please check the terms before the site goes public. |

**Not used: Google Maps.** Its terms forbid automated extraction and storing its content, and this project only reuses material whose license allows it. Locations come from Sheba's own text instead; clinics left without a location carry a plain "search in Maps" link for manual lookup (`docs/CLINICS-COVERAGE.md`, node details in `graph.html`).

Crawl etiquette: the lobby (52 pages) and ~520 clinic pages were opened like a visitor, 2–5 at a time with pauses, once. `sheba.co.il/robots.txt` only disallows `/api/`, which the scripts never call directly.

## How the data was collected (and what was *not* done)

* `tools/import-osm.mjs` – re-runnable OSM import (see README). It replaces only records whose `prov.source`
  is `osm` or `generated`; official, owner and crowd records are never overwritten.
* `tools/seed-official.mjs` – the facts from sheba.co.il, typed in by hand from the pages above.
  `sheba.co.il/robots.txt` disallows automated access to `/api/`, so the import script does **not** scrape the
  site; the pages were read once (85 page views, rendered like a normal visitor) on 2026-11-13.
* **Planning archive (mavat.iplan.gov.il) – considered, NOT used.** Its `robots.txt` disallows automated access
  to plan files (`*.pdf`, images) and no reuse license is stated for the drawings, so nothing was imported.
  You can still look at plans manually to help place points in the editor (see OPEN_QUESTIONS.md).
* No openly licensed architectural drawings of the campus were found.

## Libraries (vendored, no build step)

| Library | Version | License |
|---|---|---|
| Leaflet | 1.9.4 | BSD-2-Clause (`vendor/leaflet/LICENSE`) |
| ngraph.graph | 20.1.2 | BSD-3-Clause (`vendor/ngraph/LICENSE.ngraph.graph`) |
| ngraph.path | 1.6.1 | MIT (`vendor/ngraph/LICENSE.ngraph.path`) |

## OSM accessibility tags (2026-11-14)
`tools/import-osm.mjs` now keeps optional `tags` on graph edges, nodes and entrances (crossing, kerb, surface, wheelchair, access, level, indoor, door, covered, lit, incline, handrail). Fetched via the OSM API (Overpass mirrors timed out). Counts on edges: surface 353, crossing 66, access 39, entrance 26, wheelchair 9, indoor 9, level 8, lit 5, kerb 3, covered 3, incline 1, handrail 1 (most inside 300 m of the hospital). **No `step_count`, `ramp`, `tactile_paving` or `automatic_door` tags exist in this area** – unknown stays unknown. Note: Node's `fetch` ignores the proxy unless run with `NODE_USE_ENV_PROXY=1`.

## Search aliases (2026-11-14)
`data/search-aliases.json` (Latin abbreviations and Hebrew typed spellings, intent words): derived from the repo's own names in `data/sheba.json`, `data/clinics-directory.json` and `data/tests-directory.json`, plus common Hebrew spellings typed by users; no web source, language aid only, no facts about Sheba.
