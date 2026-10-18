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

## 2026-10-18 — Loop Engineering Setup: Tiered Verification Gate, GitHub Actions CI & PR Harness

- **Symptom:** Without automated continuous integration or pull request workflows, code pushed to the repository had no remote objective verification gate before triggering live Vercel deployments, creating risk of undetected regression cascades in agent-driven workflows.
- **Root Cause:** Absence of a GitHub Actions workflow (`.github/workflows/ci.yml`) and lack of a structured PR branching harness in `AGENTS.md` left feature development reliant solely on local manual checks.
- **Fix:**
  - Added `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test` (Vitest), and `npm run build` with mock environment variables on every push and PR to `main`.
  - Added `"typecheck": "tsc --noEmit"` to `package.json` for unified local and CI execution.
  - Updated `AGENTS.md` under `Agent Workflow & Git Operations` to establish a two-tier loop: an inner verification gate (`npm run lint && npm run typecheck && npm test`) and an outer pull request protocol (`feat/<name>` branches with automated PR summaries).
- **Verification:** Ran `npm run lint && npm run typecheck && npm test` locally (85/85 tests passed, 0 lint/type errors); verified YAML workflow syntax and mock env bindings.
- **Lesson:** In loop-engineered AI development, an objective remote evaluation harness (CI) and branch isolation (PRs) prevent hallucinated errors from reaching production; the agent's system prompt (`AGENTS.md`) must codify this loop as a non-negotiable operational reflex.

---

## 2026-10-17 — Mall Coverage Expansion: Adding 13 LTA Live-Telemetry Malls to Rate Engine

- **Symptom:** Commercial shopping malls actively streaming live lot counts in the LTA DataMall `CarParkAvailabilityv2` feed (e.g. Raffles City, IMM Building, The Star Vista, Millenia Walk, Wisma Atria) were treated as generic public lots ($1.20/hr flat rate) without mall badges (`isMall`), grace period details, or nearby public HDB savings calculations.
- **Root Cause:** `mallRatesData` in `src/data/mall-rates.ts` only included 24 initial shopping malls. The 13 additional commercial developments lacked tariff structures and keyword match definitions in `rate-engine.ts`.
- **Fix:** Added rate configurations, grace periods, remarks, and keyword definitions for 13 major commercial developments in `src/data/mall-rates.ts` (Raffles City, IMM Building, The Star Vista, Millenia Walk, Wisma Atria, Funan Mall, HarbourFront Centre, Orchard Central, Far East Plaza, The Centrepoint, Bukit Panjang Plaza, The Esplanade Mall, CQ @ Clarke Quay); added test coverage in `tests/unit/rate-engine.spec.ts`.
- **Verification:** `npx tsc --noEmit` clean, 85/85 unit tests passed (`vitest run`), `npm run lint` clean (0 errors, 0 warnings).
- **Lesson:** When expanding parking coverage, keep the rate calculation engine in sync with the live telemetry feed so that any gantry-connected development automatically unlocks enriched mall cards, realistic parking fees, and comparative savings benchmarks.

---

## 2026-10-17 — Mobile Audit Refinements: Card De-cluttering, Clear CTAs & Touch Ergonomics

- **Symptom:** Critical UI audit of the live mobile application on localhost:3001 revealed cognitive overload ("badge soup" of 4 colored pills per listing card), micro-font legibility failures under 11px, misleading duration CTA copy ("Confirm Parking" triggering false commitment anxiety), and dual competing back navigation controls in the mobile peek drawer.
- **Root Cause:** Accumulation of redundant metadata pills (text availability badge sitting directly next to a lot count badge), sub-11px font scaling without minimum optical floor, ambiguous CTA copy, and dual vertical/horizontal navigation affordances rendered in the same view.
- **Fix:**
  - `src/components/carpark/CarparkCard.tsx`: De-cluttered listing cards by merging availability into the lot count badge with a dynamic colored dot (`● 301 lots`), inlining agency into distance metadata (`LTA • 0.01 km`), enforcing an 11px font floor, and adding `tabular-nums` to eliminate layout jitter during live refresh.
  - `src/components/search/ParkingTimeControls.tsx`: Renamed duration popover CTA from `"Confirm Parking"` to **`"Apply Schedule • Depart by [Time]"`**; increased quick chips vertical padding from `py-1.5` to `py-2` (minimum 36px visual / 44px tap target) to eliminate driving mis-taps.
  - `src/components/carpark/CarparkDetail.tsx`: Renamed ambiguous `"Park"` action button to **`"Save Spot"`**; clamped mall badge font size to 10px bold uppercase.
  - `src/app/page.tsx`: Eliminated the conflicting "Show all carparks" button in peek mode, unifying mobile drawer wayfinding around a single, clean `‹ Back to list` affordance with standard iOS drag handle.
  - `src/components/parked/ParkedCarPassModal.tsx`: Converted all primary action buttons from forced uppercase to sentence case (`"Walk back to car"`, `"Share spot"`).
