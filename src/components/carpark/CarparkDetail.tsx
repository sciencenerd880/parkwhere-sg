"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useParkingStore } from "@/store/useParkingStore"
import { getAvailabilityStatus } from "@/lib/carpark-utils"
import { AppleIcon, GoogleMapsIcon, WazeIcon } from "@/components/icons"
import { Car, ChevronLeft, Clock, Heart, MapPin, Navigation } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
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
  healthy: "text-neutral-900",
  limited: "text-amber-600",
  very_limited: "text-orange-600",
  full: "text-red-600",
  unknown: "text-neutral-400",
}

export default function CarparkDetail() {
  const {
    selectedCarpark,
    setSelectedCarpark,
    favorites,
    toggleFavorite,
    parkedCar,
    setIsParkedCaptureOpen,
    setIsParkedPassOpen,
  } = useParkingStore()
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [showHeartAnim, setShowHeartAnim] = useState(false)

  const handleFavouriteToggle = useCallback(() => {
    const isCurrentlyFav = favorites.includes(selectedCarpark?.carparkNo ?? "")
    toggleFavorite(selectedCarpark!.carparkNo)
    if (!isCurrentlyFav) setShowHeartAnim(true)
    trackEvent("favorite_toggled", {
      carparkNo: selectedCarpark?.carparkNo,
      action: isCurrentlyFav ? "remove" : "add",
    })
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
    trackEvent("navigate_clicked", {
      carparkNo: cp.carparkNo,
      agency: cp.agency,
      app,
    })
    window.open(url, "_blank")
    setShowNavMenu(false)
  }

  return (
    <div className="m-3 mb-0 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 animate-card-enter relative">
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={() => setSelectedCarpark(null)}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to list
        </button>

        <div className="flex items-center gap-1.5">
          {cp.agency && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200/60">
              {cp.agency}
            </span>
          )}
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {cp.distance.toFixed(2)} km
          </span>
        </div>
      </div>

      <h2 className="text-[16px] font-bold tracking-tight text-neutral-900 leading-snug">
        {cp.address}
      </h2>

      {cp.lastUpdated && (
        <p className="text-[11px] font-medium text-neutral-400 mt-1 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Updated {formatTimeAgo(cp.lastUpdated)}
        </p>
      )}

      {/* Supercharger-style Telemetry Metric */}
      <div className="mt-3.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
            Available Spots
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-[32px] leading-none font-black tracking-tight",
                statusColor[status],
              )}
            >
              {cp.lotsAvailable !== null ? cp.lotsAvailable : "—"}
            </span>
            {cp.totalLots !== null && (
              <span className="text-[13px] font-semibold text-neutral-400">
                / {cp.totalLots} total
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
              status === "healthy" && "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
              status === "limited" && "bg-amber-500/10 text-amber-700 border border-amber-500/20",
              status === "very_limited" && "bg-orange-500/10 text-orange-700 border border-orange-500/20",
              status === "full" && "bg-red-500/10 text-red-700 border border-red-500/20",
              status === "unknown" && "bg-neutral-100 text-neutral-500",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                status === "healthy" && "bg-emerald-500",
                status === "limited" && "bg-amber-500",
                status === "very_limited" && "bg-orange-500",
                status === "full" && "bg-red-500",
                status === "unknown" && "bg-neutral-400",
              )}
            />
            {status === "healthy" ? "Available" : status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Pricing and Rates Breakdown Card */}
      {cp.estimatedCost !== undefined && cp.estimatedCost !== null && (
        <div className="mt-3 p-3.5 rounded-xl bg-white border border-neutral-200/70 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Estimated Parking Rate
              </span>
              {cp.isMall && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60">
                  Mall
                </span>
              )}
            </div>
            <span className="text-[16px] font-black text-neutral-900 tracking-tight">
              {cp.estimatedCost === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                `~$${cp.estimatedCost.toFixed(2)}`
              )}
            </span>
          </div>

          {cp.rateBreakdown && cp.rateBreakdown.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-col gap-1">
              {cp.rateBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center text-[11px] font-medium text-neutral-600 leading-tight"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mr-2 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}

          {cp.remarks && (
            <div className="mt-2 pt-2 border-t border-neutral-100 text-[11px] font-medium text-neutral-500 leading-normal">
              ℹ️ {cp.remarks}
            </div>
          )}
        </div>
      )}

      {/* Navigation & Favorite Action Buttons */}
      <div className="flex flex-col gap-2 mt-3.5">
        <div className="flex items-center gap-2 relative">
          {showNavMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNavMenu(false)}
              />
              <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-neutral-200/80 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Choose Navigation App
                </div>
                <button
                  onClick={() => handleNavigate("google")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.98] transition-all text-sm font-semibold text-neutral-800 w-full text-left"
                >
                  <GoogleMapsIcon className="w-5 h-5 text-[#4285F4]" />
                  Google Maps
                </button>
                <button
                  onClick={() => handleNavigate("apple")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.98] transition-all text-sm font-semibold text-neutral-800 w-full text-left"
                >
                  <AppleIcon className="w-5 h-5 text-black" />
                  Apple Maps
                </button>
                <button
                  onClick={() => handleNavigate("waze")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.98] transition-all text-sm font-semibold text-neutral-800 w-full text-left"
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
            className="relative overflow-hidden flex-1 h-12 rounded-xl bg-tesla-blue text-white text-[14px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(62,106,225,0.3)] hover:bg-tesla-blue-hover active:scale-[0.98] transition-all"
          >
            <Navigation className="h-4 w-4 fill-current" />
            <span>Start Navigation</span>
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
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-neutral-50 border-neutral-200/80 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100",
              )}
            >
              <Heart
                className={cn("h-5 w-5 transition-all", isFav && "fill-current scale-110")}
              />
            </button>
          </div>
        </div>

        {/* Parked Car 1-Tap Trigger */}
        <button
          type="button"
          onClick={() => {
            if (parkedCar?.carparkNo === cp.carparkNo) {
              setIsParkedPassOpen(true)
            } else {
              setIsParkedCaptureOpen(true)
            }
          }}
          className={cn(
            "w-full h-11 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-[0.98]",
            parkedCar?.carparkNo === cp.carparkNo
              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/70"
              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-800",
          )}
        >
          <Car className="w-4 h-4 text-blue-600" />
          <span>
            {parkedCar?.carparkNo === cp.carparkNo
              ? `Car Parked Here ${parkedCar.deck ? `(${parkedCar.deck})` : ""} · View Pass`
              : "I'm Parked Here"}
          </span>
        </button>
      </div>
    </div>
  )
}
