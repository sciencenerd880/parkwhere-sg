import type { AvailabilityStatus, CarparkWithDistance, LtaCarpark } from "@/types"
import { haversineDistance } from "./haversine"

export const SEARCH_RADIUS_KM = 1
export const MAX_RESULTS = 10

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

export function mapToCarparkWithDistance(
  ltaCarparks: LtaCarpark[],
  destLat: number,
  destLng: number,
): CarparkWithDistance[] {
  const withDistance = ltaCarparks
    .map((cp) => ({
      cp,
      dist: haversineDistance(destLat, destLng, cp.lat, cp.lng),
    }))
    .filter((x) => x.dist <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, MAX_RESULTS)

  return withDistance.map(({ cp, dist }) => ({
    carparkNo: cp.carParkId,
    address: cp.development,
    lat: cp.lat,
    lng: cp.lng,
    agency: cp.agency,
    distance: dist,
    lotsAvailable: cp.availableLots,
    totalLots: null,
    lastUpdated: null,
    availabilityStatus: getAvailabilityStatus(cp.availableLots),
  }))
}
