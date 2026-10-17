"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import {
  Camera,
  X,
  Building2,
  Layers,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
  Car,
} from "lucide-react"

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxDim = 720
        let width = img.width
        let height = img.height

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL("image/jpeg", 0.72)
        resolve(compressed)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ParkedCarCaptureModal() {
  const {
    isParkedCaptureOpen,
    setIsParkedCaptureOpen,
    selectedCarpark,
    setParkedCar,
    carparks,
  } = useParkingStore()

  const [zone, setZone] = useState<"decks" | "basement">("decks")
  const [selectedDeck, setSelectedDeck] = useState<string>("L3")
  const [customDeck, setCustomDeck] = useState<string>("")
  const [lotNumber, setLotNumber] = useState<string>("")
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback to first available carpark if selected is null
  const activeCarpark = selectedCarpark || carparks[0] || null

  const resetForm = () => {
    setZone("decks")
    setSelectedDeck("L3")
    setCustomDeck("")
    setLotNumber("")
    setPhotoDataUrl(null)
    setIsSubmitting(false)
    setIsSuccess(false)
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
  }

  const handleClose = () => {
    resetForm()
    setIsParkedCaptureOpen(false)
  }

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  if (!isParkedCaptureOpen || !activeCarpark) return null

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsCompressing(true)
      const compressed = await compressImage(file)
      setPhotoDataUrl(compressed)
    } catch (err) {
      console.error("Failed to process photo:", err)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleSave = () => {
    if (isSubmitting || isSuccess) return

    setIsSubmitting(true)

    const deck = selectedDeck === "Others"
      ? (customDeck.trim() || "Other")
      : selectedDeck

    // Simulate swift tactile processing before triggering success state
    setTimeout(() => {
      setParkedCar({
        carparkNo: activeCarpark.carparkNo,
        address: activeCarpark.address,
        lat: activeCarpark.lat,
        lng: activeCarpark.lng,
        agency: activeCarpark.agency,
        parkedAt: new Date().toISOString(),
        deck: deck || undefined,
        lotNumber: lotNumber.trim() || undefined,
        photoUrl: photoDataUrl || undefined,
      })

      setIsSubmitting(false)
      setIsSuccess(true)

      // Gentle auto-dismiss after displaying the compact success card (or user taps Done)
      autoCloseTimerRef.current = setTimeout(() => {
        handleClose()
      }, 6000)
    }, 450)
  }

  const currentPills = zone === "decks"
    ? ["L1", "L2", "L3", "L4", "Others"]
    : ["B1", "B2", "B3", "Others"]

  const displayDeckCta = selectedDeck === "Others"
    ? (customDeck.trim() ? customDeck.trim() : "Custom Level")
    : (selectedDeck.startsWith("L")
        ? `Level ${selectedDeck.replace("L", "")}`
        : selectedDeck.startsWith("B")
          ? `Basement ${selectedDeck.replace("B", "")}`
          : selectedDeck)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      {/* Backdrop — Map remains clearly visible behind frosted glass */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-parking-title"
        className="relative w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-[0.5px] border-black/5 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in slide-in-from-bottom duration-300 ease-out"
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="md:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-2">
          <div className="flex-1 text-center pl-7">
            <h2
              id="save-parking-title"
              className="text-[17px] font-bold tracking-tight text-neutral-900 leading-tight"
            >
              {isSuccess ? "Spot Locked In!" : "Save Parking Spot"}
            </h2>
            <p className="text-[12px] font-normal text-neutral-500 truncate max-w-[260px] mx-auto mt-0.5">
              {activeCarpark.address}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Journey Step 5 (Success & Compact Card) vs Steps 1-4 (Capture Form) */}
        {isSuccess ? (
          <div className="px-6 py-6 space-y-5 animate-in zoom-in-95 fade-in duration-250 flex flex-col items-center text-center">
            {/* Animated Celebration Icon */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200/80 shadow-sm animate-in zoom-in-50 duration-300">
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />
              <CheckCircle2 className="w-9 h-9 text-emerald-600 relative z-10" />
            </div>

            <div>
              <h3 className="text-[18px] font-bold text-neutral-900 tracking-tight">
                Parking Spot Saved
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Your spot is saved to your status bar anytime you return.
              </p>
            </div>

            {/* Compact Summary Card */}
            <div className="w-full bg-neutral-50/80 border border-neutral-200/90 rounded-2xl p-4 text-left shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                      {activeCarpark.address}
                    </h4>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      Just now • Timer active
                    </span>
                  </div>
                </div>

                {/* Level Badge */}
                <div className="px-2.5 py-1 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-xs">
                  {displayDeckCta}
                </div>
              </div>

              {/* Pillar / Lot Badge if provided */}
              {lotNumber.trim() && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-white/90 border border-neutral-200/80 px-2.5 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                  <span>Pillar / Lot: <strong className="text-neutral-900 font-bold">{lotNumber.trim()}</strong></span>
                </div>
              )}

              {/* Photo Thumbnail if snapped */}
              {photoDataUrl && (
                <div className="relative rounded-xl overflow-hidden aspect-[21/9] border border-neutral-200 bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoDataUrl}
                    alt="Saved spot snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                    <Camera className="w-3 h-3" />
                    Snapshot saved
                  </div>
                </div>
              )}
            </div>

            {/* Quick Done Action */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-3 space-y-4 overflow-y-auto">
            {/* Step 2: Floor Level Section with True iOS Segmented Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-semibold text-neutral-900">
                  Floor Level
                </label>
                <span className="text-[11px] font-medium text-neutral-400">
                  Selected: <strong className="text-[#007AFF] font-bold">{displayDeckCta}</strong>
                </span>
              </div>

              {/* Refinement 1: iOS Segmented Control (NO AI Slop 'P' Badge!) */}
              <div className="relative flex items-center p-1 rounded-full bg-neutral-100/90 border border-neutral-200/70 w-fit">
                {/* Sliding indicator pill */}
                <div
                  className={cn(
                    "absolute top-1 bottom-1 rounded-full bg-white shadow-xs border border-black/5 transition-all duration-200 ease-out",
                    zone === "decks"
                      ? "left-1 w-[120px]"
                      : "left-[124px] w-[114px]",
                  )}
                />

                <button
                  type="button"
                  onClick={() => {
                    setZone("decks")
                    if (selectedDeck.startsWith("B")) {
                      setSelectedDeck("L3")
                    }
                  }}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 active:scale-95",
                    zone === "decks"
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Upper Decks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZone("basement")
                    if (selectedDeck.startsWith("L")) {
                      setSelectedDeck("B1")
                    }
                  }}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 active:scale-95",
                    zone === "basement"
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Basements</span>
                </button>
              </div>

              {/* Floor Level Pills: L1, L2, L3, L4, Others */}
              <div className="flex items-center gap-2 mt-3">
                {currentPills.map((pill) => {
                  const isSelected = selectedDeck === pill
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        setSelectedDeck(pill)
                        if (pill !== "Others") setCustomDeck("")
                      }}
                      className={cn(
                        "flex-1 py-2 px-1 rounded-2xl text-[13px] font-semibold transition-all duration-150 active:scale-95 border text-center",
                        isSelected
                          ? "bg-[#007AFF] text-white border-[#007AFF] shadow-[0_2px_8px_rgba(0,122,255,0.3)]"
                          : "bg-white text-neutral-800 border-neutral-200/90 hover:bg-neutral-50",
                      )}
                    >
                      {pill}
                    </button>
                  )
                })}
              </div>

              {/* Inline Custom Input when Others selected */}
              {selectedDeck === "Others" && (
                <div className="mt-2.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] font-medium text-neutral-500 shrink-0">Other level:</span>
                  <input
                    type="text"
                    placeholder="e.g. Roof, L5, B4, Mezzanine"
                    value={customDeck}
                    onChange={(e) => setCustomDeck(e.target.value)}
                    autoFocus
                    className="flex-1 h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Refinement 2 — Semantic Landmark Input (Blue MapPin, NOT Search Glass!) */}
            <div>
              <div className="relative group">
                <MapPin className="w-4 h-4 text-[#007AFF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:scale-110" />
                <input
                  type="text"
                  placeholder="Pillar or Lot Number (e.g. 3A-142)"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200/90 bg-white text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Step 3: Refinement 3 — Active Camera Viewfinder Tile (Replaces 2012 Dashed Uploader) */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {photoDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs aspect-[16/9] bg-neutral-900 flex items-center justify-center animate-in fade-in duration-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoDataUrl}
                    alt="Parked spot preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all active:scale-90"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Photo attached
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !isCompressing && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click()
                    }
                  }}
                  className="relative group overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-100/70 py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {/* Corner focus brackets indicating camera viewfinder */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-neutral-300 rounded-tl-sm transition-colors group-hover:border-neutral-500" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-neutral-300 rounded-tr-sm transition-colors group-hover:border-neutral-500" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-neutral-300 rounded-bl-sm transition-colors group-hover:border-neutral-500" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-neutral-300 rounded-br-sm transition-colors group-hover:border-neutral-500" />

                  {/* Shutter Button with gentle ambient pulse */}
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/60 group-hover:scale-105 transition-transform">
                    <span className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping opacity-60" />
                    <Camera className="w-5 h-5 text-neutral-600 relative z-10" />
                  </div>

                  <span className="text-xs font-medium text-neutral-600 text-center max-w-[200px] leading-snug">
                    {isCompressing ? "Processing photo..." : "Tap to snap pillar or lift lobby sign"}
                  </span>
                </div>
              )}
            </div>

            {/* Step 4: Dynamic CTA with Spinner & Duplicate Click Guard */}
            <div className="pt-2 pb-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                className={cn(
                  "w-full h-12 rounded-2xl bg-[#007AFF] hover:bg-[#0056C6] text-white font-semibold text-[14px]",
                  "shadow-[0_4px_16px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                  isSubmitting && "opacity-80 cursor-wait",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Locking in Spot...</span>
                  </>
                ) : (
                  <span>Lock in Spot • {displayDeckCta}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
