"use client"

import { useParkingStore } from "@/store/useParkingStore"
import CarparkCard from "./CarparkCard"
import type { CarparkWithDistance } from "@/types"

function SkeletonCard() {
  return (
    <div className="relative p-4 overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded-md bg-neutral-100" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-md bg-neutral-100" />
            <div className="h-6 w-16 rounded-md bg-neutral-100" />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="h-5 w-16 rounded-full bg-neutral-100" />
          <div className="h-8 w-12 rounded-md bg-neutral-100" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-100">
        <div className="h-3 w-1/4 rounded-md bg-neutral-100" />
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
  } = useParkingStore()

  const handleSelect = (cp: CarparkWithDistance) => {
    setSelectedCarpark(
      cp.carparkNo === selectedCarpark?.carparkNo ? null : cp,
    )
  }

  if (!destination) return null

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (carparks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-card-enter">
        <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-4">
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
            className="text-neutral-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-neutral-600 text-[15px] font-semibold tracking-tight">
          Aiyo, no carparks here lah
        </p>
        <p className="text-neutral-400 text-sm font-medium mt-1">
          Try searching another location
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-[12px] font-semibold tracking-wide uppercase text-neutral-400">
          {carparks.length} Carparks &bull; Nearest First
        </p>
      </div>
      <div className="space-y-2">
        {carparks.map((cp, i) => (
          <CarparkCard
            key={cp.carparkNo}
            carpark={cp}
            index={i}
            isSelected={cp.carparkNo === selectedCarpark?.carparkNo}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}
