"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { GoogleIcon, RadarTelemetryIcon } from "@/components/icons"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-3xl rounded-[32px] border border-neutral-200/80 shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 md:p-8 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-200">
        
        {/* Radar Telemetry Header */}
        <div className="relative mb-3">
          <RadarTelemetryIcon className="relative h-16 w-16 animate-radar" />
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[20px] font-black tracking-widest text-neutral-900 uppercase">
            PARKWHERE
          </span>
          <span className="text-[10px] font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded tracking-wider">
            SG
          </span>
        </div>

        <p className="text-[13px] font-medium text-neutral-500 max-w-xs mb-6 leading-relaxed">
          Real-time parking telemetry, pricing forecasts, and instant navigation across Singapore.
        </p>

        {/* Feature Highlights */}
        <div className="w-full flex flex-col gap-2.5 text-left mb-6">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-900">
                Live Lot Availability
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Up-to-the-minute lot counts from HDB, URA, and major shopping malls.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-900">
                Saved Destinations
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Sign in to sync your regular parking spots seamlessly across all devices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-900">
                1-Tap Navigation
              </p>
              <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                Direct routing with Google Maps, Apple Maps, or Waze.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-wider shadow-sm"
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-700 active:scale-95 transition-all"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  )
}
