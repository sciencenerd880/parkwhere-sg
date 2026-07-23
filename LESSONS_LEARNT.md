# Lessons Learnt Log

> Append-only log of non-trivial fixes and feature iterations. Newest at top.
>
> Template for each entry:
>
> ```
> ## YYYY-MM-DD — <short title>
> - **Symptom:**
> - **Root Cause:**
> - **Fix:**
> - **Verification:**
> - **Lesson:**
> ```

---

## 2026-07-22 — LTA DataMall migration: expanding carpark coverage beyond HDB

- **Symptom:** The app only showed HDB carparks (from `data.gov.sg`). User wanted URA, LTA-managed, and major shopping mall carparks — all of which exist in Singapore but were invisible in the app.
- **Root Cause:** The `data.gov.sg` carpark availability API (`v1/transport/carpark-availability`) serves 2,009 carpark numbers — but all follow HDB naming patterns (e.g., `ACB`, `AM16`). Despite documentation claims of covering HDB + URA + LTA, the actual response has no `agency` field and no discernible non-HDB carpark numbers. The static coordinate file (`src/data/hdb-carparks.json`) is also HDB-only. Together, there was zero signal for non-HDB carparks anywhere in the pipeline.
- **Research process:**
  1. Validated the current data source: live API curl → confirmed no `agency` field, HDB-patterned carpark numbers only.
  2. Cross-referenced API carpark numbers against static JSON: 1,989 matched, 279 static-only (decommissioned), 8 API-only (ambiguous — could be any agency but negligible count).
  3. Searched alternatives: **LTA DataMall `CarParkAvailabilityv2`** — free account key, returns 2,603 records (2,118 car lots). Includes `Agency` field: HDB (1,989), URA (88), LTA malls (41 — Suntec, ION, Raffles City, Sentosa, VivoCity, etc.). Has built-in coordinates via `Location` field. Paginated 500/call via `$skip`. No CORS headers (critical — see next entry).
  4. **URA Data Service** and **OneMap carpark API** were considered but required separate API keys and offered less coverage than LTA DataMall.
  5. **data.gov.sg static datasets** (CSV/GeoJSON) exist for URA parking places but have no live availability feed — useless for real-time parking search.
- **Decision:** Replace the entire data pipeline (`data.gov.sg` API + `hdb-carparks.json` static file) with LTA DataMall as the single source of truth. LTA returns coordinates (no static JSON needed), agency tags, developer-friendly `Development` names, and covers all three agencies + major malls in one API.
- **What changed:** New `src/lib/lta-api.ts` with pagination + 60s cache. Types simplified — dropped `HdbCarpark`, `CarparkAvailability`, `gantryHeight`, `decks`, `carParkType`, `parkingSystem`, `basement`. New flat `CarparkWithDistance` and `LtaCarpark` types. Utilities simplified — `findNearbyCarparks()` + `mergeAvailability()` replaced by `mapToCarparkWithDistance()`. `FavouriteList` now uses LTA cache instead of static JSON for favorites lookup. UI badges changed from carpark type to `agency` (HDB/URA/LTA). `carpark-api.ts` deleted.
- **Verification:** `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` success, 24/36 Playwright tests pass (12 failures = pre-existing Google auth redirect issue).
- **Lesson:** When expanding data coverage for a government open-data product, always verify the API response firsthand (curl + inspect) — documentation can be misleading (data.gov.sg claims HDB+URA+LTA coverage but the response tells a different story). LTA DataMall is the most comprehensive free source for Singapore carpark availability and should be the default choice for any parking app. The `Agency` field is the key differentiator — without it, you can't tell HDB from URA from LTA. Always prefer APIs that return coordinates inline (`Location`) over split static/dynamic datasets — it removes an entire cross-referencing layer and keeps data types lean.
- **Guard-rail for AGENTS.md:** Prefer APIs that self-contain both location and real-time availability. When evaluating a new data source, curl the actual response first — don't trust portal-level descriptions. The `Agency` field is critical for filtering/display differentiation in multi-agency datasets.

---

## 2026-07-22 — CORS: browser can't fetch LTA DataMall directly, needs API route proxy

