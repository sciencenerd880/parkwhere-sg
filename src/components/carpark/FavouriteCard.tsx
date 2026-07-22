"use client"

import { Heart } from "lucide-react"
import type { CarparkWithDistance } from "@/types"
import { useParkingStore } from "@/store/useParkingStore"

interface FavouriteCardProps {
  carpark: CarparkWithDistance
  onNavigate: (cp: CarparkWithDistance) => void
}

export default function FavouriteCard({
  carpark,
  onNavigate,
}: FavouriteCardProps) {
  const toggleFavorite = useParkingStore((s) => s.toggleFavorite)

  return (
    <button
      type="button"
      onClick={() => onNavigate(carpark)}
      className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] border-b border-neutral-100 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 truncate leading-snug">
          {carpark.address}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-pw-mint/70 text-pw-teal">
            {carpark.agency}
          </span>
          <span className="text-[11px] font-medium text-neutral-400">
            Tap to find parking nearby
          </span>
        </div>
      </div>

      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          toggleFavorite(carpark.carparkNo)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation()
            e.preventDefault()
            toggleFavorite(carpark.carparkNo)
          }
        }}
        aria-label="Remove from favourites"
        className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-pw-teal hover:bg-pw-teal/10 transition-all active:scale-90 cursor-pointer"
      >
        <Heart className="h-4 w-4 fill-current" />
      </span>
    </button>
  )
}
