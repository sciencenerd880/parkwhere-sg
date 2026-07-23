import type { LtaCarpark } from "@/types"

const BASE_URL = "/api/carpark-availability"
const CACHE_TTL_MS = 60_000
const PAGE_SIZE = 500
const MAX_PAGES = 20 // safety valve: LTA returns ~2600/500 = 6 pages; 20 is generous

let cache: { data: LtaCarpark[]; fetchedAt: number } | null = null

function parseLocation(location: string): { lat: number; lng: number } | null {
  const parts = location.trim().split(/\s+/)
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

interface LtaRawItem {
  CarParkID: string
  Agency?: string
  Development?: string
  Area?: string
  Location: string
  AvailableLots?: number
  LotType: string
}

function toLtaCarpark(item: LtaRawItem): LtaCarpark | null {
  if (item.LotType !== "C") return null
  const coords = parseLocation(item.Location)
  if (!coords) return null
  return {
    carParkId: item.CarParkID,
    agency: (item.Agency ?? "HDB") as LtaCarpark["agency"],
    development: item.Development ?? "",
    area: item.Area ?? "",
    lat: coords.lat,
    lng: coords.lng,
    availableLots: item.AvailableLots ?? 0,
  }
}

/**
 * Fetch all car lots (LotType "C") from LTA DataMall via the local proxy,
 * paginating 500/call. A `MAX_PAGES` safety valve guarantees termination
 * even if the upstream API ever returns exactly 500 rows on every page
 * (e.g. dataset size divisible by 500, or LTA changes pagination shape).
 * The 60s in-memory TTL prevents re-paginating on every carpark lookup.
 */
export async function fetchAllLtaCarparks(): Promise<LtaCarpark[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data
  }

  const results: LtaCarpark[] = []
  let hitSafetyValve = false

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE
    const url = skip ? `${BASE_URL}?$skip=${skip}` : BASE_URL
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`LTA API error: ${res.status} ${res.statusText}`)
    }

    const json: { value?: LtaRawItem[] } = await res.json()
    const values = json.value ?? []

    for (const item of values) {
      const cp = toLtaCarpark(item)
      if (cp) results.push(cp)
    }

    if (values.length < PAGE_SIZE) break

    if (page === MAX_PAGES - 1) {
      hitSafetyValve = true
    }
  }

  if (hitSafetyValve) {
    console.warn(
      `[lta-api] reached MAX_PAGES=${MAX_PAGES} safety valve — ` +
        `LTA may have changed pagination shape or dataset grew beyond ` +
        `${MAX_PAGES * PAGE_SIZE} rows. Last page returned exactly ${PAGE_SIZE}.`,
    )
  }

  cache = { data: results, fetchedAt: Date.now() }
  return results
}

/** Reset the module-level cache — for unit/integration test isolation. */
export function _clearCacheForTests(): void {
  cache = null
}