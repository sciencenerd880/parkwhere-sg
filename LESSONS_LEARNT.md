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

## 2026-07-22 — Favourites insert failing with `42501 permission denied` (GRANT vs. RLS are two different gates)

- **Symptom:** Sign-in worked, but every attempt to favourite a carpark failed with a generic "Couldn't update favourites. Please try again." toast. Supabase's Postgres logs showed `42501 permission denied for table parkwhere_favorites` on every insert.
- **Root Cause:** The table was created via a raw `CREATE TABLE` + RLS policy migration (through a script/tool), not through Supabase Studio's table editor UI. Studio's UI auto-`GRANT`s base table privileges (SELECT/INSERT/UPDATE/DELETE) to the `anon`/`authenticated` Postgres roles when you create a table there; a bare `CREATE TABLE` does not. So `authenticated` (the role PostgREST assumes for signed-in requests) had *zero* privilege on the table — Postgres rejected every query at the `permission denied` layer, before RLS was ever evaluated. RLS only filters *which* rows a role can see once that role already has table access — it can't substitute for the base grant.
- **Fix:** `grant select, insert, update, delete on table public.parkwhere_favorites to authenticated;` run once in Supabase's SQL Editor.
- **Verification:** Retried favouriting on live production — insert succeeded, row visible in Table Editor.
- **Lesson:** Supabase/PostgREST access control is two independent layers, both required: (1) coarse `GRANT` — can this role touch the table at all, and (2) fine-grained `RLS policy` — which rows. Whenever a table is created via raw SQL rather than Studio's UI, always pair `ENABLE ROW LEVEL SECURITY` + policy with an explicit `GRANT ... TO authenticated`. The error message is the tell: `42501 permission denied for table X` means a missing GRANT; `new row violates row-level security policy for table X` means the policy itself is wrong — different bugs, different fixes.

---

## 2026-07-22 — OAuth redirect silently landing on localhost instead of production (Supabase Redirect URLs allow-list)

- **Symptom:** Testing Google sign-in on live `https://parkwhere-sg.vercel.app`, after approving on Google's consent screen the browser landed on `http://localhost:3000/?code=...` — or, on a retry, an error page `.../?error=invalid_request&error_code=flow_state_already_used`. No error was shown on the production domain at all; it just silently redirected to a machine the user wasn't even on.
- **Root Cause:** Two compounding issues:
  1. Supabase's **Redirect URLs** allow-list had `https://parkwhere-sg.vercel.app` entered *without* a path wildcard, while the app requests `https://parkwhere-sg.vercel.app/auth/callback`. A bare domain entry does not implicitly cover its own sub-paths — it needs the `/**` suffix. Since the requested redirect didn't match, Supabase fell back to the configured **Site URL** (`http://localhost:3000` at the time) and just appended the `code`/`error` query params to it.
  2. Separately, the very first attempt happened *before* the PR containing the `/auth/callback` route had been merged to `main` — so even a correctly matched redirect to production would have hit a 404, since that route didn't exist in the live deployment yet.
