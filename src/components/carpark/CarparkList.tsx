"use client"

import { useParkingStore } from "@/store/useParkingStore"
import { filterCarparks } from "@/lib/carpark-utils"
import CarparkCard from "./CarparkCard"
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
      <div className="flex flex-col gap-2 p-3 animate-in fade-in duration-200">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 flex items-center justify-between gap-3 animate-pulse"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200/80 rounded-md w-3/4" />
              <div className="flex items-center gap-2">
                <div className="h-3 bg-neutral-200/70 rounded w-16" />
                <div className="h-3 bg-neutral-200/70 rounded w-12" />
              </div>
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <div className="h-5 bg-neutral-200/80 rounded w-10" />
              <div className="h-3 bg-neutral-200/70 rounded w-14" />
            </div>
          </div>
        ))}
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
