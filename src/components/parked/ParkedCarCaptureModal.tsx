"use client"

import { useState, useRef, ChangeEvent } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import { cn } from "@/lib/utils"
import { Car, Camera, X, Check } from "lucide-react"

const COMMON_DECKS = [
  "B2",
  "B1",
  "1",
  "2",
  "2A",
  "3",
  "3A",
  "4",
  "4A",
  "5",
  "5A",
  "Roof",
]

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

  const [selectedDeck, setSelectedDeck] = useState<string>("3A")
  const [customDeck, setCustomDeck] = useState<string>("")
  const [lotNumber, setLotNumber] = useState<string>("")
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fallback to first available carpark if selected is null
  const activeCarpark = selectedCarpark || carparks[0] || null

  const resetForm = () => {
    setSelectedDeck("3A")
    setCustomDeck("")
    setLotNumber("")
    setPhotoDataUrl(null)
  }

  const handleClose = () => {
    resetForm()
    setIsParkedCaptureOpen(false)
  }

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
    const deck = customDeck.trim() ? customDeck.trim() : selectedDeck
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
    resetForm()
    setIsParkedCaptureOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-parking-title"
        className="relative w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.22)] border-[0.5px] border-black/5 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in slide-in-from-bottom duration-300"
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="md:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="save-parking-title"
                className="text-[15px] font-bold tracking-tight text-neutral-900 leading-tight"
              >
                Save Parking Spot
              </h2>
              <p className="text-[11px] font-semibold text-neutral-400 truncate max-w-[220px]">
                {activeCarpark.address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Deck / Level Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Deck / Floor Level
              </label>
              {activeCarpark.agency && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200/50">
                  {activeCarpark.agency} MSCP
                </span>
              )}
            </div>

            {/* Horizontal Deck Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {COMMON_DECKS.map((deck) => {
                const isSelected = selectedDeck === deck && !customDeck
                return (
                  <button
                    key={deck}
                    type="button"
                    onClick={() => {
                      setSelectedDeck(deck)
                      setCustomDeck("")
                    }}
                    className={cn(
                      "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95",
                      isSelected
                        ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 border border-neutral-200/50",
                    )}
                  >
                    {deck}
                  </button>
                )
              })}
            </div>

            {/* Custom Deck Input if not in pills */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-medium">Or custom:</span>
              <input
                type="text"
                placeholder="e.g. Basement 3 / L7"
                value={customDeck}
                onChange={(e) => setCustomDeck(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-800"
              />
            </div>
          </div>

          {/* Lot Number / Pillar landmark */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
              Pillar or Lot Number (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 3A-142, Blue Zone, Near Lift Lobby C"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-neutral-900 font-medium"
              />
            </div>
          </div>

          {/* Pillar / Bay Photo Snap */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
              Quick Photo (Pillar or Parking Lot)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {photoDataUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm aspect-video bg-neutral-900 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoDataUrl}
                  alt="Parked spot preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-3 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-blue-400 bg-neutral-50/70 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-1.5 text-neutral-600 transition-all active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-neutral-200/70 flex items-center justify-center text-blue-600">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-neutral-800">
                    {isCompressing ? "Processing photo..." : "Snap or upload photo"}
                  </span>
                  <p className="text-[10px] text-neutral-400">
                    Quickly captures the painted pillar number or lift sign
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-11 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Parking Spot</span>
          </button>
        </div>
      </div>
    </div>
  )
}
