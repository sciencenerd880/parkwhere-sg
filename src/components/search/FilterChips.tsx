"use client"

import { cn } from "@/lib/utils"
import { useParkingStore } from "@/store/useParkingStore"

export default function FilterChips() {
  const { availableNowOnly, toggleAvailableNow } = useParkingStore()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleAvailableNow}
        className={cn(
          "px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-tight transition-all active:scale-95 border",
          availableNowOnly
            ? "bg-pw-teal text-white border-pw-teal shadow-[0_4px_14px_rgba(14,124,107,0.35)]"
            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
        )}
      >
        Available now
      </button>
    </div>
  )
}
