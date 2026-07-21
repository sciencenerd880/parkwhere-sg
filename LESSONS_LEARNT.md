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

## 2026-07-21 — Persisting favourites with zustand/persist + localStorage

- **Symptom:** Favourites needed to survive page reloads and repeat visits. Could go with localStorage (client-side) or a server-side database (Postgres via Vercel Postgres / Supabase).
- **Root Cause:** The store used plain `create()` with no persistence — every page load initialised `favorites: []` in memory. `src/store/useParkingStore.ts:57`.
- **Decision:** Used `zustand/middleware/persist` with `partialize` to persist only `favorites: string[]` to `localStorage`. No new dependencies — zustand v5 ships `persist` built-in. 3 lines changed in the store.
- **Why not Postgres:** This is an unauthenticated utility app — no login, no user accounts. Postgres would require building auth first (login/signup flow), API routes for CRUD, and a managed DB instance — all for persisting at most a few carpark numbers. Massive overkill.
- **Why localStorage fits:** Zero-latency reads/writes, zero infrastructure, works on Vercel's serverless edge without a DB, and the data is tiny (string array). Losing favourites on browser clear is acceptable for a parking utility — not critical data.
- **The `partialize` trick:** By default, `persist` saves the entire store (destination, carparks, mapView, etc.). `partialize: (state) => ({ favorites: state.favorites })` restricts the persisted slice to just favourites, keeping the stored JSON tiny (`["ACB", "ACM"]`).
- **Verification:** `npx tsc --noEmit` → clean. `npm run lint` → clean. `npm run build` → success. 4 new Playwright tests passing for favourites UI flow.
- **Lesson:** For personal preference/configuration data in an unauthenticated, single-user utility app, `zustand/middleware/persist` + `partialize` targeting `localStorage` is the pragmatic default. Upgrade to a database only when you need cross-device sync (which requires auth anyway), multi-user collaboration, or data too large for localStorage's 5–10 MB limit.

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