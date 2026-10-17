"use client"

import { useState, useRef, useEffect } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import { Clock, ChevronDown, Minus, Plus, ArrowRight, X } from "lucide-react"

const PRESET_DURATIONS = [
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
  { label: "4h", value: 240 },
  { label: "6h", value: 360 },
]

function formatDurationDisplay(mins: number): { primary: string; secondary?: string } {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return { primary: `${h}h ${m}m` }
  if (h > 0) return { primary: `${h}h`, secondary: "00m" }
  return { primary: `${m}m` }
}

function formatTimeString(date: Date): string {
  return date.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function calculateEstimatedCost(mins: number): string {
  const halfHourBlocks = Math.ceil(mins / 30)
  return `$${(halfHourBlocks * 0.6).toFixed(2)}`
}

export default function ParkingTimeControls() {
  const {
    destination,
    arrivalTime,
    parkingDurationMinutes,
    setArrivalTime,
    setParkingDurationMinutes,
  } = useParkingStore()

  const [isOpen, setIsOpen] = useState(false)
  const [customTimeVal, setCustomTimeVal] = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  })
  const [isCustomMode, setIsCustomMode] = useState(Boolean(arrivalTime))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!destination) return null

  const effectiveArrivalDate = arrivalTime ? new Date(arrivalTime) : new Date()
  const departureDate = new Date(
    effectiveArrivalDate.getTime() + parkingDurationMinutes * 60 * 1000,
  )

  const handleNowClick = () => {
    setIsCustomMode(false)
    setArrivalTime(null)
  }

  const handleCustomTimeSubmit = (timeStr: string) => {
    setCustomTimeVal(timeStr)
    const [h, m] = timeStr.split(":").map(Number)
    const target = new Date()
    target.setHours(h, m, 0, 0)
    setArrivalTime(target.toISOString())
  }

  const handleStep = (delta: number) => {
    const nextVal = Math.min(720, Math.max(30, parkingDurationMinutes + delta))
    setParkingDurationMinutes(nextVal)
  }

  const durationDisplay = formatDurationDisplay(parkingDurationMinutes)
  const estimatedCost = calculateEstimatedCost(parkingDurationMinutes)

  return (
    <div ref={containerRef} className="relative mt-2 z-30 animate-card-enter">
      {/* Pill and Chips Trigger Container */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Primary Schedule Trigger Pill */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-tight transition-all active:scale-95 shadow-xs border select-none",
            isOpen || arrivalTime
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white/95 backdrop-blur-xl text-neutral-800 border-neutral-200/80 hover:bg-neutral-100",
          )}
        >
          <Clock
            className={cn(
              "h-3.5 w-3.5",
              isOpen || arrivalTime ? "text-white" : "text-neutral-500",
            )}
          />
          <span>
            {arrivalTime ? formatTimeString(effectiveArrivalDate) : "Now"} • {durationDisplay.primary}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 opacity-70 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Quick Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          {PRESET_DURATIONS.map((item) => {
            const isSelected = parkingDurationMinutes === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParkingDurationMinutes(item.value)}
                className={cn(
                  "shrink-0 px-3 py-2 rounded-full text-[12px] font-semibold transition-all active:scale-95 border shadow-2xs",
                  isSelected
                    ? "bg-[#007AFF] text-white border-[#007AFF]"
                    : "bg-white/95 backdrop-blur-md text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Unified Cupertino Popover Sheet */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-[360px] bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-black/5 p-4 z-50 animate-in zoom-in-95 fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#007AFF] flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-bold text-neutral-900 tracking-tight">
                Parking Duration & Schedule
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Arrival Selection: Segmented Control */}
          <div className="mt-3.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Arrival Time
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/50">
              <button
                type="button"
                onClick={handleNowClick}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95",
                  !isCustomMode
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                Arrive Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true)
                  handleCustomTimeSubmit(customTimeVal)
                }}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95",
                  isCustomMode
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                Custom Time
              </button>
            </div>

            {isCustomMode && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/80 animate-in fade-in duration-150">
                <span className="text-xs font-medium text-neutral-500 flex-1">
                  Arrive at:
                </span>
                <input
                  type="time"
                  value={customTimeVal}
                  onChange={(e) => handleCustomTimeSubmit(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-white border border-neutral-300 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Tactile Duration Stepper Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Target Dwell Duration
              </span>
              <span className="text-[11px] font-semibold text-neutral-500">
                Steps: ±30 mins
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStep(-30)}
                disabled={parkingDurationMinutes <= 30}
                aria-label="Decrease 30 minutes"
                className="w-11 h-11 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 text-center py-1">
                <div className="text-[26px] font-extrabold tracking-tight text-neutral-900 leading-none tabular-nums">
                  {durationDisplay.primary}
                </div>
                <div className="text-[10px] font-medium text-neutral-400 mt-0.5">
                  {parkingDurationMinutes / 30} × 30-min blocks
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStep(30)}
                disabled={parkingDurationMinutes >= 720}
                aria-label="Increase 30 minutes"
                className="w-11 h-11 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Chips Inside Stepper */}
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-neutral-200/60 justify-center">
              {PRESET_DURATIONS.map((item) => {
                const isSelected = parkingDurationMinutes === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setParkingDurationMinutes(item.value)}
                    className={cn(
                      "flex-1 py-1 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-600 border-neutral-200/70 hover:bg-neutral-100",
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Unified Inset Summary Card */}
          <div className="mt-3 rounded-xl bg-white border border-neutral-200/80 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">Timeline:</span>
              <span className="font-semibold text-neutral-800 flex items-center gap-1">
                <span>{formatTimeString(effectiveArrivalDate)}</span>
                <span className="text-neutral-300">→</span>
                <strong className="text-[#007AFF] font-bold">
                  {formatTimeString(departureDate)}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
              <span className="text-neutral-500 font-medium">Rate baseline:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px]">HDB ($1.20/hr)</span>
                <span className="font-extrabold text-neutral-900 text-[13px]">
                  ~{estimatedCost}
                </span>
              </div>
            </div>
          </div>

          {/* High-Impact Unified Primary CTA Button with Timing */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3.5 w-full h-12 rounded-2xl bg-[#007AFF] hover:bg-[#0056C6] text-white font-semibold text-[13px] shadow-[0_4px_16px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Apply Schedule • Depart by {formatTimeString(departureDate)}</span>
            <ArrowRight className="h-4 w-4 opacity-90" />
          </button>
        </div>
      )}
    </div>
  )
}