- **Symptom:** `TypeError: Failed to fetch` at `src/lib/lta-api.ts:29` in the browser, while `curl` from the terminal worked fine.
- **Root Cause:** LTA DataMall's API server (`datamall2.mytransport.sg`) does not return `Access-Control-Allow-Origin` CORS headers. Browsers enforce CORS for cross-origin `fetch()` calls — `localhost:3000` → `datamall2.mytransport.sg` is cross-origin and gets blocked. Terminals (`curl`) don't enforce CORS, which is why the key-validation curl worked but the browser fetch didn't.
- **Fix:**
  - Created `src/app/api/carpark-availability/route.ts` — a Next.js API route that acts as a server-side proxy. The route handler: (a) reads `$skip` from the incoming request's query string, (b) forwards the request to LTA DataMall with `AccountKey` header set from `process.env.LTA_ACCOUNT_KEY`, (c) returns the response JSON. Server-to-server calls bypass CORS entirely.
  - Moved `LTA_ACCOUNT_KEY` to `.env.local` (server-only, not `NEXT_PUBLIC_`) so the key is never exposed to the browser. On Vercel, the key is set in the project's Environment Variables dashboard.
  - `src/lib/lta-api.ts`: changed `BASE_URL` from `https://datamall2.mytransport.sg/...` to `/api/carpark-availability`, removed hardcoded `ACCOUNT_KEY` and `AccountKey` header. The client now calls its own origin.
  - Updated Playwright mock (`tests/ui.spec.ts`) to intercept `**/api/carpark-availability**` instead of the LTA URL.
- **Verification:** `npm run dev` — no more `Failed to fetch` errors. 24/36 Playwright tests pass.
- **Lesson:** Third-party APIs that don't set CORS headers (common with government/specialised APIs) must be proxied through a server-side route in Next.js. `next.config.ts` rewrites can proxy the URL but **cannot inject custom headers** (like `AccountKey`) — for header-based auth, you must use an API route. Always keep API keys in server-only env vars (no `NEXT_PUBLIC_` prefix) when proxying — the browser never sees them. On Vercel, replicate all server-side env vars in the project's Environment Variables dashboard before the first deploy, otherwise the API route will 500 at runtime.
- **Guard-rail for AGENTS.md:** When adding a third-party API that the browser calls directly, first test with `curl` then test in `npm run dev`. If curl works but browser fails → CORS. Fix: create `src/app/api/<name>/route.ts` as a proxy. Never put API keys in client code or `NEXT_PUBLIC_` env vars. Always add the corresponding Vercel env var before pushing.

---

## 2026-07-22 — Playwright mock must be active before page.goto — component mounts fire immediately

- **Symptom:** Two Playwright tests (`markers should be circular pills`, `clicking a carpark row should show detail card`) failed consistently in Chromium but passed in Firefox and WebKit. The mock LTA API data was set up inside the `searchDestination()` helper, which runs after `page.goto('/')`.
- **Root Cause:** `FavouriteList.tsx` component calls `fetchAllLtaCarparks()` in a `useEffect` on mount. When the mock is set up inside `searchDestination()` (called after `page.goto`), there's a race where `FavouriteList`'s `useEffect` fires first, triggers a real `fetch('/api/carpark-availability')` that hits the (unmocked) Next.js server, fails because LTA is unreachable from CI, and throws an error. The `lta-api.ts` cache stores only successful results, so the 60s TTL doesn't protect against this failure. Subsequent calls (from the search flow) still hit the real API because the cache is null.
- **Fix:**
  - Moved `await mockLtaApi(page)` from the `searchDestination()` helper into `test.beforeEach()` hooks in every `test.describe` block. This ensures the route interception is active before `page.goto('/')` and any component mounts.
  - Pattern: `test.describe('Block name', () => { test.beforeEach(async ({ page }) => { await mockLtaApi(page) }); ... })`.