- **Verification:** `npx tsc --noEmit` and `npm run lint` passed with 0 errors; tested and verified live on mobile emulation (`http://localhost:3001` iPhone 15 Pro 393x852) across the entire search, schedule, listing, detail, and spot memory flow using Chrome DevTools with screenshots.
- **Lesson:** On mobile navigation screens, eliminate redundant status badges: if a colored indicator dot already communicates availability, do not add a text badge saying the same thing. Reserve accent badges strictly for high-value differentiators (e.g., mall savings), clamp text to an 11px minimum, and ensure CTA copy accurately distinguishes between applying a search filter and committing to a session.

---

## 2026-10-17 — Rare UI Design Language Harmonization & Inline Hesitation Guard

- **Symptom:** UI components across the parking journey suffered from design language fragmentation: the duration selector was overly monochrome and heavy, the pass ticket featured outdated skeuomorphic paper notches and destructive action vulnerability (a single-click "End Parking" button risking accidental wipeout of the user's saved spot), and radii/lighting paradigms clashed.
- **Root Cause:** Sourcing components from disparate UI patterns without a unifying design token matrix led to mismatched surface lighting (neon cyan glows vs. dark coupons vs. clean frosted glass), disparate radii scales (`rounded-full` vs `rounded-2xl`), and absent hesitation buffers on destructive operations.
- **Fix:**
  - `src/components/search/ParkingTimeControls.tsx`: Replaced rigid duration chips and floating pills with a unified Cupertino Horizontal Stepper (`2h 30m` bold tabular text, ±30m tactile squircle steppers, quick preset chips `1h, 2h, 3h, 4h, 6h`, inset summary card with arrival/departure timeline and HDB rate baseline, and a prominent primary CTA: **"Confirm Parking • Depart by [Time]"**).
  - `src/components/parked/ParkedCarPassModal.tsx`: Modernized the pass container to Apple frosted glass (`rounded-t-[32px] md:rounded-[32px]`), eliminated paper ticket notches, and integrated the Rare UI **`delete-button`** inline morphing hesitation buffer: tapping "End Parking" morphs in-place into an Apple System Red (`#FF3B30`) button with a 3-second animated countdown depletion bar (`animate-countdown-deplete`) and "Tap to Confirm End", preventing accidental deletion while eliminating intrusive alert modals.
  - `src/components/parked/ParkedCarCaptureModal.tsx`: Standardized form inputs to `rounded-xl` and primary action buttons to `rounded-2xl` matching the master Cupertino squircle scale.
  - `src/components/parked/ParkedCarBanner.tsx`: Replaced generic loader ping with an Apple Live Activity style gentle ambient status pulse.
  - `src/app/globals.css`: Added keyframes for `.animate-countdown-deplete` (3s linear width countdown).
- **Verification:** `npx tsc --noEmit` passed with 0 errors, `npm run lint` passed with 0 warnings/errors, and verified cross-component visual consistency across all three touchpoints.
- **Lesson:** When incorporating advanced micro-interactions from external registries (like Rare UI), never adopt disparate surface or lighting models directly. Always enforce a master design token contract (Apple frosted glass, standard squircle hierarchy, `#007AFF` primary action, `#FF3B30` with 3s hesitation buffer for destructive actions) so that all micro-interactions feel like a single bespoke design system.

---

## 2026-10-17 — Parking Spot 5-Step Animated Journey & AI Slop Eradication

- **Symptom:** The parking spot capture sheet suffered from cognitive overload, lifelessness, and subtle "AI slop": an artificial letter "P" square badge mismatched with outline icons, an erroneous search magnifying glass on an input field intended for recording lot numbers, and a static 2012 desktop dashed file upload box without tactile feedback or state transitions.
- **Root Cause:** Generative templates frequently mix mismatched icon conventions, reuse generic search inputs for text entry, and omit mobile micro-interaction feedback loops (sliding tracks, loading guards, and celebratory confirmation cards).
- **Fix:**
  - `src/components/parked/ParkedCarCaptureModal.tsx`: Implemented a cohesive 5-step animated parking spot journey:
    1. **Open Save Parking Spot:** Bottom sheet glides upward (`animate-in slide-in-from-bottom duration-300 ease-out`) with frosted glass backdrop keeping the live map and traffic markers visible.
    2. **Segmented Control & Level Selection:** Native iOS segmented control with an animated sliding white pill track (`transition-all duration-200`) pairing `<Building2 />` (Upper Decks) with `<Layers />` (Basements) with zero synthetic "P" badges; floor pills (`L1`, `L2`, `L3`, `L4`, `Others`) bounce on tap (`active:scale-95`) and dynamically update the active label and CTA.
    3. **Landmark Tagging & Camera Viewfinder:** Replaced search glass with an Apple Blue location beacon (`MapPin`); replaced desktop dashed upload box with an iOS camera viewfinder card with 4 corner focus brackets `[ ]` and a soft ambient breathing pulse shutter button.
    4. **Lock in Spot:** Button shows an active loading spinner (`<Loader2 className="animate-spin" />`) and prevents accidental duplicate submissions.
    5. **Spot Saved & Compact Card:** Seamlessly transitions into a celebration state featuring an animated checkmark ping (`CheckCircle2`), followed by a compact summary card displaying carpark address, level badge, lot tag, timer status, and photo snapshot thumbnail before gently returning to the main view where `ParkedCarBanner` stays active.
- **Verification:** 84/84 unit tests passed (`vitest`), `npx tsc --noEmit` passed with 0 errors, `npm run lint` clean, and visually verified across the entire 5-step sequence on mobile emulation via Chrome DevTools with screenshots.
- **Lesson:** Transform static utility forms into cohesive micro-journeys. Providing immediate tactile feedback during input, an in-flight loading guard during submission, and an explicit compact summary confirmation card eliminates user hesitation and builds confidence that data is securely stored.

---

## 2026-10-16 — Mobile Viewport Breathing Room, Header Overflow & Card Hierarchy Overhaul

- **Symptom:** On mobile viewports (iPhone ~390px), the parked car capsule pushed the Google Sign In button completely off-screen, the bottom drawer immediately covered 46% of the screen (leaving only ~25% visible for the map), and each card had three vertically stacked numbers with confusing units (`91`, `~$2.40`, `$0.60/30m`).
- **Root Cause:** Rigid uncollapsed desktop layouts rendered indiscriminately on mobile viewports; `ParkedCarBanner` displayed full address strings alongside logo and auth button; bottom sheet lacked a compact peek stage on initial search load; and card right-column numbers lacked explicit inventory labelling.
- **Fix:**
  - `src/components/parked/ParkedCarBanner.tsx`: Added responsive compact capsule for `< sm` screens (`[ 🚗 Deck • Price ]`), preserving 100% visibility for the Sign In button. Added `shrink-0` to `src/components/auth/AuthButton.tsx`.
  - `src/app/page.tsx` & `src/components/map/MapView.tsx`: Introduced a 30vh compact peek drawer on search completion with a bottom "Swipe up or tap for all {count} carparks" affordance and adjusted map dynamic bottom padding multiplier from 0.55 to 0.32, boosting visible map area from 25% to ~70%.
  - `src/components/carpark/CarparkCard.tsx`: Replaced 3-number vertical stack with an explicit inventory badge (`[ 91 lots ]`) and a consolidated single pricing subline (`~$2.40 • $0.60/30m`).
  - `src/components/search/ParkingTimeControls.tsx`: Streamlined arrival time trigger to avoid redundant duration text alongside quick chips.
- **Verification:** 84/84 unit tests passed, `npx tsc --noEmit` clean, `npm run lint` clean, verified via Chrome DevTools mobile emulation (iPhone 15 Pro 393x852) with zero header clipping and smooth drawer expansion.
- **Lesson:** On mobile navigation interfaces, never default to half-screen modal drawers upon search completion. Always default to an information-dense compact peek stage (28-30vh) to prioritize map situational awareness, and protect top app-bar elements from flex compression using explicit breakpoints and `shrink-0`.

---

## 2026-10-16 — Rolling Odometer Lot Counter & Apple "Find My" Radial Marker Ping

- **Symptom:** Availability numbers switched abruptly without giving visual feedback that data had been freshly loaded, and selecting a carpark in dense urban areas (e.g. Orchard Road or Yishun) required drivers to visually search which dot on the map was selected.
- **Root Cause:** Raw numeric text replacement lacked spatial transition continuity, and unselected/selected map markers only differed in static circle diameter without an attention-directing motion pulse.
- **Fix:**
  - Built `src/components/ui/Odometer.tsx`: GPU-accelerated mechanical digit slot reels (`translateY(-N * 10%)`) with tabular numbers, staggered column cascades (`(len - 1 - i) * 35ms`), and spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`). Integrated into `src/components/carpark/CarparkDetail.tsx`.
  - Added `.marker-ping` in `src/components/map/MapView.tsx` and `.animate-sonic-ping` in `src/app/globals.css`: emits a 2.4x expanding translucent hairline ring in the carpark's stoplight color upon selection without triggering layout reflow or interfering with MapLibre's root element inline transforms.
- **Verification:** 84/84 unit tests passed, `npx tsc --noEmit` clean (0 errors), `npm run lint` clean, and verified via Chrome DevTools DOM evaluation (`totalMarkersWithPing: 10`, `activeAnimatedPingFound: true`).
- **Lesson:** Use motion strictly for telemetry validation and peripheral guidance. Mechanical digit reels prove data freshness in <300ms, while expanding hairline sonic rings instantly orient the driver's eyes on the road grid.

---

## 2026-10-16 — AI Slop Removal & Cupertino Automotive UI Polish (Icons, Colors & Shimmer Skeletons)

- **Symptom:** App contained generic AI tropes (pulsing fake radar SVGs, Lottie map loading animation delay, overuse of "telemetry" buzzwords, ambiguous 4-tier color states, and shouting all-caps typography) causing visual fatigue.
- **Root Cause:** Early generative scaffolding introduced pseudo-tech decoration ("telemetry", radar sweeps) and nuanced availability buckets (`limited` vs `very_limited` in orange vs amber) that created cognitive friction for drivers requiring glanceable clarity.
- **Fix:**
  - Replaced `RadarTelemetryIcon` and zombie mascot with clean Apple-inspired `CompassBeaconIcon` and upgraded app icon gradient to Apple System Blue (`#007AFF`) in `src/components/icons.tsx`.
  - Replaced heavy Lottie map animation in `src/components/carpark/CarparkList.tsx` with native 4-card shimmer skeletons, reducing bundle overhead and rendering latency.
  - Eradicated all user-facing "telemetry" buzzwords across `src/app/page.tsx`, `src/components/onboarding/OnboardingModal.tsx`, and `src/components/search/SearchBar.tsx`, replacing with driver-friendly copy ("live lot counts", "availability", "pricing").
  - Standardized on a clear 3-color traffic stoplight palette (Green: Available, Amber: Filling Fast, Red: Full) across `CarparkCard.tsx`, `CarparkDetail.tsx`, and `MapView.tsx`.
  - Softened shouting all-caps labels to clean Cupertino title/sentence case typography and unified CTA actions on Apple System Blue (`#007AFF`).
  - Replaced dead-end desktop empty state with an actionable springboard featuring 4 quick destination chips (`Orchard Road`, `Marina Bay Sands`, `Jewel Changi`, `Bugis Junction`).
  - Removed dead `.animate-radar` keyframes from `src/app/globals.css`.
- **Verification:** 84/84 unit tests passed (`npm run test`), `npx tsc --noEmit` clean (0 errors), `npm run lint` clean (0 errors, 0 warnings), and validated through Chrome DevTools DOM snapshot across live destinations (e.g. Fern Grove @ Yishun with 10 nearby HDB carparks).
- **Lesson:** High-utility driving applications demand radical subtraction. Replace decorative AI filler (radar sweeps, Lottie bloat, buzzword stuffing) with instant native shimmer skeletons, high-contrast 3-color stoplights, and interactive springboard chips that take the user straight to action. When running local dev servers that rely on upstream government APIs (LTA DataMall), ensure background task is run with network permission so it doesn't silently fall back to the 11 mock HarbourFront lots.

---

## 2026-10-16 — Adaptive Split-Pill Action Bar & Glanceable Rate Decluttering (Concept A)

- **Symptom:** On mobile peek mode, carpark detail cards experienced severe viewport clipping and scroll-jumping where primary navigation and parked car CTAs were pushed off-screen. Additionally, pricing information presented triple redundancy ($5.00 repeated across header, bullets, and remarks) creating excessive visual noise.
- **Root Cause:** Stacking two full-width button rows (`Start Navigation` + `I'm Parked Here`) coupled with uncollapsed rate breakdown and remarks tables inflated the card height to >420px within a 36vh peek container. Furthermore, `ParkingTimeControls` popover was layered under the drawer due to shared `z-20` stacking context.
- **Fix:**
  - Implemented Concept A "Adaptive Split-Pill" in `src/components/carpark/CarparkDetail.tsx`: merged navigation, 1-tap park capture, and favorite toggle into a single 44px horizontal row (`[ 🧭 Navigate (60%) ]` + `[ 🚗 Park (25%) ]` + `[ ♡ (15%) ]`), which dynamically morphs into an active session pass pill when parked.
  - Decluttered pricing telemetry into a single-line glanceable summary (`~$5.00 • $5.00/entry [MALL]`) with a smooth on-demand `[Details ▾]` drawer for detailed breakdown and concession remarks.
  - Elevated top search container to `z-30` in `src/app/page.tsx` resolving dropdown layering conflicts.
  - Added `excludeCarparkNo` to desktop `CarparkList` in `src/app/page.tsx`, eliminating double-card repetition in the desktop sidebar.
- **Verification:** 84/84 unit tests passed (`npm run test`), `npx tsc --noEmit` clean (0 errors), `npm run lint` clean, and automated Chrome DevTools browser verification across mobile (iPhone 390x844) and desktop (1280x800).
- **Lesson:** In automotive/driver mobile interfaces, never stack multiple full-width CTAs in constrained sheet viewports. Use unified segmented horizontal action bars with adaptive state morphing, and tuck secondary terms/conditions into progressive disclosure drawers.

---

## 2026-10-16 — Find My Car & Live Parking Pass with Dynamic Island & 3-Second MSCP Capture

- **Symptom:** Drivers frequently experience parking amnesia in Singapore multi-storey carparks (MSCPs) and shopping mall basements where indoor GPS signal drifts or fails completely and photos get lost in camera rolls.
- **Root Cause:** Standard navigation tools drop 2D GPS coordinates without vertical (Z-axis) floor data (e.g. Deck 3A vs 3B), pillar/lot landmarks, or running duration/fee tracking.
- **Fix:**
  - Added `ParkedCarSession` in `src/types/index.ts` and persisted state in `src/store/useParkingStore.ts` via Zustand with safe `localStorage` synchronization.
  - Built `src/components/parked/ParkedCarCaptureModal.tsx` for a 3-second micro-capture flow with 1-tap deck chips (`B2`, `B1`, `L1`, `L2`, `L3A`, `Roof`), lot/pillar input, and client-compressed pillar photo capture.
  - Built `src/components/parked/ParkedCarBanner.tsx` as a floating Cupertino Dynamic Island capsule displaying elapsed parking duration and real-time estimated fees.
  - Built `src/components/parked/ParkedCarPassModal.tsx` featuring an Apple Wallet-style digital parking pass with 1-tap walking directions back to the vehicle (Google Maps & Apple Maps), spot sharing, and fee ticker.
  - Integrated dedicated pulsing parked car beacon in `src/components/map/MapView.tsx` and seamless 1-tap "I'm Parked Here" / "View Pass" triggers in `src/components/carpark/CarparkDetail.tsx`.
- **Verification:** 84 unit tests passing (`npm run test`), `npx tsc --noEmit` (0 errors), `npm run lint` clean (0 errors, 0 warnings).
- **Lesson:** For indoor spatial memory problems where satellite GPS degrades (such as concrete MSCPs), prioritize sub-3-second micro-tagging (deck chips + quick photo) and pair with persistent client-side live activities so the session survives browser restarts without high-friction forms.

---

## 2026-09-01 — Vector Map Styling Upgrade (CARTO Positron Vector GL)

- **Symptom:** The default Singapore Land Authority (OneMap Default) raster tile basemap displayed dated topographic survey lines, bold orange/yellow highway lines, and restricted area hatching that conflicted with the clean, minimalist automotive UI.
- **Root Cause:** Raster basemap tiles lack modern vector rendering, have fixed zoom resolutions, and cannot easily have their visual weight adjusted to prioritize user markers and telemetry.
- **Fix:**
  - Upgraded MapLibre to high-performance Vector GL rendering using CARTO Positron Vector (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`).
  - Switched from raster tiles to full client-side vector styling with smooth 60fps zooming, whisper-soft building footprints, and crisp street typography with zero watermark.
  - Enhanced availability marker contrast against the clean light gray vector background.
- **Verification:** Live browser testing across all screen states (home, search query, carpark detail), 82 unit tests passed, `npx tsc --noEmit` clean, ESLint clean.
- **Lesson:** Use vector GL style specifications (`style.json`) instead of static raster tiles in MapLibre for modern web applications to achieve retina-crisp typography, zero tile seams, and customizable styling.

---

## 2026-09-01 — Tesla-inspired minimalist UI/UX redesign & telemetry overhaul

- **Symptom:** The user requested an entire frontend and UI/UX redesign inspired by Tesla's minimalist in-car and web design language (soft squircle edges, clean typography, radical subtraction, removal of cartoon mascot and Singlish copy).
- **Root Cause:** The interface previously had conversational Singlish copy ("Eh, where you parking today?", "Aiyo no carparks here lah", "chope you a lot"), a green/teal owl mascot, and cluttered badge styling that clashed with an engineered, driver-first automotive experience.
- **Fix:**
  - **Brand & Header:** Introduced a bold geometric `PARKWHERE` `SG` wordmark and sleek `AuthButton` capsule.
  - **Telemetry Radar:** Replaced the mascot with a minimalist animated `RadarTelemetryIcon` with concentric telemetry rings and Tesla Electric Blue (`#3E6AE1`) pulse.
  - **Floating Capsule Search:** Redesigned `SearchBar.tsx` as a floating glass capsule with GPS target locator and professional, driver-focused placeholders.
  - **Supercharger-Style Telemetry:** Reimagined `CarparkCard.tsx` and `CarparkDetail.tsx` with high-contrast stall availability metrics (`269 / 400 SPOTS`), clean status dots (`Available`, `Limited`, `Full`), and a prominent Tesla Electric Blue `Start Navigation` CTA pill button with Apple/Google/Waze handoff.
  - **Clean Micro-Copy:** Overhauled all empty and loading states with crisp, professional telemetry language.
- **Verification:** 82 unit tests passed (`npm run test`), `npx tsc --noEmit` passed (0 errors), `npm run lint` clean, and automated Chrome DevTools browser verification testing all interactive states on `http://localhost:3001`.
- **Lesson:** For mission-critical mobility/driver apps, "radical subtraction" of decorative mascots and chatty copy in favor of high-contrast typography and instant telemetry creates an immediate, professional, distraction-free user experience.

---

## 2026-08-31 — Singapore shopping mall & HDB parking rate engine with Cupertino Quick-Time search UX

- **Symptom:** Users needed to know estimated parking rates before choosing a destination carpark and compare expensive mall parking against adjacent cheaper HDB lots, but upfront time-pickers created severe search friction.
- **Root Cause:** Shopping malls lack an open real-time government rate API, and traditional parking apps force high-friction input forms for arrival and departure dates before displaying search results.
- **Fix:**
  - Designed a "Smart Defaults" approach defaulting to `Arrive: Now` and `Duration: 2 hours` with zero upfront forms.
  - Built a curated deterministic rate database in `src/data/mall-rates.json` and pure calculation engine in `src/lib/rate-engine.ts` supporting first-hour, subsequent blocks, per-entry transitions, Central area peak rules, HDB night caps ($5), and Sunday Free Parking Scheme (FPS).
  - Built `src/components/search/ParkingTimeControls.tsx` with frosted Cupertino pill (`[ 🕒 Now · 2h ▾ ]`) and quick chips (`[1h]`, `[2h]`, `[3h]`, `[4h]`) allowing instant client-side rate recalculation without network fetches.
  - Enhanced `CarparkCard.tsx` and `CarparkDetail.tsx` with rate badges, breakdown timelines, and a smart comparison tag (`💡 Save $X.XX vs Mall`).
- **Verification:** 14 unit tests in `tests/unit/rate-engine.spec.ts` (all 79 test suite cases passed), `npx tsc --noEmit` (0 errors), ESLint (clean), and Next.js production build (`npx next build --webpack`).
- **Lesson:** In mobility apps, compute prices instantly on smart defaults (Now + average dwell) and provide 1-tap quick pills for fine-tuning rather than blocking the search funnel with upfront date/time pickers.

---

## 2026-08-31 — Onboarding flow, Google OAuth prompt & dual-layer user analytics

- **Symptom:** Inability to distinguish unique visitors from developer testing or see user conversion from first visit to authenticated usage in Vercel Analytics alone.
- **Root Cause:** Vercel Analytics relies on cookie-less daily IP/UA hashes which can inflate visitor counts across network/device switches without identifying authenticated users or custom feature engagements.
- **Fix:**
  - Built an Apple-styled Cupertino frosted modal in `src/components/onboarding/OnboardingModal.tsx` displaying live lot features, cross-device favourites sync, and 1-tap navigation with Google OAuth as the primary action and "Explore as Guest" as fallback.
  - Used `useSyncExternalStore` for clean, SSR-safe `localStorage` synchronization avoiding React 19 cascading re-render warnings.
  - Implemented dual-layer telemetry in `src/lib/analytics.ts` (`@vercel/analytics` `track()` + first-party Supabase `user_events` and `profiles` trigger in `supabase/schema.sql`).
  - Added event tracking for destination searches, carpark selections, navigation app choices, and favourites toggles.
- **Verification:** Automated browser testing via DevTools subagent on `http://localhost:3000`, unit tests (65/65 passed), ESLint (clean), and Next.js production build (`npm run build`).
- **Lesson:** Use React 19's `useSyncExternalStore` when reading browser storage (`localStorage`) in client components to guarantee zero hydration flicker and avoid `set-state-in-effect` linter errors.

---

## 2026-08-20 — Frontend theme overhaul: vibrant blue visual identity

- **Symptom:** The interface was overly green/teal (green logo, mint card background, teal primary CTA buttons, green lot count numbers), clashing with the user's intended brand identity from promotional mockups.
- **Root Cause:** Legacy CSS theme tokens (`--color-pw-teal: #0E7C6B`, `--color-pw-mint: #E9F7F3`) and component styling in `CarparkDetail`, `CarparkCard`, `SearchBar`, and `page.tsx` hardcoded green/teal classes across primary actions and lot availability metrics.
- **Fix:**
  - Added `ParkWhereAppIcon` in `src/components/icons.tsx` (blue squircle "P" icon matching mockups).
  - Overhauled design tokens in `src/app/globals.css` with vibrant blue (`--color-pw-blue: #1D70EC`, `--color-pw-blue-light: #EBF2FE`).
  - Updated `src/app/page.tsx` header logo to "ParkWhere **SG**" with electric blue styling and blue empty states.
  - Updated `src/components/carpark/CarparkDetail.tsx` to use clean light blue surfaces (`bg-blue-50/50 border-blue-100`), vibrant blue lot counts (`text-blue-600`), and a vivid blue CTA button (`bg-blue-600 shadow-[0_8px_24px_rgba(29,112,236,0.35)]`).
  - Updated `src/components/carpark/CarparkCard.tsx` to render available lot numbers in vibrant blue (`text-blue-600`) with refined subtle emerald status tags.
  - Updated `SearchBar.tsx`, `FavouriteCard.tsx`, and `AuthButton.tsx` to blue focus/action accents.
- **Verification:** `npm run test` (65/65 passed), `npx tsc --noEmit` (0 errors), `npm run lint` (clean), and full live browser automated verification with search & selection interaction testing.
- **Lesson:** Primary brand color and status indicators should be decoupled: use brand blue for primary identity and lot counts, and use subtle semantic pill tags (green/amber/red) for status cues.

---

## 2026-07-23 — Code review: fix 4 criticals (open redirect, $skip injection, pagination loop, favourites TOCTOU)

- **Symptom:** Multi-pass code review surfaced 4 CRITICAL issues across security & correctness. User (backend Python enthusiast) requested plain-language explanations + fix plan + test plan; then approved implementation.
- **Root Cause & Fixes (one entry per finding):**

  **1. Open redirect in OAuth callback** (`src/app/auth/callback/route.ts:7,13`).
  - RC: `next` query param concatenated into `${origin}${next}` unsanitised. A `next=//evil.com` produces a protocol-relative URL → browser navigates off-site post-auth (credential phishing). OWASP Unvalidated Redirects.
  - Fix: extracted `safeNext()` to `src/lib/redirect-target.ts` — rejects anything not a single-leading-slash relative path, with an allowlist regex `^/[A-Za-z0-9._~!$&'()*+,;=:@/?-]*$`. Route now uses idiomatic `NextResponse.redirect(new URL(next, request.url))` (URL constructor, never string concat) per the Next.js redirect docs.

  **2. Unvalidated `$skip` + unauthenticated proxy** (`src/app/api/carpark-availability/route.ts:3,5-6`).
  - RC: raw query interpolated into the upstream LTA URL — `0&$filter=...` / hash traversal could redirect the upstream call through our authenticated relay (parameter injection). Route had no auth, no rate limit → LTA `AccountKey` quota exhaustion DoS.
  - Fix: extracted `parseSkip()` to `src/lib/skip-validator.ts` (parseInt + clamp `0..MAX_SKIP=5000`). Added `src/lib/rate-limit.ts` (in-memory sliding-window limiter, 60 req/min/IP per edge instance + `getClientIp()` from `x-forwarded-for`). Route now 429s over limit, 503s when `LTA_ACCOUNT_KEY` unset (fail-closed), and emits `Cache-Control: public, max-age=30`. **Known limitation:** per-instance limiter on Vercel serverless — determined attacker can sidestep across instances; Upstash/Redis-backed limiter filed as follow-up.

  **3. Pagination loop with no max iterations** (`src/lib/lta-api.ts:25-55`).
  - RC: `while (true)` with break condition `values.length < 500`. When dataset size is divisible by 500 (or LTA changes pagination shape), the break never triggers → unbounded fetches, unbounded `results` array, LTA quota exhaustion in seconds. Classic "loop depends on external data shape" bug.
  - Fix: rewrote as `for (page = 0; page < MAX_PAGES; page++)` with `MAX_PAGES = 20` safety valve + `console.warn` when the valve trips. Added `_clearCacheForTests()` export for test isolation. Extracted `toLtaCarpark()` helper for clarity.

  **4. TOCTOU race in `toggleFavorite`** (`src/store/useParkingStore.ts:70-96`, `src/lib/favorites.ts:14-21`).
  - RC: rapid double-tap fires two synchronous `toggleFavorite` calls; both read the same `wasFavorite` from a stale closure tick, both optimistically add, both call `addFavorite` → second `.insert` hits the `(user_id, carpark_no)` unique constraint, throws, `.catch()` rolls back to empty → UI shows "not favourited", DB row exists. Permanent client/DB divergence.
  - Fix: (a) `addFavorite` now uses `.upsert({...}, { onConflict: "user_id,carpark_no" })` — idempotent, second insert becomes a no-op update. (b) Store keeps an `inFlightFavorites: Set<string>` guard; second tap on the same carpark while a mutation is pending early-returns; flag released in `.finally()`.

- **Test plan executed:** Added **Vitest** (new devDep, `vitest.config.ts`, `tests/unit/` dir, npm scripts `test` / `test:watch` / `test:ui`). 65 unit tests across 5 files: `redirect-target.spec.ts` (20), `skip-validator.spec.ts` (14), `rate-limit.spec.ts` (11), `lta-api.spec.ts` (8, incl. the safety-valve test that would *hang* under the old `while(true)`), `parking-store.spec.ts` (7, incl. the TOCTOU double-tap regression). Playwright's `testIgnore: ['unit/**']` prevents the e2e runner from picking up vitest specs.
- **Verification:** `npm run test` → 65/65 pass (≈230ms). `npm run lint` → clean (after fixing `no-explicit-any` and unused-var warnings in tests). `npx tsc --noEmit` → clean. `npm run build` → success (2.7s, route handlers correctly marked ƒ dynamic). `npm run test:e2e --project=chromium` → 10 pass, 4 fail; the 4 failures are pre-existing Favourites auth tests (confirmed identical on clean baseline via `git stash -u` + rerun) — they need a Supabase session the e2e environment doesn't provide.
- **Lesson:** Four "trust boundary" failures, all worth permanent guard-rails in AGENTS.md:
  - **Query params → redirect target:** always validate via `safeNext`-style allowlist + use `new URL(path, request.url)`, never string concat. OAuth `next` is attacker-controlled.
  - **Query params → upstream URL:** never interpolate raw strings into upstream fetch URLs. Parse + clamp + type-coerce via a unit-tested helper module. Public proxy routes need rate limiting + fail-closed on missing secrets.
  - **Pagination loops:** any `while` whose break depends on upstream data shape must have a `MAX_PAGES` structural upper bound + observable warning when the valve trips.
  - **Optimistic-UI mutations:** the mutation must be idempotent (`upsert`/`ON CONFLICT DO NOTHING`) AND guarded by a per-key in-flight `Set`. Optimistic set + rollback is only safe if the underlying write can't unique-violate on a duplicated call.
- **Follow-up filed:** replace in-memory rate limiter with Upstash/Redis-backed limiter for cross-instance enforcement.

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