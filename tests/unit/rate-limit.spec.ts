import { describe, it, expect } from "vitest"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

describe("checkRateLimit", () => {
  it("allows first request and seeds the window", () => {
    const store = new Map()
    const r = checkRateLimit(store, "1.2.3.4", 1000, 5, 60_000)
    expect(r.ok).toBe(true)
    expect(r.retryAfter).toBe(0)
    expect(store.get("1.2.3.4")).toEqual({ count: 1, reset: 1000 + 60_000 })
  })

  it("counts up within the window", () => {
    const store = new Map()
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit(store, "ip", 1000, 5, 60_000)
      expect(r.ok).toBe(true)
    }
    expect(store.get("ip")?.count).toBe(5)
  })

  it("blocks the 6th request within a 5-limit window", () => {
    const store = new Map()
    for (let i = 0; i < 5; i++) checkRateLimit(store, "ip", 1000, 5, 60_000)
    const r = checkRateLimit(store, "ip", 1000, 5, 60_000)
    expect(r.ok).toBe(false)
    expect(r.retryAfter).toBeGreaterThan(0)
    // not counted
    expect(store.get("ip")?.count).toBe(5)
  })

  it("retryAfter is at least 1 second (ceil), not 0", () => {
    const store = new Map()
    for (let i = 0; i < 5; i++) checkRateLimit(store, "ip", 10_000, 5, 60_000)
    const r = checkRateLimit(store, "ip", 10_000, 5, 60_000)
    expect(r.ok).toBe(false)
    expect(r.retryAfter).toBeGreaterThanOrEqual(1)
    // reset at 70000 - now 10000 = 60000s -> 60s
    expect(r.retryAfter).toBe(60)
  })

  it("resets the window after windowMs elapses", () => {
    const store = new Map()
    for (let i = 0; i < 5; i++) checkRateLimit(store, "ip", 1000, 5, 60_000)
    // After 61s
    const r = checkRateLimit(store, "ip", 1000 + 61_000, 5, 60_000)
    expect(r.ok).toBe(true)
    expect(r.retryAfter).toBe(0)
    expect(store.get("ip")?.count).toBe(1)
  })

  it("isolates different IPs", () => {
    const store = new Map()
    for (let i = 0; i < 5; i++) checkRateLimit(store, "A", 1000, 5, 60_000)
    const r = checkRateLimit(store, "B", 1000, 5, 60_000)
    expect(r.ok).toBe(true)
    expect(store.get("A")?.count).toBe(5)
    expect(store.get("B")?.count).toBe(1)
  })

  it("blocks only when count reaches limit, not before", () => {
    const store = new Map()
    // 3 requests, limit 5 — all allowed
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(store, "ip", 1000, 5, 60_000).ok).toBe(true)
    }
    // 4th and 5th still allowed
    expect(checkRateLimit(store, "ip", 1000, 5, 60_000).ok).toBe(true)
    expect(checkRateLimit(store, "ip", 1000, 5, 60_000).ok).toBe(true)
    // 6th blocked
    expect(checkRateLimit(store, "ip", 1000, 5, 60_000).ok).toBe(false)
  })
})

describe("getClientIp", () => {
  it("returns first IP from x-forwarded-for", () => {
    const req = new Request("https://x/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    })
    expect(getClientIp(req)).toBe("1.2.3.4")
  })
  it('returns "anon" when header missing', () => {
    const req = new Request("https://x/")
    expect(getClientIp(req)).toBe("anon")
  })
  it('returns "anon" when header is empty string', () => {
    const req = new Request("https://x/", {
      headers: { "x-forwarded-for": "" },
    })
    expect(getClientIp(req)).toBe("anon")
  })
  it("trims whitespace around IP", () => {
    const req = new Request("https://x/", {
      headers: { "x-forwarded-for": "  1.2.3.4  , 5.6.7.8" },
    })
    expect(getClientIp(req)).toBe("1.2.3.4")
  })
})