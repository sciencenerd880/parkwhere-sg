"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useParkingStore } from "@/store/useParkingStore"
import { fetchFavorites } from "@/lib/favorites"

export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient()
    const { setUser, setAuthLoading } = useAuthStore.getState()
    const { setFavorites } = useParkingStore.getState()

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
      setUser(user)
      setAuthLoading(false)
      syncFavorites(user?.id ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUser(user)
      setAuthLoading(false)
      syncFavorites(user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
