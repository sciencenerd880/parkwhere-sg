import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/redirect-target"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Use `new URL(path, request.url)` for a safe same-origin redirect.
      // Building the URL via the URL constructor — rather than string
      // concatenation — guarantees the target stays on `origin` even if a
      // future caller passes something edge-casey that `safeNext` overlooked.
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}