"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { GoogleIcon, MascotIcon } from "@/components/icons"
import { trackEvent } from "@/lib/analytics"
import { Compass, Heart, Sparkles } from "lucide-react"

const ONBOARDING_STORAGE_KEY = "pw_onboarding_dismissed_v1"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true"
}

function getServerSnapshot(): boolean {
  return true
}

export default function OnboardingModal() {
  const { user, isAuthLoading, signInWithGoogle } = useAuthStore()
  const isDismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const isOpen = !isDismissed && !isAuthLoading && !user

  useEffect(() => {
    if (isOpen) {
      trackEvent("onboarding_viewed")
    }
  }, [isOpen])

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    window.dispatchEvent(new Event("storage"))
    trackEvent("onboarding_dismissed", { mode: "guest" })
  }

  const handleGoogleSignIn = async () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    window.dispatchEvent(new Event("storage"))
    trackEvent("onboarding_google_signin_clicked")
    await signInWithGoogle()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-3xl rounded-[32px] border-[0.5px] border-black/10 shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 md:p-8 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-300">
        
        {/* Mascot & Brand Header */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-full bg-blue-500/10 blur-xl animate-pulse" />
          <MascotIcon withBadge className="relative h-20 w-20 animate-pw-bob" />
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[22px] font-bold tracking-tight text-neutral-900">
            ParkWhere<span className="text-blue-600 font-black">SG</span>
          </span>
        </div>

        <p className="text-[14px] font-medium text-neutral-500 max-w-xs mb-6 leading-snug">
          Real-time parking spots, smart navigation, and synced favourites.
        </p>

        {/* Feature Highlights */}
        <div className="w-full flex flex-col gap-3 text-left mb-6">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100/80">
            <div className="h-8 w-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-neutral-900">
                Live Lot Availability
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Up-to-the-minute lot counts from HDB & LTA so you never drive blind.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-neutral-900">
                Save & Sync Favourites
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Sign in with Google to sync your favourite parking spots across all devices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-neutral-900">
                1-Tap Smart Navigation
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Instant routing to Google Maps, Apple Maps, or Waze.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[14px] font-semibold text-neutral-800"
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 text-[13px] font-medium text-neutral-400 hover:text-neutral-600 active:scale-95 transition-all"
          >
            Explore as Guest
          </button>
        </div>

      </div>
    </div>
  )
}
