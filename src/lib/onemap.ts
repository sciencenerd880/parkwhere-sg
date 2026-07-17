import type { OneMapSearchResult } from "@/types"

const ONEMAP_SEARCH_URL = "https://www.onemap.gov.sg/api/common/elastic/search"
const ONEMAP_REVGEOCODE_URL = "https://www.onemap.gov.sg/api/public/revgeocode"

export async function searchDestination(
  query: string,
): Promise<OneMapSearchResult[]> {
  const url = `${ONEMAP_SEARCH_URL}?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error("OneMap search failed")

  const data = await res.json()
  if (!data.results) return []

  return data.results.map((r: Record<string, string>) => ({
    lat: parseFloat(r.LATITUDE),
    lng: parseFloat(r.LONGITUDE),
    name: r.BUILDING || r.ROAD_NAME || r.BLK_NO || "",
    address: r.ADDRESS,
  }))
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<OneMapSearchResult | null> {
  const url = `${ONEMAP_REVGEOCODE_URL}?location=${lat},${lng}&buffer=100&addressType=All&otherFeatures=N`

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    const info = data?.GeocodeInfo?.[0]
    if (!info) return null

    const address = info.ADDRESS || `${info.BLOCK || ""} ${info.ROAD || ""}`.trim()
    return {
      lat,
      lng,
      name: info.BUILDINGNAME || address || "My Location",
      address: address || "Current location",
    }
  } catch {
    return null
  }
}
