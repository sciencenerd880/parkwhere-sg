"use client"

import { useEffect, useRef } from "react"
import { useDestinationSearch } from "@/hooks/useDestinationSearch"
import { useNearbyCarparks } from "@/hooks/useNearbyCarparks"
import { useCurrentLocation } from "@/hooks/useCurrentLocation"
import { useParkingStore } from "@/store/useParkingStore"
import { reverseGeocode } from "@/lib/onemap"
import { Input } from "@/components/ui/input"
import { trackEvent } from "@/lib/analytics"
import { Search, Navigation, RotateCcw, MapPin, Loader2 } from "lucide-react"

export default function SearchBar() {
  const { searchQuery, setSearchQuery, destination, isRefreshing, setIsRefreshing } =
    useParkingStore()
  const { suggestions, search, selectResult } = useDestinationSearch()
  const { loadNearbyCarparks } = useNearbyCarparks()
  const { getCurrentLocation, isLocating, error, clearError } =
    useCurrentLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const skipSearchRef = useRef(false)

  const handleSelect = (result: {
    lat: number
    lng: number
    name: string
    address: string
  }) => {
    skipSearchRef.current = true
    setSearchQuery(result.name || result.address)
    selectResult(result)
    trackEvent("search_destination", {
      name: result.name,
      address: result.address,
    })
  }

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }
    search(searchQuery)
  }, [searchQuery, search])

  useEffect(() => {
    if (destination) {
      loadNearbyCarparks()
    }
  }, [destination, loadNearbyCarparks])

  const handleCurrentLocation = async () => {
    clearError()
    const loc = await getCurrentLocation()
    if (!loc) return

    const place = await reverseGeocode(loc.lat, loc.lng)
    const result = place || {
      lat: loc.lat,
      lng: loc.lng,
      name: "My Location",
      address: "Current location",
    }

    skipSearchRef.current = true
    setSearchQuery(result.name)
    selectResult(result)
  }

  const handleRefresh = async () => {
    if (!destination) return
    setIsRefreshing(true)
    await loadNearbyCarparks()
    setIsRefreshing(false)
  }

  useEffect(() => {
    const placeholders = [
      "Search destination or postal code...",
      "e.g. ION Orchard",
      "e.g. Marina Bay Sands",
      "e.g. 238861 (Postal Code)",
      "e.g. Changi Airport T3",
      "e.g. Tampines Mall",
    ]
    let index = 0
    const el = inputRef.current
    if (el) el.placeholder = placeholders[0]
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length
      if (el) el.placeholder = placeholders[index]
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleQueryChange = (value: string) => {
    setSearchQuery(value)
    if (error) clearError()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      handleSelect(suggestions[0])
    }
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search destination or postal code..."
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full h-12 pl-11 pr-12 rounded-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-[14px] font-medium tracking-tight text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-400 transition-all"
          />
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-900 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Use current location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 fill-current" />
            )}
          </button>
        </div>
        {destination && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-neutral-600 hover:text-neutral-900 transition-all disabled:opacity-50 active:scale-95"
            title="Refresh availability"
          >
            <RotateCcw
              className={`h-4 w-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        )}
      </form>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-white text-neutral-800 text-[13px] px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-neutral-200/80 font-medium flex items-start gap-2.5 z-50 animate-in fade-in zoom-in-95">
          <MapPin className="h-4 w-4 text-tesla-blue shrink-0 mt-0.5" />
          <span className="flex-1 leading-snug">{error.message}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-neutral-400 hover:text-neutral-700 shrink-0 text-sm font-semibold"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] z-50 max-h-72 overflow-y-auto border border-neutral-200/80 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Suggested Destinations
          </div>
          {suggestions.map((r, i) => (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.99] transition-all"
              onClick={() => handleSelect(r)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-900 text-[13px] tracking-tight truncate">
                  {r.name || r.address}
                </div>
                {r.name && r.address && (
                  <div className="text-[11px] font-normal text-neutral-500 truncate mt-0.5">
                    {r.address}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
