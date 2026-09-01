"use client"

import { useCurrentLocation } from "@/hooks/useCurrentLocation"
import { useParkingStore } from "@/store/useParkingStore"
import { reverseGeocode } from "@/lib/onemap"
import { Navigation, Loader2 } from "lucide-react"

export default function LocationBanner() {
  const { locationPermission, destination } = useParkingStore()
  const { getCurrentLocation, isLocating } = useCurrentLocation()

  if (locationPermission !== "denied" || destination) return null

  const handleRetry = async () => {
    const loc = await getCurrentLocation()
    if (!loc) return

    const place = await reverseGeocode(loc.lat, loc.lng)
    const result = place || {
      lat: loc.lat,
      lng: loc.lng,
      name: "My Location",
      address: "Current location",
    }

    useParkingStore.getState().setDestination(result)
  }

  return (
    <div className="mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-neutral-200/80 p-4 pointer-events-auto">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
          <Navigation className="h-4 w-4 text-neutral-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-wider text-neutral-900">
            Location Access Required
          </p>
          <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed">
            Enable location services in browser settings to calculate distances to nearby carparks.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isLocating}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 fill-current" />
            )}
            Retry Location Access
          </button>
        </div>
      </div>
    </div>
  )
}
