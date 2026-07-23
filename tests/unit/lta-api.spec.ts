import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchAllLtaCarparks, _clearCacheForTests } from "@/lib/lta-api"

interface FetchMockSpec {
  pages: { value: unknown[] }[]
  status?: number
}

interface LtaRawItem {
  CarParkID: string
  Agency?: string
  Development?: string
  Area?: string
  Location: string
  AvailableLots?: number
  LotType: string
}

function makeItem(id: string, lotType = "C", lots = 5): LtaRawItem {
  return {
    CarParkID: id,
    Agency: "HDB",
    Development: `Devel ${id}`,
    Area: "",
    Location: "1.3000 103.8000",
    AvailableLots: lots,
    LotType: lotType,
  }
}

interface FakeResponse {
  ok: boolean
  status: number
  statusText: string
  json: () => Promise<unknown>
}

function installFetchMock(spec: FetchMockSpec) {
  return vi.spyOn(global, "fetch").mockImplementation(async (input: unknown) => {
    const url = String(input)
    const idx = Number.parseInt(url.match(/\$skip=(\d+)/)?.[1] ?? "0", 10) / 500
    const page = spec.pages[Math.min(idx, spec.pages.length - 1)]
    const status = spec.status ?? 200
    if (status !== 200) {
      const fake: FakeResponse = {
        ok: false,
        status,
        statusText: "ERR",
        json: async () => ({ error: "boom" }),
      }
      return fake as unknown as Response
    }
    const ok: FakeResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => page,
    }
    return ok as unknown as Response
  })
}

beforeEach(() => {
  _clearCacheForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("fetchAllLtaCarparks — normal multi-page", () => {
  it("paginates until last page is short, then stops", async () => {
    const pages = [
      { value: Array.from({ length: 500 }, (_, i) => makeItem(`P0-${i}`)) },
      { value: Array.from({ length: 500 }, (_, i) => makeItem(`P1-${i}`)) },
      { value: Array.from({ length: 400 }, (_, i) => makeItem(`P2-${i}`)) },
    ]
    const fetchMock = installFetchMock({ pages })
    const result = await fetchAllLtaCarparks()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.length).toBe(500 + 500 + 400)
  })

  it("only keeps LotType 'C' lots", async () => {
    const pages = [
      {
        value: [
          makeItem("Y", "C", 10),
          makeItem("N1", "Y", 5),
          makeItem("N2", "H", 2),
          makeItem("Y2", "C", 3),
        ],
      },
    ]
    installFetchMock({ pages })
    const result = await fetchAllLtaCarparks()
    const ids = result.map((r) => r.carParkId)
    expect(ids).toEqual(["Y", "Y2"])
  })

  it("skips items with unparseable Location", async () => {
    const pages = [
      {
        value: [
          makeItem("GOOD", "C", 5),
          { ...makeItem("BAD", "C", 5), Location: "not a coord" },
          { ...makeItem("EMPTY", "C", 5), Location: "" },
        ],
      },
    ]
    installFetchMock({ pages })
    const result = await fetchAllLtaCarparks()
    expect(result.map((r) => r.carParkId)).toEqual(["GOOD"])
  })
})

describe("fetchAllLtaCarparks — empty dataset", () => {
  it("returns [] and stops after one fetch", async () => {
    installFetchMock({ pages: [{ value: [] }] })
    const result = await fetchAllLtaCarparks()
    expect(result).toEqual([])
  })
})

describe("fetchAllLtaCarparks — safety valve terminates runaway pagination", () => {
  it("stops after MAX_PAGES when every page returns exactly PAGE_SIZE", async () => {
    // Always-full pages would loop forever under the old `while (true)` break.
    const pages = [{ value: Array.from({ length: 500 }, (_, i) => makeItem(`W-${i}`)) }]
    const fetchMock = installFetchMock({ pages })
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const result = await fetchAllLtaCarparks()
    // MAX_PAGES is 20 — if it were infinite, this test would hang and timeout.
    expect(fetchMock).toHaveBeenCalledTimes(20)
    expect(result.length).toBe(20 * 500)
    expect(warnSpy).toHaveBeenCalled()
    expect(String(warnSpy.mock.calls[0][0])).toContain("MAX_PAGES")
  })
})

describe("fetchAllLtaCarparks — upstream error", () => {
  it("rejects and leaves cache empty", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false, status: 503, statusText: "Service Unavailable", json: async () => ({}) } as unknown as Response)
    await expect(fetchAllLtaCarparks()).rejects.toThrow(/LTA API error: 503/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    // second call still hits fetch (cache stays null on failure)
    fetchMock.mockClear()
    await expect(fetchAllLtaCarparks()).rejects.toThrow(/LTA API error: 503/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("fetchAllLtaCarparks — cache behaviour", () => {
  it("returns cached data within TTL without refetching", async () => {
    const pages = [{ value: Array.from({ length: 10 }, (_, i) => makeItem(`C-${i}`)) }]
    const fetchMock = installFetchMock({ pages })
    const a = await fetchAllLtaCarparks()
    const b = await fetchAllLtaCarparks()
    expect(b).toEqual(a)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("_clearCacheForTests", () => {
  it("forces a refetch on next call", async () => {
    const pages = [{ value: [{ ...makeItem("X", "C", 1) }] }]
    const fetchMock = installFetchMock({ pages })
    await fetchAllLtaCarparks()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    _clearCacheForTests()
    await fetchAllLtaCarparks()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})