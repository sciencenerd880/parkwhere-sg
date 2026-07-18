"use client"

import { MascotIcon } from "@/components/icons"
import { useParkingStore } from "@/store/useParkingStore"

const TIPS = ["Toa Payoh Central", "Tampines Ave 4"]

export default function MapTip() {
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery)

  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-xl border-[0.5px] border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <MascotIcon className="h-5 w-5 shrink-0" />
      <span className="text-[12px] font-medium text-neutral-500 whitespace-nowrap">
        tip: try{" "}
        {TIPS.map((t, i) => (
          <span key={t}>
            <button
              type="button"
              onClick={() => setSearchQuery(t)}
              className="font-semibold text-pw-teal hover:text-pw-teal-dark hover:underline underline-offset-2 transition-colors"
            >
              &quot;{t}&quot;
            </button>
            {i < TIPS.length - 1 ? " or " : ""}
          </span>
        ))}
      </span>
    </div>
  )
}
