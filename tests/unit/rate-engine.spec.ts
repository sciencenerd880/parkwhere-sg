import { describe, it, expect } from "vitest"
import {
  calculateParkingFee,
  isCentralArea,
  matchMall,
} from "@/lib/rate-engine"
import { enrichCarparksWithRates } from "@/lib/carpark-utils"
import type { CarparkWithDistance } from "@/types"

describe("rate-engine — Mall identification and keywords", () => {
  it("correctly matches VivoCity from address / development name", () => {
    const mall = matchMall("1 HarbourFront Walk, VivoCity", "VIVOCITY")
    expect(mall).not.toBeNull()
    expect(mall?.name).toBe("VivoCity")
  })

  it("correctly matches ION Orchard", () => {
    const mall = matchMall("2 Orchard Turn ION Orchard", "ION")
    expect(mall).not.toBeNull()
    expect(mall?.name).toBe("ION Orchard")
  })

  it("returns null for non-mall residential carpark", () => {
    const mall = matchMall("BLK 106 TELOK BLANGAH CRESCENT", "TB1")
    expect(mall).toBeNull()
  })
})

describe("rate-engine — Central Area identification", () => {
  it("identifies central area HDBs", () => {
    expect(isCentralArea("BLK 270 ALBERT CENTRE BASEMENT CAR PARK", "ACB")).toBe(true)
    expect(isCentralArea("CANTONMENT ROAD PINNACLE@DUXTON", "DUX1")).toBe(true)
    expect(isCentralArea("CHINATOWN COMPLEX", "CTC")).toBe(true)
  })

  it("identifies heartland non-central HDBs", () => {
    expect(isCentralArea("BLK 101 JALAN DUSUN", "AH1")).toBe(false)
    expect(isCentralArea("BLK 253 ANG MO KIO STREET 21", "AK19")).toBe(false)
  })
})

describe("rate-engine — Public HDB / URA Rate Calculations", () => {
  it("returns Free for stay within 10-minute grace period", () => {
    const result = calculateParkingFee(
      "BLK 101 JALAN DUSUN",
      "AH1",
      "HDB",
      new Date("2026-09-01T10:00:00"),
      10,
    )
    expect(result.isFree).toBe(true)
    expect(result.estimatedCost).toBe(0)
  })

  it("calculates standard non-central HDB rate ($0.60 / 30 mins)", () => {
    // 2 hours = 120 mins = 4 blocks = $2.40
    const result = calculateParkingFee(
      "BLK 101 JALAN DUSUN",
      "AH1",
      "HDB",
      new Date("2026-09-01T10:00:00"), // Tuesday 10:00am
      120,
    )
    expect(result.estimatedCost).toBe(2.4)
    expect(result.rateSummary).toBe("$0.60/30m")
  })

  it("calculates central area peak rate ($1.20 / 30 mins 7am-5pm Mon-Sat)", () => {
    // Tuesday 10:00am for 2 hours = 4 blocks * $1.20 = $4.80
    const result = calculateParkingFee(
      "BLK 270 ALBERT CENTRE BASEMENT CAR PARK",
      "ACB",
      "HDB",
      new Date("2026-09-01T10:00:00"),
      120,
    )
    expect(result.estimatedCost).toBe(4.8)
    expect(result.rateSummary).toBe("$1.20/30m")
  })

  it("applies Free Parking Scheme (FPS) on Sunday daytime for non-central HDB", () => {
    // Sunday 11:00am (2026-09-06 is Sunday)
    const result = calculateParkingFee(
      "BLK 101 JALAN DUSUN",
      "AH1",
      "HDB",
      new Date("2026-09-06T11:00:00"),
      120,
    )
    expect(result.isFree).toBe(true)
    expect(result.estimatedCost).toBe(0)
    expect(result.rateSummary).toContain("Free")
  })

  it("applies HDB night cap ($5.00 max for 10:30pm to 7:00am)", () => {
    // 11:00pm arrival for 7 hours (420 mins)
    const result = calculateParkingFee(
      "BLK 101 JALAN DUSUN",
      "AH1",
      "HDB",
      new Date("2026-09-01T23:00:00"),
      420,
    )
    expect(result.estimatedCost).toBe(5.0)
  })
})

describe("rate-engine — Shopping Mall Rate Calculations", () => {
  it("calculates VivoCity weekday daytime rate accurately", () => {
    // Weekday (Tuesday) 10:00am for 2 hours (120 mins)
    // 1st hour: $2.20, next 1 hour (2 x $1.00): $2.00 -> Total: $4.20
    const result = calculateParkingFee(
      "1 HarbourFront Walk, VivoCity",
      "VIVOCITY",
      "LTA",
      new Date("2026-09-01T10:00:00"),
      120,
    )
    expect(result.isMall).toBe(true)
    expect(result.mallName).toBe("VivoCity")
    expect(result.estimatedCost).toBe(4.2)
  })

  it("calculates ION Orchard weekday daytime rate accurately", () => {
    // Weekday 10:00am for 2 hours
    // 1st hour: $3.00, next 1 hour (2 x $1.50): $3.00 -> Total: $6.00
    const result = calculateParkingFee(
      "2 Orchard Turn ION Orchard",
      "ION",
      "LTA",
      new Date("2026-09-01T10:00:00"),
      120,
    )
    expect(result.isMall).toBe(true)
    expect(result.estimatedCost).toBe(6.0)
  })

  it("calculates evening per-entry rate for malls", () => {
    // Westgate at 7:30pm (19:30) on Weekday
    const result = calculateParkingFee(
      "3 Gateway Drive Westgate",
      "WESTGATE",
      "LTA",
      new Date("2026-09-01T19:30:00"),
      120,
    )
    expect(result.isMall).toBe(true)
    expect(result.estimatedCost).toBe(3.0)
    expect(result.rateSummary).toBe("$3.00/entry")
  })
})

describe("rate-engine — Smart Savings comparison vs nearby mall", () => {
  it("attaches savings badge when cheaper public carpark is near a mall", () => {
    const mockCarparks: CarparkWithDistance[] = [
      {
        carparkNo: "VIVOCITY",
        address: "1 HarbourFront Walk VivoCity",
        lat: 1.2644,
        lng: 103.8222,
        agency: "LTA",
        distance: 0.05,
        lotsAvailable: 100,
        totalLots: 500,
        lastUpdated: null,
        availabilityStatus: "healthy",
      },
      {
        carparkNo: "TB106",
        address: "BLK 106 TELOK BLANGAH CRESCENT",
        lat: 1.268,
        lng: 103.824,
        agency: "HDB",
        distance: 0.35,
        lotsAvailable: 50,
        totalLots: 120,
        lastUpdated: null,
        availabilityStatus: "healthy",
      },
    ]

    const enriched = enrichCarparksWithRates(
      mockCarparks,
      new Date("2026-09-01T10:00:00"), // Tuesday 10am, 2h duration ($4.20 vs $2.40)
      120,
    )

    expect(enriched[0].estimatedCost).toBe(4.2)
    expect(enriched[1].estimatedCost).toBe(2.4)
    expect(enriched[1].savingsVsNearbyMall).toBe(1.8)
  })
})
