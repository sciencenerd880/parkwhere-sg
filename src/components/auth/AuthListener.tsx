"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useParkingStore } from "@/store/useParkingStore"
import { fetchFavorites } from "@/lib/favorites"
import { syncUserProfile, trackEvent } from "@/lib/analytics"

import type { User } from "@supabase/supabase-js"

export default function AuthListener() {
  const trackedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const { setUser, setAuthLoading } = useAuthStore.getState()
    const { setFavorites } = useParkingStore.getState()

    const handleUserSync = (user: User | null) => {
      setUser(user)
      setAuthLoading(false)
      if (user) {
        syncUserProfile(user)
        if (trackedUserIdRef.current !== user.id) {
          trackedUserIdRef.current = user.id
          trackEvent("user_signed_in", {
            email: user.email,
            name: user.user_metadata?.full_name,
            provider: user.app_metadata?.provider || "google",
          })
        }
      }
      syncFavorites(user?.id ?? null)
    }

    const syncFavorites = async (userId: string | null) => {
      if (!userId) {
        setFavorites([])
        return
      }
      try {
        setFavorites(await fetchFavorites(userId))
      } catch {
        // Leave favorites as-is; UI already has a general error surface.
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      handleUserSync(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      handleUserSync(user)
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
