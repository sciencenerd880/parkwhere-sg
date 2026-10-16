"use client"

import { useState, useEffect, useRef } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { filterCarparks } from "@/lib/carpark-utils"
import MapView from "@/components/map/MapView"
import MapTip from "@/components/map/MapTip"
import SearchBar from "@/components/search/SearchBar"
import ParkingTimeControls from "@/components/search/ParkingTimeControls"
import LocationBanner from "@/components/search/LocationBanner"
import CarparkList from "@/components/carpark/CarparkList"
import CarparkDetail from "@/components/carpark/CarparkDetail"
import FavouriteList from "@/components/carpark/FavouriteList"
import AuthButton from "@/components/auth/AuthButton"
import OnboardingModal from "@/components/onboarding/OnboardingModal"
import ParkedCarBanner from "@/components/parked/ParkedCarBanner"
import ParkedCarCaptureModal from "@/components/parked/ParkedCarCaptureModal"
import ParkedCarPassModal from "@/components/parked/ParkedCarPassModal"
import { useAuthStore } from "@/store/useAuthStore"
import { RadarTelemetryIcon, ParkWhereAppIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { ChevronUp } from "lucide-react"

function Logo() {
  const clearDestination = useParkingStore((s) => s.clearDestination)
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery)

  const handleClick = () => {
    clearDestination()
    setSearchQuery("")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go home"
      className="flex items-center gap-2 active:scale-95 transition-all"
    >
      <ParkWhereAppIcon className="h-6 w-6 shrink-0 shadow-sm" />
      <span className="text-[16px] font-black tracking-widest text-neutral-900 uppercase flex items-center gap-1.5">
        PARKWHERE
        <span className="text-[9px] font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded tracking-wider">
          SG
        </span>
      </span>
    </button>
  )
}

function SidebarEmptyState() {
  const { user, isAuthLoading, signInWithGoogle } = useAuthStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <RadarTelemetryIcon className="h-20 w-20 mb-5 animate-radar text-neutral-300" />
      <p className="text-[16px] font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
        Where are you heading?
      </p>
      <p className="text-xs font-normal text-neutral-500 max-w-[240px] leading-relaxed">
        Search any destination or postal code to view real-time parking telemetry.
      </p>
      {!isAuthLoading && !user && (
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="mt-5 text-[11px] font-bold uppercase tracking-wider text-tesla-blue hover:text-tesla-blue-hover active:scale-95 transition-all"
        >
          Sign in to sync saved places
        </button>
      )}
    </div>
  )
}

function PanelHeader({ count }: { count: number }) {
  const clearDestination = useParkingStore((s) => s.clearDestination)
  return (
    <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-neutral-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
        {count} Carparks Telemetry
      </p>
      <button
        type="button"
        onClick={clearDestination}
        className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 active:scale-95 transition-all"
      >
        Clear
      </button>
    </div>
  )
}

export default function Home() {
  const { destination, error, selectedCarpark, carparks, favorites } =
    useParkingStore()
  const [drawerExpanded, setDrawerExpanded] = useState(false)
  const prevSelectedRef = useRef(selectedCarpark)

  useEffect(() => {
    if (selectedCarpark && !prevSelectedRef.current) {
      setDrawerExpanded(false)
    }
    prevSelectedRef.current = selectedCarpark
  }, [selectedCarpark])

  const visibleCount = filterCarparks(carparks).length
  const isPeek = !!selectedCarpark && !drawerExpanded

  return (
    <div className="h-dvh w-full flex flex-col bg-white overflow-hidden">
      <OnboardingModal />
      <ParkedCarCaptureModal />
      <ParkedCarPassModal />
      <header className="h-14 shrink-0 bg-white border-b border-neutral-100 flex items-center justify-between px-4 md:px-5 z-30">
        <Logo />
        <div className="flex items-center gap-2 md:gap-3">
          <ParkedCarBanner />
          <AuthButton />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative min-w-0">
          <div className="absolute inset-0">
            <MapView drawerExpanded={drawerExpanded} />
          </div>

          <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-2xl md:bg-transparent border-b border-neutral-100 md:border-b-0 px-4 py-3 md:p-0 md:top-4 md:left-4 md:right-auto md:w-[400px]">
            <SearchBar />
            <ParkingTimeControls />
            <LocationBanner />
          </div>

          {error && (
            <div className="absolute top-20 left-4 right-4 md:right-auto md:w-[400px] z-20 bg-white text-neutral-700 text-xs px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-neutral-200/80 text-center font-medium">
              {error}
            </div>
          )}

          {!destination && !error && (
            <div className="md:hidden absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4">
              <div className="w-full max-w-xs px-6 py-6 rounded-3xl bg-white/90 backdrop-blur-2xl border border-neutral-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] text-center">
                <RadarTelemetryIcon className="h-16 w-16 mx-auto mb-3 animate-radar text-neutral-400" />
                <p className="text-[15px] font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Where are you heading?
                </p>
                <p className="text-xs font-normal text-neutral-500 max-w-xs mx-auto leading-relaxed">
                  Search destination to view real-time parking telemetry.
                </p>
              </div>
            </div>
          )}

          {!destination && favorites.length > 0 && (
            <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
              <div className="bg-white rounded-[28px] shadow-[0_12px_48px_rgba(0,0,0,0.14)] overflow-hidden border-[0.5px] border-black/5 max-h-[26vh] flex flex-col">
                <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1.5 rounded-full bg-neutral-300/80" />
                </div>
                <FavouriteList />
              </div>
            </div>
          )}

          {!destination && (
            <div className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
              <MapTip />
            </div>
          )}

          {destination && (
            <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
              <div
                data-testid="carpark-panel"
                className={cn(
                  "bg-white rounded-[28px] shadow-[0_12px_48px_rgba(0,0,0,0.14)] overflow-hidden border-[0.5px] border-black/5 flex flex-col transition-[max-height] duration-300 ease-out",
                  isPeek
                    ? "max-h-[36vh]"
                    : drawerExpanded
                      ? "max-h-[78vh]"
                      : "max-h-[46vh]",
                )}
              >
                {isPeek ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDrawerExpanded(true)}
                      className="flex items-center justify-center gap-1 py-2.5 shrink-0 text-neutral-800 text-[12px] font-bold uppercase tracking-wider w-full active:scale-95 transition-all"
                    >
                      <span>Show All Carparks</span>
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-2">
                      <CarparkDetail />
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDrawerExpanded((v) => !v)}
                      className="flex items-center justify-center pt-3 pb-1.5 shrink-0 active:scale-95 transition-all"
                    >
                      <div className="w-10 h-1.5 rounded-full bg-neutral-300/80" />
                    </button>
                    <PanelHeader count={visibleCount} />
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                      {drawerExpanded && selectedCarpark && (
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                          <CarparkDetail />
                        </div>
                      )}
                      <CarparkList
                        excludeCarparkNo={
                          drawerExpanded ? selectedCarpark?.carparkNo : undefined
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="hidden md:flex w-[400px] shrink-0 border-l border-neutral-100 bg-white flex-col z-20">
          {!destination ? (
            <>
              <FavouriteList />
              {favorites.length === 0 && <SidebarEmptyState />}
            </>
          ) : (
            <div className="flex flex-col flex-1 min-h-0" data-testid="carpark-panel">
              <PanelHeader count={visibleCount} />
              {selectedCarpark && <CarparkDetail />}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <CarparkList />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
