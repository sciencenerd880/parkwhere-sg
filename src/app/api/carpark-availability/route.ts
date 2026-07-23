import { parseSkip } from "@/lib/skip-validator"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const WINDOW_MS = 60_000
const WINDOW_MAX = 60 // 60 req/min/IP per edge instance
const hits = new Map<string, { count: number; reset: number }>()

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const { ok, retryAfter } = checkRateLimit(
    hits,
    ip,
    Date.now(),
    WINDOW_MAX,
    WINDOW_MS,
  )
  if (!ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    )
  }

  const skip = parseSkip(new URL(request.url).searchParams.get("$skip"))

  if (!process.env.LTA_ACCOUNT_KEY) {
    return Response.json(
      { error: "LTA key not configured" },
      { status: 503 },
    )
  }

  const res = await fetch(
    `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2?$skip=${skip}`,
    {
      headers: {
        AccountKey: process.env.LTA_ACCOUNT_KEY,
        Accept: "application/json",
      },
    },
  )

  if (!res.ok) {
    return Response.json(
      { error: `LTA API error: ${res.status}` },
      { status: res.status },
    )
  }

  const data = await res.json()
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=30" },
  })
}