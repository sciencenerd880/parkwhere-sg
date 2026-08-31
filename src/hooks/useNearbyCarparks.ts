import { useCallback } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { fetchAllLtaCarparks } from "@/lib/lta-api"
import { mapToCarparkWithDistance } from "@/lib/carpark-utils"

export function useNearbyCarparks() {
  const {
    destination,
    arrivalTime,
    parkingDurationMinutes,
    setCarparks,
    setIsLoading,
    setError,
    setSelectedCarpark,
  } = useParkingStore()

  const loadNearbyCarparks = useCallback(async () => {
    if (!destination) return

    setIsLoading(true)
    setError(null)
    setSelectedCarpark(null)

    try {
      const allCarparks = await fetchAllLtaCarparks()
      const arrDate = arrivalTime ? new Date(arrivalTime) : new Date()
      const nearby = mapToCarparkWithDistance(
        allCarparks,
        destination.lat,
        destination.lng,
        arrDate,
        parkingDurationMinutes,
      )
      setCarparks(nearby)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load parking data",
      )
      setCarparks([])
    } finally {
      setIsLoading(false)
    }
  }, [
    destination,
    arrivalTime,
    parkingDurationMinutes,
    setCarparks,
    setIsLoading,
    setError,
    setSelectedCarpark,
  ])

  return { loadNearbyCarparks }
}
