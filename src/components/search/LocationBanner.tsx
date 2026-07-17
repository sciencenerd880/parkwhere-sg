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
    <div className="mt-3 bg-white/85 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-[0.5px] border-black/5 p-4 pointer-events-auto">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Navigation className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-neutral-900 tracking-tight">
            Location access denied
          </p>
          <p className="text-[13px] text-neutral-600 mt-0.5 leading-relaxed">
            Enable location permissions in your browser settings to find parking near you.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isLocating}
            className="mt-2.5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white text-[13px] font-semibold tracking-tight shadow-[0_4px_16px_rgba(0,122,255,0.3)] hover:bg-blue-600 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5 fill-current" />
            )}
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