- **Verification:** Chromium tests now pass consistently. 24/36 Playwright tests pass across all 3 browsers.
- **Lesson:** When a page has components that call an API on mount (via `useEffect` or similar), Playwright mocks must be registered **before** `page.goto('/')`. `beforeEach` hooks at the `describe` level are the correct place. Never put mock registration inside helper functions that run after navigation — the mount will have already fired. If the API has a client-side cache that only stores successes, a pre-mock failure poisons the entire test session because the cache never gets populated. For module-level caches (like the 60s TTL in `lta-api.ts`), consider exposing a `clearCache()` function for tests to reset state between runs.
- **Guard-rail for AGENTS.md:** Playwright route interception for API mocks goes in `test.beforeEach` at the `test.describe` level — never inside individual test helpers that run after `page.goto`. If an API client has a module-level cache, add a test-only `clearCache()` export or accept that tests sharing a worker may see stale data.

---

## 2026-07-21 — Mobile favourites card height: 2 visible cards + scroll affordance

- **Symptom:** With 4 saved carparks, the second card was clipped at `20vh`. User also reported the mascot card overlapping the favourites list when both rendered simultaneously.
- **Root Cause:** The mobile favourites card was constrained to `max-h-[20vh]` (~162px), which wasn't enough to show 2 full favourite cards (header ~45px + 2 cards ~128px + drag handle ~16px = ~189px, needing ~23vh minimum). The mascot card also had no guard against rendering alongside favourites.
- **Fix:**
  - `src/app/page.tsx:137` — raised the card to `max-h-[26vh]` (~211px) so 2 cards fit fully with a sliver of a 3rd to signal scrollability.
  - `src/app/page.tsx:121` — kept the mascot card rendering (user preference), but the increased card height + z-index layering ensures no overlap at `26vh`.
  - `src/components/carpark/FavouriteList.tsx:34` — added `flex-1` so the list stretches to fill the card's constrained height; without it `overflow-y-auto` never engaged.
- **Lesson:** When a floating bottom panel shows a variable-length list on mobile, the `max-h` must be calibrated to the tallest element you want fully visible under the fold. Measure: drag handle (16px) + section header (45px) + N card rows (64px each). For ParkWhere's 2-card preview target, `26vh` is correct. Without `flex-1` on the scroll container, overflow won't activate regardless of the card's `max-h`.

---

## 2026-07-21 — Mobile empty-state text invisible over map background

- **Symptom:** On mobile, the "Eh, where you parking today?" text and mascot were placed directly over the map layer. Black (`text-neutral-800`) text on a white/style map with roads, labels, and POIs was hard to read — the content visually collapsed into the background.
- **Root Cause:** The empty-state container was a plain `div` with `text-center` and `px-8`. No background, no blur, no shadow — the text floated transparently over the map canvas with no visual anchor. `src/app/page.tsx:122-132`.
- **Fix:** Wrapped the text/mascot in a frosted glass card using the app's existing glassmorphism tokens: `bg-white/75 backdrop-blur-3xl border-[0.5px] border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl px-6 py-5`. This matches the search results panel, favourites card, and error banner — consistent pattern throughout the app.
- **Verification:** `npx tsc --noEmit` → clean. `npm run lint` → clean.
- **Lesson:** Any text-over-map overlay must have a background treatment (glassmorphism card, solid background, or text shadow) to guarantee readability against the full range of map tile colours (roads, parks, water, labels). For ParkWhere's Cupertino design language, glassmorphism is the default — never place plain text over a map without `bg-white/75 backdrop-blur-xl` or equivalent. This applies to all floating UI: search bar, error banner, empty state, results panel.

---

## 2026-07-21 — Persisting favourites with zustand/persist + localStorage

