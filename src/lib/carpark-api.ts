import type { CarparkAvailability } from "@/types"

const AVAILABILITY_URL = "https://api.data.gov.sg/v1/transport/carpark-availability"

export async function fetchCarparkAvailability(): Promise<
  Map<string, CarparkAvailability>
> {
  const res = await fetch(AVAILABILITY_URL)
  if (!res.ok) throw new Error("Failed to fetch carpark availability")

  const data = await res.json()
  const items = data.items?.[0]
  if (!items?.carpark_data) return new Map()

  const map = new Map<string, CarparkAvailability>()

  for (const cp of items.carpark_data) {
    const carInfo = cp.carpark_info?.find(
      (info: { lot_type: string }) => info.lot_type === "C",
    )
    if (carInfo) {
      map.set(cp.carpark_number, {
        carparkNo: cp.carpark_number,
        totalLots: parseInt(carInfo.total_lots, 10),
        lotsAvailable: parseInt(carInfo.lots_available, 10),
        lotType: "C",
        updateDateTime: items.timestamp,
      })
    }
  }

  return map
}
