# Sheba Parking Guide – project guide (read this first)

Unofficial, static, Hebrew/RTL, mobile-first web app: for each clinic at Sheba Medical Center (Tel HaShomer) it suggests where to start (parking, bus stop, or "I'm already here"), the best entrance and step-by-step walking directions, outdoors and **inside** the buildings. Not affiliated with Sheba.

## Non-negotiables
1. **Never invent local knowledge.** Facts come from OSM, Sheba's public pages, or the owner. Unknown stays unknown (`null`, `conf:"inferred"`, or an entry in `OPEN_QUESTIONS.md`).
2. **Safety:** never recommend emergency lanes, ambulance bays, disabled spots, fire access; only routes through doors known to be public (`publicAccess:"yes"`) and open at the chosen time. Unofficial parking always shows `טיפ לא רשמי – על אחריותך, בדוק שילוט במקום`; never say it is legal.
3. **No personal data** (no phones/e-mails/doctor names stored; anonymous tips only).
4. **Sources:** only reusable material. **No Google Maps/Places scraping.** Record every source in `SOURCES.md`. Sheba's robots.txt disallows `/api/`.
5. All campus parking costs the same flat fee → say it once, never per lot.
6. No build step: vanilla ES modules, vendored Leaflet + ngraph. Hebrew UI, large touch targets, works offline (PWA).

## Map of the repo
| Area | Files |
|---|---|
| Campus data (OSM + official) | `data/sheba.json` ← `tools/import-osm.mjs`, `tools/seed-official.mjs` |
| **Campus graph** (indoor + outdoor, weights, groups) | `data/topology-seed.json` (hand) → `tools/build-topology.mjs` → `data/topology.json` / `.graphml` |
| Clinics directory (518) + tests list | `tools/crawl/*`, `tools/build-directory.mjs` → `data/clinics-directory.json`, `docs/CLINICS-COVERAGE.md` |
| Routing | `js/engine/campus-router.js` (graph routing: parking / bus / here), `topo-steps.js`, legacy `router.js`/`recommend.js` |
| App UI | `index.html`, `js/app.js`, `js/ui/*`, `css/app.css`; strings in `js/strings.he.js` |
| Internal graph viewer | `graph.html`, `js/graph/*` |
| Tips backend (optional) | `supabase/schema.sql`, `js/backend.js`, `js/editor/*` |
| Tests | `npm test` (node --test), `tests/e2e/*.cjs` (Playwright, needs `npm run serve`) |

## Working agreements
- Prefer editing `data/topology-seed.json` over generated files. After graph changes: `npm run build:topology && npm test`.
- Commit messages end with the attribution lines the session provides. Develop on the branch given by the session; never open a PR unless asked.
- Weights typed by hand are **estimates** (`est:true`) and are shown as such.

## Subagents (`.claude/agents/`) – delegate small jobs, save tokens
| Agent | Model | Use for |
|---|---|---|
| `data-gatherer` | haiku | bounded extraction / crawling chores with sources (bus stops, location texts, lists) |
| `qa-runner` | haiku | run all tests + e2e, return a ≤10-line digest |
| `copywriter` | sonnet | names, headlines, Hebrew microcopy; owns `js/strings.he.js` |
| `graph-keeper` | sonnet | owns the graph: seed, builder, viewer, directory; updates + verifies on every change |
| `strategist` | opus | general thinking: options, trade-offs, priorities, risk review (read-only) |

Rules of thumb: the main session does cross-cutting engineering; give agents a *specific, closed* task and the exact files; ask for a short report. New sessions pick the agents up automatically from `.claude/agents/`.
