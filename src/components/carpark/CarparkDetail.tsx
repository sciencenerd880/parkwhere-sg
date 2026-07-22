"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useParkingStore } from "@/store/useParkingStore"
import { getAvailabilityStatus } from "@/lib/carpark-utils"
import { AppleIcon, GoogleMapsIcon, WazeIcon } from "@/components/icons"
import { ChevronLeft, Clock, Heart, MapPin, Navigation } from "lucide-react"
import HeartAnimation from "./HeartAnimation"

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin === 1) return "1 min ago"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHrs = Math.floor(diffMin / 60)
  return `${diffHrs}h ago`
}

const statusColor: Record<string, string> = {
  healthy: "text-pw-green",
  limited: "text-pw-amber",
  very_limited: "text-pw-orange",
  full: "text-pw-red",
  unknown: "text-neutral-400",
}

export default function CarparkDetail() {
  const { selectedCarpark, setSelectedCarpark, favorites, toggleFavorite } =
    useParkingStore()
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [showHeartAnim, setShowHeartAnim] = useState(false)

  const handleFavouriteToggle = useCallback(() => {
    const isCurrentlyFav = favorites.includes(selectedCarpark?.carparkNo ?? "")
    toggleFavorite(selectedCarpark!.carparkNo)
    if (!isCurrentlyFav) setShowHeartAnim(true)
  }, [favorites, selectedCarpark, toggleFavorite])

  if (!selectedCarpark) return null

  const cp = selectedCarpark
  const status = getAvailabilityStatus(cp.lotsAvailable)
  const isFav = favorites.includes(cp.carparkNo)

  const handleNavigate = (app: "google" | "apple" | "waze") => {
    const { lat, lng } = cp
    let url = ""
    if (app === "google") {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    } else if (app === "apple") {
      url = `https://maps.apple.com/?daddr=${lat},${lng}`
    } else if (app === "waze") {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    }
    window.open(url, "_blank")
    setShowNavMenu(false)
  }

  return (
    <div className="m-3 mb-0 rounded-2xl bg-pw-mint border border-pw-teal/15 p-4 animate-card-enter relative">
      <button
        type="button"
        onClick={() => setSelectedCarpark(null)}
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-pw-teal mb-2 active:scale-95 transition-all"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Selected Car Park
      </button>

      <h2 className="text-[17px] font-bold tracking-tight text-pw-ink leading-tight">
        {cp.address}
      </h2>
      <p className="text-[12px] font-medium text-neutral-500 mt-1 flex items-center gap-1.5">
        <MapPin className="h-3 w-3" />
        {cp.distance.toFixed(2)} km away
        {cp.lastUpdated && (
          <>
            <span className="text-neutral-300">·</span>
            <Clock className="h-3 w-3" />
            Updated {formatTimeAgo(cp.lastUpdated)}
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <span className="px-2 py-0.5 rounded-full bg-white/80 text-pw-teal text-[11px] font-semibold">
          {cp.agency}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mt-3">
        <span
          className={cn(
            "text-[34px] leading-none font-bold tracking-tight",
            statusColor[status],
          )}
        >
          {cp.lotsAvailable !== null ? cp.lotsAvailable : "—"}
        </span>
        {cp.totalLots !== null && (
          <span className="text-[14px] font-semibold text-neutral-400">
            / {cp.totalLots} lots free
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3.5 relative">
        {showNavMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNavMenu(false)}
            />
            <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.14)] border-[0.5px] border-black/5 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => handleNavigate("google")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 active:scale-[0.98] transition-all text-sm font-medium text-neutral-700 w-full text-left"
              >
                <GoogleMapsIcon className="w-5 h-5 text-[#4285F4]" />
                Google Maps
              </button>
              <button
                onClick={() => handleNavigate("apple")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 active:scale-[0.98] transition-all text-sm font-medium text-neutral-700 w-full text-left"
              >
                <AppleIcon className="w-5 h-5 text-black" />
                Apple Maps
              </button>
              <button
                onClick={() => handleNavigate("waze")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 active:scale-[0.98] transition-all text-sm font-medium text-neutral-700 w-full text-left"
              >
                <WazeIcon className="w-5 h-5 text-[#33CCFF]" />
                Waze
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowNavMenu((v) => !v)}
          className="relative overflow-hidden flex-1 h-12 rounded-xl bg-pw-teal text-white text-[15px] font-semibold tracking-tight flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(14,124,107,0.4)] hover:bg-pw-teal-dark active:scale-[0.98] transition-all"
        >
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <Navigation className="relative z-10 h-4 w-4 fill-current" />
          <span className="relative z-10">Navigate Here</span>
        </button>

        <div className="relative h-12 w-12 shrink-0">
          {showHeartAnim && (
            <HeartAnimation onComplete={() => setShowHeartAnim(false)} />
          )}
          <button
            type="button"
            onClick={handleFavouriteToggle}
            aria-label="Save carpark"
            className={cn(
              "h-12 w-12 rounded-xl border flex items-center justify-center transition-all active:scale-90",
              isFav
                ? "bg-pw-teal/10 border-pw-teal/30 text-pw-teal"
                : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-500 hover:border-neutral-300",
            )}
          >
            <Heart
              className={cn("h-5 w-5 transition-all", isFav && "fill-current scale-110")}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
