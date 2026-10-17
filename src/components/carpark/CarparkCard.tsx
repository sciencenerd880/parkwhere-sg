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
  { label: string; badge: string; text: string; dot: string }
> = {
  healthy: {
    label: "Available",
    badge: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    text: "text-neutral-900",
    dot: "bg-emerald-500",
  },
  limited: {
    label: "Filling Fast",
    badge: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  very_limited: {
    label: "Filling Fast",
    badge: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  full: {
    label: "Full",
    badge: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    text: "text-rose-600",
    dot: "bg-rose-500",
  },
  unknown: {
    label: "Unknown",
    badge: "bg-neutral-100 text-neutral-500 border border-neutral-200/50",
    text: "text-neutral-400",
    dot: "bg-neutral-400",
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
        "w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-all duration-150 animate-card-enter border-b border-neutral-100 last:border-b-0 active:scale-[0.99]",
        isSelected
          ? "bg-blue-50/40 relative after:absolute after:left-0 after:top-2 after:bottom-2 after:w-1 after:bg-[#007AFF] after:rounded-r"
          : "bg-white hover:bg-neutral-50/80",
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 truncate leading-snug">
            {carpark.address}
          </h3>
        </div>

        {/* Clean, de-cluttered metadata row: Agency, Distance, and Savings */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 tabular-nums">
            <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
            {carpark.agency && (
              <span className="font-semibold text-neutral-700">{carpark.agency} •</span>
            )}
            <span>{carpark.distance.toFixed(2)} km</span>
          </span>

          {carpark.savingsVsNearbyMall && (
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              Save ${carpark.savingsVsNearbyMall.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Hero Lot Count Badge with live status dot + Price */}
      <div className="flex flex-col items-end shrink-0 pl-2">
        <div
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[12px] font-bold tracking-tight inline-flex items-center gap-1.5 border tabular-nums shadow-2xs",
            config.badge,
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
          <span>
            {carpark.lotsAvailable !== null ? `${carpark.lotsAvailable} lots` : "—"}
          </span>
        </div>

        {carpark.estimatedCost !== undefined && carpark.estimatedCost !== null && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-neutral-600 tracking-tight leading-none tabular-nums">
            <span className="font-semibold text-neutral-900">
              {carpark.estimatedCost === 0 ? (
                <span className="text-emerald-600 font-semibold text-[11px]">Free</span>
              ) : (
                `~$${carpark.estimatedCost.toFixed(2)}`
              )}
            </span>
            {carpark.rateSummary && (
              <>
                <span className="text-neutral-300 font-normal">•</span>
                <span className="text-[11px] text-neutral-500 truncate max-w-[95px]">
                  {carpark.rateSummary}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
