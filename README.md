# ParkWhere SG

ParkWhere SG is a modern, mobile-first web application that helps drivers in Singapore find available HDB car parks near their destination with real-time lot availability.

## Features

- **Live Availability** — Real-time car park lot data from data.gov.sg
- **Smart Search** — Destination autocomplete powered by OneMap Singapore
- **Interactive Map** — MapLibre GL JS with OneMap's clean "Default" light tiles
- **Proximity Filtering** — Automatically finds and sorts the nearest car parks within 1 km
- **Seamless Navigation** — One-tap Google Maps directions to the selected car park
- **Premium UI/UX** — Features an Apple (Cupertino) inspired design system with thick glassmorphism (`backdrop-blur-3xl`), dynamic map padding for unobstructed viewing, and tactile micro-interactions (`active:scale-[0.98]`).

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js (App Router)                |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS v4 + shadcn/ui         |
| State          | Zustand                             |
| Map            | MapLibre GL JS                      |
| Geocoding      | OneMap Search API                   |
| Parking Data   | data.gov.sg Carpark Availability    |
| E2E Testing    | Playwright (`npm run test:e2e`)     |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data

The static dataset of 2,268 HDB car parks lives at `src/data/hdb-carparks.json`. Coordinates were converted from SVY21 (EPSG:3414) to WGS84 (EPSG:4326) using `proj4`.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

No environment variables are required.
