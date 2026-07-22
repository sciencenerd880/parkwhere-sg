import type { AvailabilityStatus, CarparkWithDistance, HdbCarpark, CarparkAvailability } from "@/types"
import { haversineDistance } from "./haversine"

const SEARCH_RADIUS_KM = 1
const MAX_RESULTS = 10

export function findNearbyCarparks(
  carparks: HdbCarpark[],
  destLat: number,
  destLng: number,
): HdbCarpark[] {
  const withDistance = carparks.map((cp) => ({
    cp,
    dist: haversineDistance(destLat, destLng, cp.lat, cp.lng),
  }))
  withDistance.sort((a, b) => a.dist - b.dist)
  return withDistance
    .filter((x) => x.dist <= SEARCH_RADIUS_KM)
    .slice(0, MAX_RESULTS)
    .map((x) => x.cp)
}

export function filterCarparks(
  carparks: CarparkWithDistance[],
): CarparkWithDistance[] {
  return carparks
}

export function getAvailabilityStatus(lotsAvailable: number | null): AvailabilityStatus {
  if (lotsAvailable === null) return "unknown"
  if (lotsAvailable === 0) return "full"
  if (lotsAvailable <= 4) return "very_limited"
  if (lotsAvailable <= 20) return "limited"
  return "healthy"
}

const CARPARK_TYPE_LABELS: Record<string, string> = {
  "MULTI-STOREY CAR PARK": "Multi-Storey",
  "SURFACE CAR PARK": "Surface",
  "BASEMENT CAR PARK": "Basement",
}

export function formatCarParkType(t: string): string {
  return (
    CARPARK_TYPE_LABELS[t] ??
    t
      .toLowerCase()
      .replace(/car park/g, "")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function mergeAvailability(
  nearbyCarparks: HdbCarpark[],
  availabilityMap: Map<string, CarparkAvailability>,
  destLat: number,
  destLng: number,
): CarparkWithDistance[] {
  return nearbyCarparks
    .map((cp) => {
      const live = availabilityMap.get(cp.carparkNo)
      const lotsAvailable = live?.lotsAvailable ?? null
      return {
        ...cp,
        distance: haversineDistance(destLat, destLng, cp.lat, cp.lng),
        lotsAvailable,
        totalLots: live?.totalLots ?? null,
        lastUpdated: live?.updateDateTime ?? null,
        availabilityStatus: getAvailabilityStatus(lotsAvailable),
      }
    })
    .sort((a, b) => {
      if (a.availabilityStatus === "unknown" && b.availabilityStatus !== "unknown") return 1
      if (b.availabilityStatus === "unknown" && a.availabilityStatus !== "unknown") return -1
      return a.distance - b.distance
    })
}
