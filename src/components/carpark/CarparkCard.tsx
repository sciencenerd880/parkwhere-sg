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
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 truncate leading-snug">
            {carpark.address}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-1">
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
          {carpark.isMall && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60">
              Mall
            </span>
          )}
          {carpark.savingsVsNearbyMall && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight bg-emerald-100/80 text-emerald-800 border border-emerald-300/60">
              💡 Save ${carpark.savingsVsNearbyMall.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-[18px] leading-none font-bold tracking-tight",
              config.text,
            )}
          >
            {carpark.lotsAvailable !== null ? carpark.lotsAvailable : "—"}
          </span>
          {carpark.totalLots !== null && (
            <span className="text-[10px] font-semibold text-neutral-400">
              /{carpark.totalLots}
            </span>
          )}
        </div>

        {carpark.estimatedCost !== undefined && carpark.estimatedCost !== null && (
          <div className="mt-1 flex flex-col items-end">
            <span className="text-[13px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {carpark.estimatedCost === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                `~$${carpark.estimatedCost.toFixed(2)}`
              )}
            </span>
            {carpark.rateSummary && (
              <span className="text-[10px] font-medium text-neutral-400 mt-0.5 truncate max-w-[90px]">
                {carpark.rateSummary}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
