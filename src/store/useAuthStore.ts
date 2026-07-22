import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthStore {
  user: User | null
  isAuthLoading: boolean
  setUser: (user: User | null) => void
  setAuthLoading: (v: boolean) => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthLoading: true,
  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ isAuthLoading: v }),
  signInWithGoogle: async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  },
}))
