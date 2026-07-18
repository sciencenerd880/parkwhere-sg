"use client"

import { useParkingStore } from "@/store/useParkingStore"
import { filterCarparks } from "@/lib/carpark-utils"
import CarparkCard from "./CarparkCard"
import type { CarparkWithDistance } from "@/types"

function SkeletonRow() {
  return (
    <div className="relative px-4 py-3.5 flex items-start justify-between gap-3 border-b border-neutral-100 overflow-hidden">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded-md bg-neutral-100" />
        <div className="flex gap-2">
          <div className="h-4 w-14 rounded-md bg-neutral-100" />
          <div className="h-4 w-16 rounded-md bg-neutral-100" />
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1.5">
        <div className="h-6 w-10 rounded-md bg-neutral-100" />
        <div className="h-3 w-8 rounded-md bg-neutral-100" />
      </div>
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
    </div>
  )
}

export default function CarparkList() {
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
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  }

  const visible = filterCarparks(carparks, availableNowOnly)

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
