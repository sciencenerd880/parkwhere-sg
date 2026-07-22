"use client"

import { useEffect, useRef } from "react"
import { useDestinationSearch } from "@/hooks/useDestinationSearch"
import { useNearbyCarparks } from "@/hooks/useNearbyCarparks"
import { useCurrentLocation } from "@/hooks/useCurrentLocation"
import { useParkingStore } from "@/store/useParkingStore"
import { reverseGeocode } from "@/lib/onemap"
import { Input } from "@/components/ui/input"
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
      "Where you going ah?",
      "e.g. ION Orchard",
      "e.g. 238861 (postal code)",
      "e.g. Orchard Road",
      "Block, building, all can!",
    ]
    let index = 0
    const el = inputRef.current
    if (el) el.placeholder = placeholders[0]
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length
      if (el) el.placeholder = placeholders[index]
    }, 2500)
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
        className="relative flex items-center gap-2.5"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-pw-teal transition-colors" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Where you going ah?"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full h-13 pl-12 pr-13 rounded-2xl bg-white border-[0.5px] border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-[15px] font-medium tracking-tight text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-4 focus-visible:ring-pw-teal/15 focus-visible:border-pw-teal/40 transition-all"
          />
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-pw-mint text-pw-teal hover:bg-pw-teal hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="shrink-0 h-13 w-13 flex items-center justify-center rounded-2xl bg-white border-[0.5px] border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-neutral-500 hover:text-pw-teal transition-all disabled:opacity-50 active:scale-95"
            title="Refresh availability"
          >
            <RotateCcw
              className={`h-5 w-5 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        )}
      </form>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white text-neutral-700 text-[13px] px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-[0.5px] border-black/5 font-medium flex items-start gap-2 z-50">
          <MapPin className="h-4 w-4 text-pw-teal shrink-0 mt-0.5" />
          <span className="flex-1">{error.message}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-neutral-400 hover:text-neutral-600 shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] z-50 max-h-72 overflow-y-auto border-[0.5px] border-black/5 p-1.5">
          {suggestions.map((r, i) => (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-3 text-left px-3.5 py-3 rounded-xl hover:bg-pw-mint/60 active:scale-[0.99] transition-all"
              onClick={() => handleSelect(r)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pw-mint flex items-center justify-center">
                <MapPin className="h-4 w-4 text-pw-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-900 text-[14px] tracking-tight truncate">
                  {r.name || r.address}
                </div>
                {r.name && r.address && (
                  <div className="text-[12px] font-medium text-neutral-500 truncate mt-0.5">
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
