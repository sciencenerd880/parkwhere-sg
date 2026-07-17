import { useCallback } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { fetchCarparkAvailability } from "@/lib/carpark-api"
import { findNearbyCarparks, mergeAvailability } from "@/lib/carpark-utils"
import hdbCarparks from "@/data/hdb-carparks.json"

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
      const nearby = findNearbyCarparks(
        hdbCarparks,
        destination.lat,
        destination.lng,
      )

      if (nearby.length === 0) {
        setCarparks([])
        setIsLoading(false)
        return
      }

      const availabilityMap = await fetchCarparkAvailability()
      const merged = mergeAvailability(
        nearby,
        availabilityMap,
        destination.lat,
        destination.lng,
      )

      setCarparks(merged)
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
