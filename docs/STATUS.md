# Project status (2026-11-14)

Live: https://omer-erlich.github.io/idea1/ (GitHub Pages; deploys on every merge to `main`; repo is public, `main` is protected by a ruleset).
Workflow: develop on the session branch → pull request into `main` (only when asked) → merge on github.com → deploy (~1 min).
Rules and map of the repo: `CLAUDE.md`. Open questions: `OPEN_QUESTIONS.md`. Sources: `SOURCES.md`.

## Done
- Data layer (OSM + official Sheba facts), campus graph (indoor + outdoor), routing for car / bus / "I'm already here" (GPS + known places).
- 518 clinics + 225 tests; tests are searchable and linked to the clinic that performs them (site-wide banner links ignored; unlinked tests stay unlinked).
- Gov bus stops and lines (Ministry of Transport GTFS via Open Bus API; licence still to verify).
- UX: result screen shows one best option, mode/time/♿/alternatives live in an options sheet; walking card holds the instruction and its confirmation together.
- Accessibility tags from OSM stored in the data; ♿ route carries a "check on site" caveat (no steps/ramps are mapped near the hospital).
- Subagents in `.claude/agents/` (data-gatherer, qa-runner, copywriter, graph-keeper, strategist).

## Known gaps / not started
- 12 test titles missing (sheba.co.il blocks the sandbox's region; decided to leave).
- Detailed internal graph (every corner/hallway) separate from the routing graph, with viewer drill-down and "unmapped" overlay (strategist steps 3–4).
- Router does not yet use the new OSM accessibility tags.
- "Continue to next step?" prompt combining GPS and the user's action.
- Owner measure mode, site-visit checklist, correction/location tip forms; Supabase backend for public tips; verify gov bus data licence.

## Environment notes
- Network allowlist covers OSM/Overpass mirrors, sheba.co.il (region-blocked), gov data hosts; `github.io` is not allowlisted, so the live site cannot be tested from the sandbox.
- Node `fetch` ignores the proxy: run network scripts with `NODE_USE_ENV_PROXY=1`.
- E2E tests need `python3 -m http.server 8080` running.
- Demo artifact (private, snapshot, no tiles/GPS): https://claude.ai/artifact/KyCx7aPfYetwwhqv4yZMbc
