"use client"

import { useState } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import { Clock, ChevronDown, Check, Sparkles, X } from "lucide-react"

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
  if (h > 0) return `${h} hr${h > 1 ? "s" : ""}`
  return `${m} mins`
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
    // If target time is earlier than current time today by > 2 hours, assume next day or today
    setArrivalTime(target.toISOString())
  }

  return (
    <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1 touch-pan-x animate-card-enter">
      {/* Primary Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold tracking-tight transition-all active:scale-95 shadow-sm border select-none",
          isOpen || arrivalTime
            ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20"
            : "bg-white/90 backdrop-blur-2xl text-neutral-800 border-neutral-200/80 hover:bg-neutral-50",
        )}
      >
        <Clock
          className={cn(
            "h-3.5 w-3.5",
            isOpen || arrivalTime ? "text-white" : "text-blue-600",
          )}
        />
        <span>
          {arrivalTime ? formatTimeString(effectiveArrivalDate) : "Now"} &middot;{" "}
          {formatDurationLabel(parkingDurationMinutes)}
        </span>
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>

      {/* Quick Chips */}
      {QUICK_DURATIONS.map((item) => {
        const isSelected = parkingDurationMinutes === item.value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => setParkingDurationMinutes(item.value)}
            className={cn(
              "shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-tight transition-all active:scale-95 border",
              isSelected
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white/80 backdrop-blur-2xl text-neutral-600 border-neutral-200/60 hover:bg-neutral-50 hover:text-neutral-900",
            )}
          >
            {item.label}
          </button>
        )
      })}

      {/* Sheet / Modal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border-[0.5px] border-black/10 p-5 z-10 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-neutral-900 tracking-tight">
                    Parking Duration & Time
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Instant rates calculated for your stay
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Arrival Selection Segment */}
            <div className="mt-4">
              <label className="text-[12px] font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                Arrival Time
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100/80 rounded-2xl">
                <button
                  type="button"
                  onClick={handleNowClick}
                  className={cn(
                    "py-2 rounded-xl text-[13px] font-semibold tracking-tight transition-all",
                    !isCustomMode
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  🚗 Arrive Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(true)
                    handleCustomTimeSubmit(customTimeVal)
                  }}
                  className={cn(
                    "py-2 rounded-xl text-[13px] font-semibold tracking-tight transition-all",
                    isCustomMode
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  🕒 Custom Time
                </button>
              </div>

              {isCustomMode && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[13px] font-medium text-neutral-600 flex-1">
                    Set Arrival:
                  </span>
                  <input
                    type="time"
                    value={customTimeVal}
                    onChange={(e) => handleCustomTimeSubmit(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-[14px] font-bold text-blue-700 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Dwell Duration Selection */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-neutral-700 uppercase tracking-wider">
                  Parking Duration
                </label>
                <span className="text-[13px] font-bold text-blue-600">
                  {formatDurationLabel(parkingDurationMinutes)}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {DURATION_STEPS.map((step) => {
                  const isSelected = parkingDurationMinutes === step.value
                  return (
                    <button
                      key={step.value}
                      type="button"
                      onClick={() => setParkingDurationMinutes(step.value)}
                      className={cn(
                        "py-2 rounded-xl text-[12px] font-semibold tracking-tight transition-all active:scale-95 border",
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
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
            <div className="mt-5 p-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-[12px] font-semibold text-neutral-700">
                  {formatTimeString(effectiveArrivalDate)} &rarr;{" "}
                  {formatTimeString(departureDate)}
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {formatDurationLabel(parkingDurationMinutes)}
              </span>
            </div>

            {/* Apply Action */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full py-3 rounded-2xl bg-blue-600 text-white text-[14px] font-semibold tracking-tight shadow-[0_4px_16px_rgba(29,112,236,0.3)] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
