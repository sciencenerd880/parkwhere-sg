"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { cn } from "@/lib/utils"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export default function AuthButton() {
  const { user, isAuthLoading, signInWithGoogle, signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  if (isAuthLoading) {
    return <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse" />
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold tracking-tight text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition-all"
      >
        <GoogleIcon className="h-4 w-4" />
        Sign in
      </button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? ""
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Account menu"
        className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-neutral-200 active:scale-95 transition-all"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="h-full w-full flex items-center justify-center bg-pw-mint text-pw-teal text-sm font-bold">
            {initial}
          </span>
        )}
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 top-10 z-50 w-56 rounded-2xl p-1.5",
              "bg-white/75 backdrop-blur-3xl border-[0.5px] border-black/5",
              "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
            )}
          >
            <div className="px-3 py-2">
              <p className="text-[13px] font-semibold tracking-tight text-neutral-900 truncate">
                {name}
              </p>
              {user.email && (
                <p className="text-[11px] font-medium text-neutral-500 truncate">
                  {user.email}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] transition-all"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
