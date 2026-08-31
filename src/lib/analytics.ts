import { track } from "@vercel/analytics"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

function getDeviceType(): string {
  if (typeof window === "undefined") return "server"
  const ua = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet"
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) return "mobile"
  return "desktop"
}

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>

export async function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  try {
    // 1. Send to Vercel Analytics Custom Events
    track(eventName, properties)
  } catch {
    // ignore
  }

  // 2. Send to Supabase user_events table (first-party telemetry)
  if (typeof window !== "undefined") {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("user_events").insert({
        event_name: eventName,
        user_id: user?.id ?? null,
        properties: {
          ...properties,
          referrer: document.referrer || null,
        },
        device_type: getDeviceType(),
        path: window.location.pathname,
      })
    } catch {
      // Telemetry failure should never affect core application
    }
  }
}

export async function syncUserProfile(user: User) {
  if (typeof window === "undefined" || !user) return
  try {
    const supabase = createClient()
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: (user.user_metadata?.full_name as string) || null,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
        provider: (user.app_metadata?.provider as string) || "google",
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
  } catch {
    // Silent fail if profiles table not yet created
  }
}
