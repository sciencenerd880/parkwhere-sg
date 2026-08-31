import type { AvailabilityStatus, CarparkWithDistance, LtaCarpark } from "@/types"
import { haversineDistance } from "./haversine"
import { calculateParkingFee } from "./rate-engine"

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

export function enrichCarparksWithRates(
  carparks: CarparkWithDistance[],
  arrivalDate: Date = new Date(),
  durationMinutes: number = 120,
): CarparkWithDistance[] {
  // First pass: calculate individual rates
  const enriched = carparks.map((cp) => {
    const feeResult = calculateParkingFee(
      cp.address,
      cp.carparkNo,
      cp.agency,
      arrivalDate,
      durationMinutes,
    )

    return {
      ...cp,
      estimatedCost: feeResult.estimatedCost,
      rateSummary: feeResult.rateSummary,
      rateBreakdown: feeResult.breakdown,
      isMall: feeResult.isMall,
      mallName: feeResult.mallName,
      remarks: feeResult.remarks,
    }
  })

  // Second pass: find nearby mall benchmark to calculate savings for public HDB/URA lots
  const primaryMall = enriched.find((cp) => cp.isMall && cp.distance <= 0.5)
  const mallCost = primaryMall?.estimatedCost

  if (mallCost && mallCost > 0) {
    return enriched.map((cp) => {
      if (!cp.isMall && cp.estimatedCost !== null && cp.estimatedCost !== undefined) {
        const savings = Number((mallCost - cp.estimatedCost).toFixed(2))
        return {
          ...cp,
          savingsVsNearbyMall: savings >= 1.0 ? savings : null,
        }
      }
      return cp
    })
  }

  return enriched
}

export function mapToCarparkWithDistance(
  ltaCarparks: LtaCarpark[],
  destLat: number,
  destLng: number,
  arrivalDate: Date = new Date(),
  durationMinutes: number = 120,
): CarparkWithDistance[] {
  const withDistance = ltaCarparks
    .map((cp) => ({
      cp,
      dist: haversineDistance(destLat, destLng, cp.lat, cp.lng),
    }))
    .filter((x) => x.dist <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, MAX_RESULTS)

  const mapped: CarparkWithDistance[] = withDistance.map(({ cp, dist }) => ({
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

  return enrichCarparksWithRates(mapped, arrivalDate, durationMinutes)
}
