"use client"

import { useState, useRef, useEffect } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import { Clock, ChevronDown, Check, X } from "lucide-react"

const QUICK_DURATIONS = [
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
  { label: "4h", value: 240 },
]

const DURATION_STEPS = [
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
  { label: "2.5h", value: 150 },
  { label: "3h", value: 180 },
  { label: "4h", value: 240 },
  { label: "5h", value: 300 },
  { label: "6h", value: 360 },
  { label: "8h", value: 480 },
]

function formatDurationLabel(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function formatTimeString(date: Date): string {
  return date.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
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

  return (
    <div ref={containerRef} className="relative mt-2 z-30 animate-card-enter">
      {/* Pill and Chips Container */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Primary Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm border select-none",
            isOpen || arrivalTime
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white/95 text-neutral-800 border-neutral-200/80 hover:bg-neutral-100",
          )}
        >
          <Clock
            className={cn(
              "h-3.5 w-3.5",
              isOpen || arrivalTime ? "text-white" : "text-neutral-500",
            )}
          />
          <span>
            {arrivalTime ? formatTimeString(effectiveArrivalDate) : "Now"}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 opacity-70 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Quick Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
          {QUICK_DURATIONS.map((item) => {
            const isSelected = parkingDurationMinutes === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setParkingDurationMinutes(item.value)}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white/95 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Floating Anchored Tesla-style Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-[360px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-neutral-200/80 p-4 z-50 animate-in zoom-in-95 fade-in duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-neutral-900 tracking-tight">
                  Parking Duration & Schedule
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Arrival Selection Segment */}
          <div className="mt-3">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">
              Arrival Time
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={handleNowClick}
                className={cn(
                  "py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                  !isCustomMode
                    ? "bg-white text-neutral-900 shadow-sm"
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
                  "py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                  isCustomMode
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                Custom Time
              </button>
            </div>

            {isCustomMode && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex-1">
                  Time:
                </span>
                <input
                  type="time"
                  value={customTimeVal}
                  onChange={(e) => handleCustomTimeSubmit(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-white border border-neutral-300 text-[13px] font-bold text-neutral-900 tracking-tight focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            )}
          </div>

          {/* Dwell Duration Selection */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Duration
              </label>
              <span className="text-[12px] font-bold text-neutral-900">
                {formatDurationLabel(parkingDurationMinutes)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {DURATION_STEPS.map((step) => {
                const isSelected = parkingDurationMinutes === step.value
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => setParkingDurationMinutes(step.value)}
                    className={cn(
                      "py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-neutral-50 text-neutral-700 border-neutral-200/60 hover:bg-neutral-100",
                    )}
                  >
                    {step.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stay Summary Window */}
          <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tesla-blue" />
              <span className="text-[11px] font-semibold text-neutral-700">
                {formatTimeString(effectiveArrivalDate)} &rarr;{" "}
                {formatTimeString(departureDate)}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              {formatDurationLabel(parkingDurationMinutes)}
            </span>
          </div>

          {/* Apply Action */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full py-2.5 rounded-xl bg-neutral-900 text-white text-[12px] font-bold uppercase tracking-wider shadow-sm hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </button>
        </div>
      )}
    </div>
  )
}
