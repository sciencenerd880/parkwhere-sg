import type { LtaCarpark } from "@/types"

const BASE_URL = "/api/carpark-availability"
const CACHE_TTL_MS = 60_000

let cache: { data: LtaCarpark[]; fetchedAt: number } | null = null

function parseLocation(location: string): { lat: number; lng: number } | null {
  const parts = location.trim().split(/\s+/)
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

export async function fetchAllLtaCarparks(): Promise<LtaCarpark[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data
  }

  const results: LtaCarpark[] = []
  let skip = 0

  while (true) {
    const url = skip ? `${BASE_URL}?$skip=${skip}` : BASE_URL
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`LTA API error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()
    const values = json.value ?? []

    for (const item of values) {
      if (item.LotType !== "C") continue

      const coords = parseLocation(item.Location)
      if (!coords) continue

      results.push({
        carParkId: item.CarParkID,
        agency: item.Agency ?? "HDB",
        development: item.Development ?? "",
        area: item.Area ?? "",
        lat: coords.lat,
        lng: coords.lng,
        availableLots: item.AvailableLots ?? 0,
      })
    }

    if (values.length < 500) break
    skip += 500
  }

  cache = { data: results, fetchedAt: Date.now() }
  return results
}
