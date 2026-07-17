"use client"

import { cn } from "@/lib/utils"
import { Clock, MapPin, Navigation } from "lucide-react"
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
    badge: "bg-[#7FB069]/15 text-[#63924F]",
    text: "text-[#63924F]",
  },
  limited: {
    label: "Limited",
    badge: "bg-[#E9C46A]/20 text-[#D4A324]",
    text: "text-[#D4A324]",
  },
  very_limited: {
    label: "Very Limited",
    badge: "bg-[#E76F51]/15 text-[#C94D2C]",
    text: "text-[#C94D2C]",
  },
  full: {
    label: "Full",
    badge: "bg-[#D62828]/10 text-[#C11D1D]",
    text: "text-[#C11D1D]",
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
    <div
      className={cn(
        "relative p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-card-enter group overflow-hidden active:scale-[0.98]",
        isSelected
          ? "bg-blue-50/80 shadow-[0_0_0_2px_#3B82F6]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-neutral-100/50 hover:-translate-y-0.5",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onSelect(carpark)}
    >
      {isSelected && (
        <div className="absolute inset-0 animate-shimmer opacity-50 pointer-events-none" />
      )}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold tracking-tight text-neutral-900 truncate leading-tight mb-1.5">
            {carpark.address}
          </h3>
          
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <div className="flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              <span>{carpark.distance.toFixed(2)} km</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5", config.badge)}>
            {config.label}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold tracking-tight leading-none", config.text)}>
              {carpark.lotsAvailable !== null ? carpark.lotsAvailable : "—"}
            </span>
            {carpark.totalLots !== null ? (
              <span className="text-[14px] font-semibold tracking-tight text-neutral-400/80">
                / {carpark.totalLots}
              </span>
            ) : (
              <span className="text-[11px] font-semibold tracking-tight text-neutral-400 uppercase">
                lots
              </span>
            )}
          </div>
        </div>
      </div>
      
      {carpark.lastUpdated && (
        <div className="relative z-10 mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            Updated {formatTimeAgo(carpark.lastUpdated)}
          </span>
          
          <div className={cn(
            "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-opacity", 
            isSelected ? "opacity-100 text-blue-500" : "opacity-0 group-hover:opacity-100 text-neutral-400"
          )}>
            View on map <Navigation className="h-3 w-3 ml-0.5" />
          </div>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin === 1) return "1 min ago"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHrs = Math.floor(diffMin / 60)
  return `${diffHrs}h ago`
}