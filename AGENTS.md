<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ParkWhere SG — AI Agent Instructions

## Architecture & Conventions
- **App Router:** We strictly use `src/app` (no `pages/`).
- **Client Components:** Map, search, and stateful UI use `"use client"`. Server components are used where possible for static content.
- **State Management:** Zustand at `src/store/useParkingStore.ts`. No Redux or React Context.
- **Styling:** Tailwind CSS v4 + `shadcn/ui`. Use `cn()` from `src/lib/utils.ts` for conditional classes.

## Core Logic
- **Data flow:** Static HDB carpark coordinates (`src/data/hdb-carparks.json`) are merged with live API data from `data.gov.sg` at runtime, keyed by `carparkNo`.
- **Distance:** Client-side Haversine formula (`src/lib/haversine.ts`) — no routing APIs.
- **Coordinate system:** All coordinates in the JSON are already WGS84. Do not re-convert.
- **Map:** `maplibre-gl` with OneMap Default (Light) tiles. Do not add Mapbox or Google Maps SDKs.
- **Marker element ownership:** MapLibre v5+ stamps `maplibregl-marker` (and `maplibregl-marker-anchor-*`) **directly on the user-supplied element** — there is no separate wrapper. When restyling a marker after creation, **never** replace `el.className` wholesale; mutate classes via `classList.add/remove` so library-owned classes (and the resulting `position: absolute`) are preserved.
- **Marker entrance animation:** Do **not** key `transform` in CSS keyframes applied to `.maplibregl-marker` elements. MapLibre positions markers via inline `style.transform = "translate(x, y) ..."`, and a CSS animation with `fill-mode: both` will override that, pinning all markers at `(0, 0)`. Animate the individual `scale` / `opacity` properties instead (they compose with `transform`), and prefer `fill-mode: backwards` so the animation releases the animated props after completion.

## UI/UX (Apple/Cupertino Design Language)
- **Glassmorphism:** Use thick frosted glass (`bg-white/75 backdrop-blur-3xl` for light mode) with hairline borders (`border-[0.5px] border-black/5`) and soft, diffused shadows (`shadow-[0_8px_32px_rgba...]`).
- **Typography:** `Inter` font mimicking San Francisco. Use `tracking-tight` for headers/titles, `font-semibold` for primary emphasis.
- **Micro-interactions:** Interactive elements (cards, buttons, search results) should use bouncy scaling (`active:scale-[0.98] transition-all`) instead of just color shifts.
- **Colors:** Use neutral grays (`neutral-50` to `neutral-900`) instead of zinc. Primary accent CTA color is iOS System Blue (`#007AFF` or Tailwind `blue-500`).
- **Layout & Map Padding:** The map MUST use dynamic padding (`padding` in MapLibre's `flyTo`) to shift the center coordinate away from floating UI panels. Padding must key off *every* floating UI region that occupies viewport area: desktop right padding keyed on `destination` (panel visible) + extra bottom padding when a carpark is selected (FAB); mobile bottom padding keyed on `(destination, drawerExpanded)` — the drawer has two heights (`46vh` / `78vh`). See `getMapPadding` in `src/components/map/MapView.tsx`. 
- **FAB (Navigate Button):** Positioned dynamically (e.g., `bottom-[52vh]` on mobile, left of the panel on desktop) to float cleanly over the map without overlapping the results panel.
- **Marker Hierarchy:** When a carpark is selected, it grows and shimmers. All *unselected* markers keep their actual availability colors (Green/Orange/Red) but fade to `opacity: 0.4` to reduce visual noise while remaining visible on the light map.

## Agent Workflow & Git Operations
- **Confirmation Required:** Whenever a feature or enhancement is implemented, you must stop and get confirmation from the user before taking further major actions.
- **Pushing to Vercel:** The user will typically use a prompt like `push` to trigger a GitHub push. When requested, automatically stage all changes, commit them with a descriptive message, and push to GitHub to trigger the Vercel deployment.

## Lessons Learnt Log
- **Where:** `LESSONS_LEARNT.md` (repo root).
- **When:** After any non-trivial fix or feature iteration — once the root cause (RC) is identified, the fix is applied, and verifications (lint / typecheck / tests / build / live-DOM check) pass, append an entry before committing.
- **Entry format** (use the template at the top of the file):
  - `Date` — ISO date
  - `Symptom` — what the user/observer saw (1–2 sentences)
  - `Root Cause` — the actual mechanism, with file:line references
  - `Fix` — concrete change + file paths
  - `Verification` — what was run and the result
  - `Lesson` — the guard-rail or convention to prevent recurrence (add as a bullet under the relevant AGENTS.md section if it warrants a permanent rule)
- **Do not** rewrite or summarise prior entries — append only. Keep entries in reverse-chronological order (newest at top).
- **Threshold:** Skip logging for trivial changes (typos, copy-edits, pure config). Log anything involving debugging, a regression, a library quirk, or a multi-step investigation.