- **Fix:** Added `https://parkwhere-sg.vercel.app/**` (with wildcard) to Redirect URLs; updated Site URL to the real production domain; merged the PR so the route actually exists in the deployed build (confirmed via the Vercel build log's route table: `ƒ /auth/callback`, `ƒ Proxy (Middleware)`).
- **Verification:** Fresh Incognito sign-in on `parkwhere-sg.vercel.app` completed and landed back there, signed in.
- **Lesson:** Supabase's `redirectTo` must exactly match an allow-listed pattern, wildcard included if there's a path — and on any mismatch it does not error, it silently falls back to Site URL, which reads like a bizarre unrelated bug rather than a config typo. Also: never debug an OAuth flow against a hosted URL without first confirming (via the deployment's own build/route log) that the branch containing the relevant code is actually what's live there.

---

## 2026-07-22 — Google Sign-In + account-based favourites (Supabase Auth + Postgres)

- **Symptom / motivation:** The prior entry (2026-07-21) flagged the tipping point explicitly: "do I want someone to sign in with Google on their laptop and see the same favourites on their phone? That's when a database starts to make sense." Favourites lived only in `localStorage` via `zustand/persist` — tied to one browser, not the person. This entry is that upgrade.

- **Why OAuth (Google Sign-In) instead of our own login:** We never want to own passwords — storing them means salting/hashing correctly, building reset-password flows, and owning the blast radius of a breach. OAuth flips this: the *user* proves their identity to Google (who they already trust), and Google hands us a signed token vouching for who they are. We never see a password, only a verified identity.

- **Why Supabase specifically:** The feature needs two things that are normally two separate integrations — (1) an OAuth-capable identity provider, and (2) a real multi-user database, since favourites now belong to a `user_id`, not a browser. Supabase bundles both behind one project: **Auth** is a hosted GoTrue instance that wraps OAuth providers (Google, GitHub, etc.) and issues JWTs; the **database** is a real Postgres instance with Row Level Security built in and exposed automatically over a REST API (PostgREST) — no hand-written CRUD endpoints needed. One dashboard, one set of credentials, instead of wiring an identity provider to a separate DB host.

- **The schema, and why it looks like this:**
  ```sql
  create table public.parkwhere_favorites (
    user_id uuid references auth.users(id) on delete cascade not null,
    carpark_no text not null,
    created_at timestamptz default now() not null,
    primary key (user_id, carpark_no)
  );
  ```
  - The **composite primary key** `(user_id, carpark_no)` models the relationship directly: a user can favourite many carparks, a carpark can be favourited by many users (classic many-to-many). It also does double duty as a free uniqueness constraint — inserting the same pair twice fails at the database, so there's no app-side "check if already favourited" logic needed.
  - `references auth.users(id) on delete cascade` — `auth.users` is Supabase's own managed table of signed-in identities. Foreign-keying into it means if a user's account is ever deleted, their favourite rows vanish automatically. No orphaned data, no cleanup job.

- **Row Level Security (RLS), the part that replaces "remember to filter by user_id everywhere":**
  ```sql
  alter table public.parkwhere_favorites enable row level security;
  create policy "Users manage own favorites" on public.parkwhere_favorites
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  ```
  Normally, any role with table access can read/write any row. RLS makes Postgres silently AND a policy predicate onto every query for a given role — like a WHERE clause you can't forget to write. `auth.uid()` reads the `sub` claim out of the caller's JWT (Supabase injects the identity per-request), so every query a signed-in user makes is automatically scoped to their own rows, enforced at the database layer. Even a bug in our client code that forgot `.eq("user_id", ...)` couldn't leak another user's favourites — the database itself won't return the rows.

- **Client/Secret + Site URL / Redirect URL configuration, and what each piece is actually for:**
  - Google Cloud Console OAuth client: **Authorized redirect URIs** must contain Supabase's own callback, `https://<project-ref>.supabase.co/auth/v1/callback` — *not* our app's route. Google only ever talks to Supabase directly; our app never sees Google's response.
  - The full handshake: our app calls `signInWithOAuth` → browser goes to Supabase's `/authorize` → Supabase redirects to Google's consent screen → user approves → Google redirects back to **Supabase's** `/auth/v1/callback` with a code → Supabase exchanges that code with Google server-to-server (using the **Client Secret**, which only Supabase ever holds) → Supabase mints its *own* one-time code → redirects the browser to **our** app's `redirectTo` (`/auth/callback`) → our route handler exchanges that second code for a session via `exchangeCodeForSession`, using only the public anon key (no secret needed client-side).
  - Supabase's **Redirect URLs allow-list** (Authentication → URL Configuration) is a separate gate from Google's: it controls which `redirectTo` values Supabase will honor for that last hop. **Site URL** is the fallback used whenever the requested `redirectTo` doesn't match anything in that allow-list — silently, with no error. This fallback behavior is what caused the confusing bugs below.

- **Fix / implementation:** `src/proxy.ts`, `src/app/auth/callback/route.ts`, `src/lib/supabase/{client,server}.ts`, `src/store/useAuthStore.ts`, `src/components/auth/{AuthListener,AuthButton}.tsx`, `src/lib/favorites.ts`. Dropped `zustand/persist` from `useParkingStore` entirely — `toggleFavorite` is now optimistic (updates UI immediately, syncs to Supabase in the background, rolls back on failure) and prompts sign-in if called while signed out.

- **Verification:** `npm run lint` / `npm run build` clean; manually verified sign-in, favourite persistence across refresh, and RLS scoping via Supabase Table Editor on the live `parkwhere-sg.vercel.app` deployment.

- **Lesson:** The natural progression for a small app's persistence needs is: local state (`useState`) → persisted local state (`zustand/persist` + `localStorage`) → account-backed state (OAuth + a real database) — each step only when the previous one's ceiling is actually hit (browser-only vs. cross-device). Reach for Supabase-style "Auth + Postgres in one project" specifically when you need *both* identity and multi-user data at once — it removes an entire integration seam (wiring a separate identity provider to a separate DB) that would otherwise be pure plumbing.

---

## 2026-07-22 — Next.js 16 renamed `middleware.ts` → `proxy.ts`

- **Symptom:** Standard Supabase SSR auth guides (and general Next.js knowledge) instruct creating a root `middleware.ts`. Caught proactively rather than as a runtime bug, per this repo's `AGENTS.md` warning to verify framework APIs against what's actually installed.
- **Root Cause:** Next.js 16.2.10 (this repo's installed version) deprecates that convention. `next/server`'s `NextMiddleware` / `MiddlewareConfig` types are marked `@deprecated` in `node_modules/next/dist/server/web/types.d.ts`; the build system looks for a root/`src`-level `proxy.ts` (`PROXY_FILENAME` in `next/dist/lib/constants.js`) as the replacement. A `middleware.ts` file still technically works but logs a deprecation warning and is slated for removal — it doesn't fail loudly, so this is easy to miss.
- **Fix:** Created `src/proxy.ts` (not `src/middleware.ts`), exporting a default function typed as `NextProxy`. Verified via `npm run build` output showing `ƒ Proxy (Middleware)` in the route table with no deprecation warning.
- **Lesson:** For file-naming/config-shape conventions (as opposed to typed APIs), a wrong guess doesn't show up as a compile error — it silently no-ops or falls back to a deprecated path. When AGENTS.md says "this is NOT the Next.js you know," that applies as much to build-time file conventions as to runtime APIs — grep `node_modules/next/dist` for the actual constant/behavior before trusting training-data memory.

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