- **Symptom:** Favourites needed to survive page reloads and repeat visits. Could go with localStorage (client-side) or a server-side database (Postgres via Vercel Postgres / Supabase).
- **Root Cause:** The store used plain `create()` with no persistence — every page load initialised `favorites: []` in memory. `src/store/useParkingStore.ts:57`.
- **Decision:** Used `zustand/middleware/persist` with `partialize` to persist only `favorites: string[]` to `localStorage`. No new dependencies — zustand v5 ships `persist` built-in. 3 lines changed in the store.
- **Why not Postgres:** This is an unauthenticated utility app — no login, no user accounts. Postgres would require building auth first (login/signup flow), API routes for CRUD, and a managed DB instance — all for persisting at most a few carpark numbers. Massive overkill.
- **Why localStorage fits:** Zero-latency reads/writes, zero infrastructure, works on Vercel's serverless edge without a DB, and the data is tiny (string array). Losing favourites on browser clear is acceptable for a parking utility — not critical data.
- **The `partialize` trick:** By default, `persist` saves the entire store (destination, carparks, mapView, etc.). `partialize: (state) => ({ favorites: state.favorites })` restricts the persisted slice to just favourites, keeping the stored JSON tiny (`["ACB", "ACM"]`).
- **Verification:** `npx tsc --noEmit` → clean. `npm run lint` → clean. `npm run build` → success. 4 new Playwright tests passing for favourites UI flow.
- **Lesson:** For personal preference/configuration data in an unauthenticated, single-user utility app, `zustand/middleware/persist` + `partialize` targeting `localStorage` is the pragmatic default. Upgrade to a database only when you need cross-device sync (which requires auth anyway), multi-user collaboration, or data too large for localStorage's 5–10 MB limit.
- Richer features - the tipping point is when the data needs to follow the user, not the browser. So ask ourself, do I want someone to sign in with Google on their laptop and see the same favorites on their phone? 
- That is when a database starts to make sense. And then if your app becomes a platform with relationships between data like users, favorites, history, notifications, that's where Postgres really shines. So personally, I'd think about having a simple evolution. First, use local storage, then add Google Sign-In plus a database, and then later add richer features that need a backend. But no matter what, even with Postgres, keep Zustand for local UI state.

---

## 2026-07-19 — Mobile selected-carpark flow: peek state, sticky pinnning, and row exclusion

