import { Navigation } from "lucide-react"
import { useParkingStore } from "@/store/useParkingStore"

const QUICK_DESTINATIONS = ["Orchard Road", "Marina Bay", "Jewel Changi"]

export default function MapTip() {
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery)

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <Navigation className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
        Quick:
      </span>
      <div className="flex items-center gap-1.5">
        {QUICK_DESTINATIONS.map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => setSearchQuery(dest)}
            className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100/80 hover:bg-neutral-200/80 px-2 py-0.5 rounded-full transition-all active:scale-95"
          >
            {dest}
          </button>
        ))}
      </div>
    </div>
  )
}
