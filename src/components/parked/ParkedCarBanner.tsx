"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import { Car, ChevronRight, Clock } from "lucide-react"

function formatElapsed(parkedAt: string): string {
  const diffMs = Date.now() - new Date(parkedAt).getTime()
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMin < 1) return "Just parked"
  if (diffMin === 1) return "1 min ago"
  if (diffMin < 60) return `${diffMin}m ago`
  const hrs = Math.floor(diffMin / 60)
  const remMin = diffMin % 60
  return remMin === 0 ? `${hrs}h ago` : `${hrs}h ${remMin}m ago`
}

function calculateEstimatedHdbFee(parkedAt: string): string {
  const diffMs = Date.now() - new Date(parkedAt).getTime()
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))

  // Grace period in SG is usually 10 mins (or 15 mins)
  if (diffMin <= 10) return "Free (Grace period)"

  // Standard HDB car parking: $0.60 per half-hour ($1.20/hr)
  const halfHourBlocks = Math.ceil(diffMin / 30)
  const fee = (halfHourBlocks * 0.6).toFixed(2)
  return `~$${fee}`
}

export default function ParkedCarBanner() {
  const { parkedCar, setIsParkedPassOpen } = useParkingStore()
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [, setTick] = useState(0)

  // Re-render elapsed time every 30 seconds
  useEffect(() => {
    if (!parkedCar) return
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [parkedCar])

  if (!isClient || !parkedCar) return null

  const elapsed = formatElapsed(parkedCar.parkedAt)
  const estFee = calculateEstimatedHdbFee(parkedCar.parkedAt)

  return (
    <div className="z-30 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
      <button
        type="button"
        onClick={() => setIsParkedPassOpen(true)}
        aria-label="View parked car ticket"
        className={cn(
          "group flex items-center gap-2 md:gap-2.5 px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-full",
          "bg-white/95 backdrop-blur-2xl border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
          "hover:border-blue-300 hover:shadow-[0_12px_36px_rgba(37,99,235,0.18)] active:scale-[0.98] transition-all text-left",
        )}
      >
        {/* Apple Live Activity Style Pulsing Car Icon Pill */}
        <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#007AFF] text-white shadow-xs shrink-0">
          <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-pulse" />
          <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative z-10" />
        </div>

        {/* Mobile Compact Capsule (< sm) */}
        <div className="flex sm:hidden items-center gap-1.5 text-[11px] font-semibold text-neutral-800 pr-0.5">
          {parkedCar.deck ? (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
              {parkedCar.deck}
            </span>
          ) : (
            <span className="text-neutral-700">Parked</span>
          )}
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-900 font-bold">{estFee}</span>
        </div>

        {/* Desktop Detailed Block (>= sm) */}
        <div className="hidden sm:flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-neutral-900 tracking-tight truncate max-w-[150px] md:max-w-[200px]">
              {parkedCar.address}
            </span>
            {parkedCar.deck && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                {parkedCar.deck}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-medium text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-neutral-400" />
              {elapsed}
            </span>
            <span>•</span>
            <span className="font-semibold text-neutral-700">{estFee}</span>
          </div>
        </div>

        {/* Chevron CTA */}
        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 text-neutral-400 flex items-center justify-center shrink-0 transition-colors">
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
        </div>
      </button>
    </div>
  )
}

