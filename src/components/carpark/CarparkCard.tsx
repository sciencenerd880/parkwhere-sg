"use client"

import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"
import type { CarparkWithDistance } from "@/types"
import { getAvailabilityStatus } from "@/lib/carpark-utils"

interface CarparkCardProps {
  carpark: CarparkWithDistance
  isSelected: boolean
  onSelect: (cp: CarparkWithDistance) => void
  index?: number
}

const statusConfig: Record<
  string,
  { label: string; badge: string; text: string }
> = {
  healthy: {
    label: "Available",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
    text: "text-blue-600",
  },
  limited: {
    label: "Limited",
    badge: "bg-amber-50 text-amber-600 border border-amber-200/60",
    text: "text-amber-600",
  },
  very_limited: {
    label: "Very Limited",
    badge: "bg-orange-50 text-orange-600 border border-orange-200/60",
    text: "text-orange-600",
  },
  full: {
    label: "Full",
    badge: "bg-red-50 text-red-600 border border-red-200/60",
    text: "text-red-600",
  },
  unknown: {
    label: "Unknown",
    badge: "bg-neutral-100 text-neutral-500",
    text: "text-neutral-500",
  },
}

export default function CarparkCard({
  carpark,
  isSelected,
  onSelect,
  index = 0,
}: CarparkCardProps) {
  const status = getAvailabilityStatus(carpark.lotsAvailable)
  const config = statusConfig[status]

  return (
    <button
      type="button"
      onClick={() => onSelect(carpark)}
      className={cn(
        "w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 transition-all duration-200 animate-card-enter border-b border-neutral-100 last:border-b-0 active:scale-[0.99]",
        isSelected ? "bg-blue-50/80" : "bg-white hover:bg-neutral-50",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 truncate leading-snug">
          {carpark.address}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <MapPin className="h-3 w-3 text-neutral-400" />
            {carpark.distance.toFixed(2)} km
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
              config.badge,
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            "text-[20px] leading-none font-bold tracking-tight",
            config.text,
          )}
        >
          {carpark.lotsAvailable !== null ? carpark.lotsAvailable : "—"}
        </span>
        {carpark.totalLots !== null && (
          <span className="text-[11px] font-semibold text-neutral-400 mt-0.5">
            / {carpark.totalLots}
          </span>
        )}
      </div>
    </button>
  )
}
