"use client"

import { useState } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import MapView from "@/components/map/MapView"
import SearchBar from "@/components/search/SearchBar"
import LocationBanner from "@/components/search/LocationBanner"
import CarparkList from "@/components/carpark/CarparkList"
import { Navigation, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppleIcon, GoogleMapsIcon, MascotIcon, WazeIcon } from "@/components/icons"

export default function Home() {
  const { destination, error, selectedCarpark, setSelectedCarpark } =
    useParkingStore()
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [drawerExpanded, setDrawerExpanded] = useState(false)

  const handleNavigate = (app: "google" | "apple" | "waze") => {
    if (!selectedCarpark) return
    const { lat, lng } = selectedCarpark
    
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
    <div className="relative h-dvh w-full overflow-hidden bg-neutral-50">
      <div className="absolute inset-0">
        <MapView drawerExpanded={drawerExpanded} />
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="px-4 pt-4 pb-2 md:w-[420px] pointer-events-auto">
          <div className="flex items-center mb-4 px-1">
            <div className="flex items-center gap-2 bg-white/75 backdrop-blur-3xl rounded-3xl pl-2 pr-3.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-[0.5px] border-black/5">
              <MascotIcon className="h-7 w-7 md:h-8 md:w-8 shrink-0" />
              <span className="text-base md:text-lg font-bold tracking-tight text-neutral-800">
                ParkWhere
              </span>
              <span className="text-[10px] font-semibold text-white bg-emerald-500 px-1.5 py-0.5 rounded-full tracking-wide">
                SG
              </span>
            </div>
          </div>
          <SearchBar />
          <LocationBanner />
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-4 right-4 z-20 bg-white/75 backdrop-blur-3xl text-neutral-600 text-xs px-4 py-3 rounded-2xl shadow-sm border-[0.5px] border-black/5 text-center font-medium">
          {error}
        </div>
      )}

      {!destination && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center px-8 -mt-20">
            <MascotIcon className="h-20 w-20 mx-auto mb-4 animate-pw-bob drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
            <p className="text-lg font-bold tracking-tight text-white mb-1.5">
              Eh, where you parking today?
            </p>
            <p className="text-sm font-medium tracking-wide text-white/70 max-w-xs mx-auto leading-relaxed">
              Key in your destination, I go chope you a lot.
            </p>
          </div>
        </div>
      )}

      {destination && (
        <div className="absolute bottom-4 left-4 right-4 z-20 md:bottom-0 md:left-auto md:right-6 md:top-24 md:w-[400px] md:bottom-6">
          <div
            data-testid="carpark-panel"
            className={cn(
              "bg-white/75 backdrop-blur-3xl rounded-[32px] shadow-[0_12px_48px_rgba(0,0,0,0.12)] overflow-hidden border-[0.5px] border-black/5 md:max-h-none md:h-full flex flex-col transition-[max-height] duration-300 ease-out",
              drawerExpanded ? "max-h-[78vh]" : "max-h-[46vh]",
            )}
          >
            <button
              type="button"
              onClick={() => setDrawerExpanded((v) => !v)}
              className="flex items-center justify-center pt-3 pb-2 shrink-0 md:hidden active:scale-95 transition-all"
            >
              <div className="w-10 h-1.5 rounded-full bg-neutral-300/80" />
            </button>

            {selectedCarpark && (
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-black/5 bg-neutral-50/40">
                <div>
                  <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-tight mb-0.5">
                    Selected Car Park
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-800 tracking-tight truncate max-w-[220px]">
                    {selectedCarpark.address}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCarpark(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-200/60 hover:bg-neutral-300/60 text-neutral-500 active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 md:pb-4 scrollbar-hide">
              <CarparkList />
            </div>
          </div>
        </div>
      )}

      {selectedCarpark && (
        <div
          className={cn(
            "fixed z-30 animate-card-enter flex flex-col items-center md:items-end gap-3",
            "bottom-[52vh] left-1/2 -translate-x-1/2",
            "md:left-auto md:right-[430px] md:bottom-10 md:translate-x-0",
          )}
        >
          {showNavMenu && (
            <>
              {/* Invisible Backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNavMenu(false)}
              />
              <div className="relative z-50 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border-[0.5px] border-black/5 p-2 flex flex-col gap-1 w-48 animate-in fade-in zoom-in-95 duration-200">
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
            onClick={() => setShowNavMenu(!showNavMenu)}
            className="relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-blue-500 text-white text-[15px] font-semibold tracking-tight shadow-[0_8px_32px_rgba(0,122,255,0.4)] hover:bg-blue-600 hover:shadow-[0_12px_40px_rgba(0,122,255,0.5)] active:scale-[0.96] transition-all duration-300 w-full"
          >
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <Navigation className="relative z-10 h-4 w-4 fill-current" />
            <span className="relative z-10">Navigate Here</span>
          </button>
        </div>
      )}
    </div>
  )
}
