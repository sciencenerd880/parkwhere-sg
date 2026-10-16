"use client"

import { useState, useEffect } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { AppleIcon, GoogleMapsIcon } from "@/components/icons"
import {
  Clock,
  Footprints,
  MapPin,
  Share2,
  Trash2,
  X,
  Check,
  ChevronDown,
} from "lucide-react"

function formatFullTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function formatElapsed(parkedAt: string): string {
  const diffMs = Date.now() - new Date(parkedAt).getTime()
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMin < 1) return "Just parked"
  if (diffMin === 1) return "1 min ago"
  if (diffMin < 60) return `${diffMin} mins ago`
  const hrs = Math.floor(diffMin / 60)
  const remMin = diffMin % 60
  return remMin === 0 ? `${hrs}h ago` : `${hrs}h ${remMin}m ago`
}

function calculateEstimatedHdbFee(parkedAt: string): { fee: string; note: string } {
  const diffMs = Date.now() - new Date(parkedAt).getTime()
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMin <= 10) {
    return { fee: "Free", note: "Within 10-min grace period" }
  }

  const halfHourBlocks = Math.ceil(diffMin / 30)
  const fee = (halfHourBlocks * 0.6).toFixed(2)
  return {
    fee: `$${fee}`,
    note: `$0.60 per 30 mins (${halfHourBlocks} blocks)`,
  }
}

export default function ParkedCarPassModal() {
  const { parkedCar, isParkedPassOpen, setIsParkedPassOpen, clearParkedCar } =
    useParkingStore()
  const [showPhotoFullscreen, setShowPhotoFullscreen] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [showNavOptions, setShowNavOptions] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!isParkedPassOpen || !parkedCar) return
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [isParkedPassOpen, parkedCar])

  if (!isParkedPassOpen || !parkedCar) return null

  const elapsed = formatElapsed(parkedCar.parkedAt)
  const fullTime = formatFullTime(parkedCar.parkedAt)
  const { fee, note } = calculateEstimatedHdbFee(parkedCar.parkedAt)

  const handleWalk = (app: "google" | "apple") => {
    const { lat, lng } = parkedCar
    let url = ""
    if (app === "google") {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
    } else {
      url = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
    }
    window.open(url, "_blank")
    setShowNavOptions(false)
  }

  const handleShare = async () => {
    const text = `🚗 I parked my car at ${parkedCar.address}${
      parkedCar.deck ? ` (${parkedCar.deck})` : ""
    }${parkedCar.lotNumber ? `, Lot: ${parkedCar.lotNumber}` : ""}.\nLocation: https://maps.google.com/?q=${parkedCar.lat},${parkedCar.lng}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Parked Car Location",
          text,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    } catch {
      // Ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsParkedPassOpen(false)}
      />

      {/* Pass Ticket Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="parked-pass-title"
        className="relative w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] border-[0.5px] border-black/5 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in slide-in-from-bottom duration-300"
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="md:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Apple Wallet Style Top Banner */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppleIcon className="w-4 h-4 fill-white" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-300">
              PARKWHERE PASS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsParkedPassOpen(false)}
            aria-label="Close pass"
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pass Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Hero Duration Header */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                Parked Duration
              </span>
              <h2
                id="parked-pass-title"
                className="text-[24px] font-black tracking-tight text-neutral-900 leading-none"
              >
                {elapsed}
              </h2>
              <p className="text-[11px] font-medium text-neutral-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Since {fullTime}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                Est. Fee
              </span>
              <span className="text-[24px] font-black tracking-tight text-blue-600 leading-none">
                {fee}
              </span>
              <p className="text-[10px] font-semibold text-neutral-400 mt-1">
                {note}
              </p>
            </div>
          </div>

          {/* Carpark Location Card */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Location
              </span>
              {parkedCar.agency && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200/60 uppercase">
                  {parkedCar.agency} MSCP
                </span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-neutral-900 leading-snug">
                  {parkedCar.address}
                </p>
                <p className="text-[11px] font-medium text-neutral-400">
                  Code: {parkedCar.carparkNo}
                </p>
              </div>
            </div>
          </div>

          {/* Micro-Location Badges: Deck & Lot Number */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block mb-0.5">
                Deck / Floor
              </span>
              <span className="text-[18px] font-black text-blue-900 tracking-tight">
                {parkedCar.deck ? `Deck ${parkedCar.deck}` : "Not specified"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                Pillar / Lot
              </span>
              <span className="text-[16px] font-black text-neutral-800 tracking-tight truncate">
                {parkedCar.lotNumber || "Not recorded"}
              </span>
            </div>
          </div>

          {/* Photo Preview if Taken */}
          {parkedCar.photoUrl && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Pillar / Lot Photo
                </span>
                <span className="text-[10px] font-medium text-neutral-400">
                  Tap to expand
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoFullscreen(true)}
                className="w-full relative rounded-2xl overflow-hidden border border-neutral-200/80 aspect-video bg-neutral-900 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={parkedCar.photoUrl}
                  alt="Parked lot pillar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1.5 rounded-full bg-white/90 text-neutral-900 text-xs font-bold shadow-md">
                    View Fullscreen
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 flex flex-col gap-2">
          {/* Walk Back Primary CTA */}
          <div className="relative">
            {showNavOptions && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNavOptions(false)}
                />
                <div className="absolute bottom-full mb-2 left-0 right-0 z-40 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] border border-neutral-200/80 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Choose Walking App
                  </div>
                  <button
                    onClick={() => handleWalk("google")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.98] transition-all text-xs font-bold text-neutral-800 w-full text-left"
                  >
                    <GoogleMapsIcon className="w-4 h-4 text-[#4285F4]" />
                    Google Maps (Walking)
                  </button>
                  <button
                    onClick={() => handleWalk("apple")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.98] transition-all text-xs font-bold text-neutral-800 w-full text-left"
                  >
                    <AppleIcon className="w-4 h-4 fill-black" />
                    Apple Maps (Walking)
                  </button>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowNavOptions((v) => !v)}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all"
            >
              <Footprints className="w-4 h-4" />
              <span>Walk Back to Car</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Secondary Row: Share & End Parking */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 h-10 rounded-xl bg-white border border-neutral-200/90 hover:bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Spot</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearParkedCar}
              className="flex-1 h-10 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-600 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-neutral-200/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>End Parking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {showPhotoFullscreen && parkedCar.photoUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPhotoFullscreen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-neutral-800"
            onClick={() => setShowPhotoFullscreen(false)}
            aria-label="Close photo"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={parkedCar.photoUrl}
            alt="Pillar Fullscreen"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  )
}
