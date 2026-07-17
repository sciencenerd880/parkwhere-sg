"use client"

import { useCallback, useState } from "react"
import { useParkingStore } from "@/store/useParkingStore"
import type { UserLocation } from "@/types"

export type LocationErrorCode =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unknown"

export interface LocationError {
  code: LocationErrorCode
  message: string
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
}

function mapGeolocationError(err: GeolocationPositionError): LocationError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return {
        code: "denied",
        message: "Location access was denied. Please enable it in your browser settings.",
      }
    case err.POSITION_UNAVAILABLE:
      return {
        code: "unavailable",
        message: "Your location could not be determined. Please try again.",
      }
    case err.TIMEOUT:
      return {
        code: "timeout",
        message: "Getting your location took too long. Please try again.",
      }
    default:
      return {
        code: "unknown",
        message: "An unexpected error occurred while getting your location.",
      }
  }
}

export function useCurrentLocation() {
  const { setUserLocation, setLocationPermission } = useParkingStore()
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<LocationError | null>(null)

  const checkPermission = useCallback(async () => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      return "prompt" as const
    }
    try {
      const status = await navigator.permissions.query({ name: "geolocation" })
      return status.state === "granted"
        ? ("granted" as const)
        : status.state === "denied"
          ? ("denied" as const)
          : ("prompt" as const)
    } catch {
      return "prompt" as const
    }
  }, [])

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err: LocationError = {
        code: "unsupported",
        message: "Geolocation is not supported by your browser.",
      }
      setError(err)
      setLocationPermission("error")
      return null
    }

    setIsLocating(true)
    setError(null)

    const permission = await checkPermission()
    setLocationPermission(permission)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          }
          setUserLocation(loc)
          setLocationPermission("granted")
          setIsLocating(false)
          resolve(loc)
        },
        (err) => {
          const mapped = mapGeolocationError(err)
          setError(mapped)
          setLocationPermission(mapped.code === "denied" ? "denied" : "error")
          setIsLocating(false)
          resolve(null)
        },
        GEO_OPTIONS,
      )
    })
  }, [checkPermission, setUserLocation, setLocationPermission])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    getCurrentLocation,
    isLocating,
    error,
    clearError,
    checkPermission,
  }
}
