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
    availableNowOnly,
  } = useParkingStore()

  const handleSelect = (cp: CarparkWithDistance) => {
    setSelectedCarpark(
      cp.carparkNo === selectedCarpark?.carparkNo ? null : cp,
    )
  }

  if (!destination) return null

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MapLoadingAnimation className="h-36 w-36" />
        <p className="text-[13px] font-semibold text-neutral-500 -mt-2 tracking-tight">
          Finding nearby carparks...
        </p>
      </div>
    )
  }

  const visible = filterCarparks(carparks, availableNowOnly).filter(
    (cp) => cp.carparkNo !== excludeCarparkNo,
  )

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-card-enter px-6">
        <div className="w-14 h-14 rounded-full bg-pw-mint flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-pw-teal"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-neutral-600 text-[15px] font-semibold tracking-tight">
          {availableNowOnly && carparks.length > 0
            ? "All full right now, sian"
            : "Aiyo, no carparks here lah"}
        </p>
        <p className="text-neutral-400 text-sm font-medium mt-1">
          {availableNowOnly && carparks.length > 0
            ? "Try turning off \"Available now\""
            : "Try searching another location"}
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
