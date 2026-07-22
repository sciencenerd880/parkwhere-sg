import { useCallback } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { fetchAllLtaCarparks } from "@/lib/lta-api"
import { mapToCarparkWithDistance } from "@/lib/carpark-utils"

export function useNearbyCarparks() {
  const {
    destination,
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
      const nearby = mapToCarparkWithDistance(
        allCarparks,
        destination.lat,
        destination.lng,
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
  }, [destination, setCarparks, setIsLoading, setError, setSelectedCarpark])

  return { loadNearbyCarparks }
}
