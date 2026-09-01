"use client"

import { useParkingStore } from "@/store/useParkingStore"
import { filterCarparks } from "@/lib/carpark-utils"
import CarparkCard from "./CarparkCard"
import MapLoadingAnimation from "@/components/map/MapLoadingAnimation"
import type { CarparkWithDistance } from "@/types"

export default function CarparkList({
  excludeCarparkNo,
}: {
  excludeCarparkNo?: string
}) {
  const {
    carparks,
    selectedCarpark,
    setSelectedCarpark,
    destination,
    isLoading,
  } = useParkingStore()

  const handleSelect = (cp: CarparkWithDistance) => {
    setSelectedCarpark(
      cp.carparkNo === selectedCarpark?.carparkNo ? null : cp,
    )
  }

  if (!destination) return null

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MapLoadingAnimation className="h-32 w-32" />
        <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400 -mt-2">
          Retrieving Parking Telemetry...
        </p>
      </div>
    )
  }

  const visible = filterCarparks(carparks).filter(
    (cp) => cp.carparkNo !== excludeCarparkNo,
  )

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-card-enter px-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-neutral-900 text-[14px] font-bold uppercase tracking-wider">
          No Carparks Found
        </p>
        <p className="text-neutral-500 text-xs font-normal mt-1 max-w-[240px]">
          No parking availability reported within this destination vicinity.
        </p>
      </div>
    )
  }

  return (
    <div>
      {visible.map((cp, i) => (
        <CarparkCard
          key={cp.carparkNo}
          carpark={cp}
          index={i}
          isSelected={cp.carparkNo === selectedCarpark?.carparkNo}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