- **Symptom:** Selecting a carpark on mobile forced the drawer to 78vh (expanded), covering most of the map right when the user most wants to see the pin location. The selected card also appeared twice — once in the detail card and once in the row list — and would scroll away while browsing.
- **Root Cause:** The mobile drawer had only two boolean states: collapsed (46vh) and expanded (78vh), with no awareness of whether a carpark was selected. Both states showed PanelHeader + list rows, and both included the selected carpark card.
- **Fix:**
  - Introduced a `peek` state: `selectedCarpark && !drawerExpanded` sets the drawer to `max-h-[36vh]`, showing just a "See all ▴" handle and the selected detail card. `page.tsx:70-82`.
  - Auto-collapse to peek on first selection via a `useRef(selectedCarpark)` check; subsequent selections while expanded keep the drawer expanded. `page.tsx:68-74`.
  - Expanded mode now renders the selected `CarparkDetail` as `sticky top-0` above the list, and `CarparkList` receives `excludeCarparkNo` to strip the selected carpark from the row list, eliminating the duplicate. `page.tsx:151-159`, `CarparkList.tsx:27-31`.
  - `getMapPadding` updated with a third mobile bottom-padding tier for peek (`innerHeight * 0.42`) so the selected pin`s `flyTo` centers it in the visible map area above the peek card. `MapView.tsx:28-30`.
- **Verification:** 23/24 Playwright tests pass (one known WebKit API timeout flake); new mobile tests assert peek height strictly below 42vh, single address occurrence in expanded panel, and sticky card remains visible after scrolling the list.
- **Lesson:** When a floating UI panel has multiple logical states that affect map viewport occlusion, model them as a state machine (not booleans) and keep the map padding in lock-step with each state. The selected-carpark card should be pinned (sticky) and excluded from the scrollable list to prevent duplicates — this mirrors the "detail master-detail" pattern common in mobile list views.


## 2026-07-18 — Multiple elements matched in E2E tests due to responsive layout duplication

- **Symptom:** Playwright tests failed with `strict mode violation: getByPlaceholder(...) resolved to 2 elements`.
- **Root Cause:** To support different responsive layouts (floating search on desktop, in-flow search on mobile), two `<SearchBar />` components were rendered in the DOM — one visible, one hidden via CSS (`hidden md:block` / `md:hidden`). Playwright`s `getByPlaceholder` and standard locators found both, violating strict mode.
- **Fix:** Appended `:visible` pseudo-class to the locators in `tests/ui.spec.ts` (e.g. `locator("...:visible")`) and chained `.locator("visible=true")` to `getByPlaceholder` to ensure Playwright only interacts with the layout element actually visible to the user.
- **Verification:** 18/18 E2E tests pass across Chromium, Firefox, and WebKit.
- **Lesson:** When tests interact with components that are duplicated in the DOM for responsive CSS layout toggling, standard locators will fail strict mode. Always append Playwright`s `:visible` filter to target the actively rendered component.


## 2026-07-18 — Carpark markers pinned to top-left corner (invisible on map)

- **Symptom:** After searching a destination, all 10 carpark markers render at viewport `(0, 0)` — hidden behind the logo/search bar — instead of being plotted around the destination on the map.
- **Root Cause:** The `marker-in` entrance animation in `src/app/globals.css:141` keyed `transform: scale()` with `animation-fill-mode: both`. CSS animations with `fill-mode: both` permanently own the `transform` property, overriding MapLibre's inline `style.transform = "translate(-50%, -50%) translate(xpx, ypx) ..."` that positions each marker (`src/components/map/MapView.tsx:230`). Computed transform of affected markers: `matrix(1, 0, 0, 1, 0, 0)`; dataset marker i=1: inline set to `translate(368px, 365px)` but rendered at `(0, 0)`.
- **Fix:**
  - `src/app/globals.css:141` — animate the individual `scale` property (not `transform`) — `from { opacity: 0; scale: 0; } to { opacity: 1; scale: 1; }`. Individual `scale` composes with MapLibre's inline `transform: translate(...)` instead of overriding it.
  - `src/app/globals.css:152` — fill mode `both` → `backwards`, so after the 0.3s entrance the element releases the animated props and Tailwind's `scale-110` and the opacity-dim styling take over.
  - `tests/ui.spec.ts:4` — added regression test asserting ≥3 markers have `x > 50 && y > 50` (not clustered at origin).
- **Verification:**
  - Live DOM inspection: markers now land at `(352, 353)`, `(346, 376)`, `(355, 258)`, `(444, 440)`, etc. across the map (previously all at 0,0).
  - `npx playwright test tests/ui.spec.ts` — 9/9 passed (3 browsers × 3 tests).
  - `npm run lint` — clean.
  - `npm run build` — success.
- **Lesson:** CSS keyframe animations that animate `transform` **and** use `fill-mode: both` will permanently override any inline `style.transform` set by third-party libraries (MapLibre, Leaflet, Framer Motion, etc.). When animating entrance effects on library-positioned elements, prefer the individual `scale` / `opacity` / `translate` CSS properties (they compose with `transform`) or use `fill-mode: backwards`. Never key `transform` on elements that a library positions via inline `style.transform`. This guard-rail now belongs under "## Map" in AGENTS.md.

---

## 2026-07-18 — Carpark markers rendered as full-width horizontal bars

- **Symptom:** All carpark markers appeared as long horizontal bars spanning the full width of the map container, broken only by the availability number. Selecting one made only that bar shrink correctly.
- **Root Cause:** The marker styling effect in `src/components/map/MapView.tsx:258, 272` did `el.className = "flex items-center justify-center rounded-full ... relative overflow-hidden ..."`. MapLibre v5.24 applies its own `maplibregl-marker` class **directly to the user-supplied element** (no separate wrapper — confirmed by inspecting `node_modules/maplibre-gl/dist/maplibre-gl.js`). That class provides `position: absolute` (and the anchor-related sizing). `el.className = ...` wiped it entirely, dropping the marker out of abs-positioning and making it an in-flow block-flex element that filled the full container width.
  - DOM injection test confirmed: with the `maplibregl-marker` class → `position: absolute`, `width: 36px`; after `className` replacement → `position: relative`, `width: 1280px` (full viewport).
- **Fix:**
  - `src/components/map/MapView.tsx:258, 272` — replaced the two `el.className = "..."` assignments with `classList.add/remove` toggles (`scale-100`/`scale-110`, `z-10`/`z-20`, `hover:scale-110`) so MapLibre's `maplibregl-marker` (and `maplibregl-marker-anchor-center`) classes are preserved.
  - `src/components/map/MapView.tsx:218` — removed `relative` from the marker creation className (hardening — the element is already `position: absolute`, `relative` is unnecessary and could conflict).
  - `tests/ui.spec.ts:22, 56` — replaced fragile `.bg-white\\/95.backdrop-blur-2xl` panel selector with `[data-testid="carpark-panel"]`. Added `data-testid="carpark-panel"` to the panel in `src/app/page.tsx:83`.
- **Verification:**
  - DOM injection test: the element keeps `position: absolute` and `width: 36px` after the classList toggles.
  - `npx playwright test tests/ui.spec.ts` — 6/6 passed (3 browsers × 2 tests).
  - `npm run lint` — clean.
  - `npm run build` — success.
- **Lesson:** When a library owns the element you pass to it (MapLibre marker, React Portal target, Radix trigger, etc.), never replace `el.className` wholesale — only mutate classes via `classList` so library-owned classes are preserved. This applies to MapLibre v5+ in particular because it stamps `maplibregl-marker` on the provided element itself. Guard-rail added under "## Map" in AGENTS.md.

---

## 2026-07-18 — E2E tests fail after mobile redesign branch import

- **Symptom:** Playwright UI tests fail on the desktop and mobile "marker visibility" scenarios after merging the mobile redesign branch.
- **Root Cause:** Two-pronged staleness in `tests/ui.spec.ts`:
  1. Search placeholder was hardcoded to `"Search destination..."`; the redesign changed it to `"Where you going ah?"` (`src/components/search/SearchBar.tsx:85`), so `getByPlaceholder` found nothing.
  2. Panel selector used fragile Tailwind class chain `.bg-white\\/95.backdrop-blur-2xl`, which no longer matches the redesigned panel (`bg-white/75 backdrop-blur-3xl` — opacity and blur level both changed).
  3. Underlying layout bug: the redesigned results panel appears as soon as `destination` is set, but `MapView`'s `getMapPadding` only added right/bottom padding when `selectedCarpark` was set. With no carpark selected, the map's `flyTo` centered the destination under the panel, and the marker was obscured.
- **Fix:**
  - `tests/ui.spec.ts:8, 42` — updated placeholder to `"Where you going ah?"`.
  - `tests/ui.spec.ts:22, 56` — switched panel selector to `[data-testid="carpark-panel"]`.
  - `src/app/page.tsx:83` — added `data-testid="carpark-panel"` to the results panel.
  - `src/components/map/MapView.tsx:12` — `getMapPadding` now takes `{ hasDestination, hasSelectedCarpark, drawerExpanded }` and factors in destination (not just selected carpark).
  - `src/components/map/MapView.tsx` — applied to all `map.flyTo` calls (destination, user location, selected carpark).
  - `src/app/page.tsx:39` — `drawerExpanded` state passed to `MapView` as a prop. On mobile, panel bottom padding is `innerHeight * 0.5` (collapsed) or `0.8` (expanded) to avoid the marker being hidden behind the drawer.
- **Verification:**
  - `npx playwright test tests/ui.spec.ts` — 6/6 passed (3 browsers × 2 tests).
  - `npm run lint` — 0 errors (after adding missing `drawerExpanded` deps to two `useEffect` arrays).
  - `npm run build` — success.
- **Lesson:** Two guard-rails:
  - **Tests:** Never anchor E2E selectors to volatile styling-class chains (Tailwind utility lists change across redesigns). Use semantic anchors — `data-testid` is ideal because it is redesign-proof and removes the coupling between UX copy and test logic. Update test selectors *before* pushing to avoid false-positive CI failures when merging redesign branches.
  - **Map padding logic:** Dynamic map padding (`flyTo` `padding`) must key off every floating UI element that occupies a region of the viewport, not just the one currently most obvious. For ParkWhere, that means: desktop right padding keyed on `destination` (panel visible) with extra bottom padding for the selected-carpark FAB; mobile bottom padding keyed on `(destination, drawerExpanded)` — the mobile drawer has two heights. Convention added under "## UI/UX (Apple/Cupertino Design Language) — Layout & Map Padding" in AGENTS.md.