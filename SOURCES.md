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
