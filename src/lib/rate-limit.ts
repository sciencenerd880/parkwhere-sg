/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * IMPORTANT: this is a per-edge-instance limiter. On Vercel's serverless
 * platform each function instance keeps its own `Map`, so a determined
 * attacker who shuffles across multiple instances can sidestep the cap.
 * This raises the bar enough to deter casual abuse and accidental loops
 * while a proper Redis / Upstash-backed limiter is filed as a follow-up
 * (see LESSONS_LEARNT.md entry).
 *
 * The implementation is deliberately synchronous and side-effectful — it
 * mutates the provided `store` so tests can inject a fresh map per case.
 *
 * @param store  shared `Map<ip, {count, reset}>` state
 * @param ip     caller IP (use first value of `x-forwarded-for`)
 * @param now    current epoch milliseconds (injectable for tests)
 * @param limit  max requests allowed within the window
 * @param windowMs window length in ms
 */
export interface RateLimitResult {
  ok: boolean
  retryAfter: number // seconds, 0 when ok
}

export function checkRateLimit(
  store: Map<string, { count: number; reset: number }>,
  ip: string,
  now: number,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const rec = store.get(ip)
  if (!rec || now > rec.reset) {
    store.set(ip, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  if (rec.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((rec.reset - now) / 1000)) }
  }
  rec.count += 1
  return { ok: true, retryAfter: 0 }
}

/** Extract caller IP from a Request's `x-forwarded-for` header. */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  if (!xff) return "anon"
  const first = xff.split(",")[0]?.trim()
  return first || "anon"
}