import { mallRatesData } from "@/data/mall-rates"

export interface TimeBandRate {
  start: string // "HH:mm"
  end: string // "HH:mm"
  firstHour?: number
  firstTwoHours?: number
  firstFourHours?: number
  subsequentHalfHour?: number
  perEntry?: number
  maxCap?: number
}

export interface MallRateConfig {
  id: string
  keywords: string[]
  name: string
  gracePeriodMins?: number
  weekday: TimeBandRate[]
  saturday: TimeBandRate[]
  sundayAndPh: TimeBandRate[]
  remarks?: string
}

export interface RateCalculationResult {
  estimatedCost: number
  breakdown: string[]
  rateSummary: string
  isFree: boolean
  gracePeriodMins: number
  isMall: boolean
  mallName?: string
  remarks?: string
}

const MALL_DATABASE: MallRateConfig[] = mallRatesData as unknown as MallRateConfig[]

// Known central area postal / keywords for HDB & URA
const CENTRAL_AREA_KEYWORDS = [
  "CANTONMENT",
  "DUXTON",
  "CHINATOWN",
  "ALBERT CENTRE",
  "BRAS BASAH",
  "WATERLOO",
  "QUEEN STREET",
  "ROCHOR",
  "SELEGIE",
  "TANJONG PAGAR",
  "TELOK AYER",
  "AMOY",
  "SMITH STREET",
  "KRETA AYER",
  "OUTRAM",
  "BEACH ROAD",
  "NORTH BRIDGE",
  "SOUTH BRIDGE",
  "MAXWELL",
]

export function isCentralArea(address: string, carparkNo: string): boolean {
  const upperAddr = (address + " " + carparkNo).toUpperCase()
  return CENTRAL_AREA_KEYWORDS.some((kw) => upperAddr.includes(kw))
}

export function matchMall(
  address: string,
  carparkNo: string,
): MallRateConfig | null {
  const text = `${address} ${carparkNo}`.toUpperCase()
  for (const mall of MALL_DATABASE) {
    if (mall.keywords.some((kw) => text.includes(kw.toUpperCase()))) {
      return mall
    }
  }
  return null
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

/**
 * Calculates estimated parking fee for any Singapore carpark.
 */
export function calculateParkingFee(
  address: string,
  carparkNo: string,
  agency: string,
  arrivalDate: Date = new Date(),
  durationMinutes: number = 120,
): RateCalculationResult {
  const mall = matchMall(address, carparkNo)

  if (mall) {
    return calculateMallFee(mall, arrivalDate, durationMinutes)
  }

  return calculatePublicHdbUraFee(
    address,
    carparkNo,
    agency,
    arrivalDate,
    durationMinutes,
  )
}

function calculateMallFee(
  mall: MallRateConfig,
  arrivalDate: Date,
  durationMinutes: number,
): RateCalculationResult {
  const grace = mall.gracePeriodMins ?? 10
  if (durationMinutes <= grace) {
    return {
      estimatedCost: 0,
      breakdown: [`Stay under ${grace} min grace period: $0.00`],
      rateSummary: `Free (< ${grace} mins)`,
      isFree: true,
      gracePeriodMins: grace,
      isMall: true,
      mallName: mall.name,
      remarks: mall.remarks,
    }
  }

  const dayOfWeek = arrivalDate.getDay() // 0 = Sun, 6 = Sat
  let schedule: TimeBandRate[]
  let dayLabel = "Weekday"

  if (dayOfWeek === 0) {
    schedule = mall.sundayAndPh
    dayLabel = "Sunday/PH"
  } else if (dayOfWeek === 6) {
    schedule = mall.saturday
    dayLabel = "Saturday"
  } else {
    schedule = mall.weekday
    dayLabel = "Weekday"
  }

  const arrMins = arrivalDate.getHours() * 60 + arrivalDate.getMinutes()
  
  // Find matching band
  let matchedBand: TimeBandRate | null = null
  for (const band of schedule) {
    const startMins = parseTimeToMinutes(band.start)
    let endMins = parseTimeToMinutes(band.end)
    if (endMins === 0 || endMins < startMins) endMins += 24 * 60

    let currentArr = arrMins
    if (currentArr < startMins && endMins > 24 * 60) {
      currentArr += 24 * 60
    }

    if (currentArr >= startMins && currentArr < endMins) {
      matchedBand = band
      break
    }
  }

  if (!matchedBand && schedule.length > 0) {
    matchedBand = schedule[0]
  }

  if (!matchedBand) {
    return {
      estimatedCost: 3.0,
      breakdown: ["Standard mall rate estimated: $3.00"],
      rateSummary: "Est. $3.00",
      isFree: false,
      gracePeriodMins: grace,
      isMall: true,
      mallName: mall.name,
      remarks: mall.remarks,
    }
  }

  const breakdown: string[] = []
  let totalCost = 0

  if (matchedBand.perEntry !== undefined) {
    totalCost = matchedBand.perEntry
    breakdown.push(
      `${dayLabel} (${matchedBand.start}–${matchedBand.end}) Per entry: $${matchedBand.perEntry.toFixed(2)}`,
    )
  } else {
    let remainingMinutes = durationMinutes

    if (matchedBand.firstFourHours !== undefined) {
      totalCost += matchedBand.firstFourHours
      const blockUsed = Math.min(240, remainingMinutes)
      breakdown.push(`1st 4 hours: $${matchedBand.firstFourHours.toFixed(2)}`)
      remainingMinutes -= blockUsed
    } else if (matchedBand.firstTwoHours !== undefined) {
      totalCost += matchedBand.firstTwoHours
      const blockUsed = Math.min(120, remainingMinutes)
      breakdown.push(`1st 2 hours: $${matchedBand.firstTwoHours.toFixed(2)}`)
      remainingMinutes -= blockUsed
    } else if (matchedBand.firstHour !== undefined) {
      totalCost += matchedBand.firstHour
      const blockUsed = Math.min(60, remainingMinutes)
      breakdown.push(`1st hour: $${matchedBand.firstHour.toFixed(2)}`)
      remainingMinutes -= blockUsed
    }

    if (remainingMinutes > 0 && matchedBand.subsequentHalfHour !== undefined) {
      const halfHourBlocks = Math.ceil(remainingMinutes / 30)
      const subCost = halfHourBlocks * matchedBand.subsequentHalfHour
      totalCost += subCost
      breakdown.push(
        `Subsequent ${halfHourBlocks * 30} mins (${halfHourBlocks} × $${matchedBand.subsequentHalfHour.toFixed(2)}): $${subCost.toFixed(2)}`,
      )
    }

    if (matchedBand.maxCap !== undefined && totalCost > matchedBand.maxCap) {
      totalCost = matchedBand.maxCap
      breakdown.push(`Daily maximum cap applied: $${matchedBand.maxCap.toFixed(2)}`)
    }
  }

  const rateSummary =
    matchedBand.perEntry !== undefined
      ? `$${matchedBand.perEntry.toFixed(2)}/entry`
      : matchedBand.firstHour !== undefined
        ? `$${matchedBand.firstHour.toFixed(2)} 1st hr`
        : matchedBand.firstTwoHours !== undefined
          ? `$${matchedBand.firstTwoHours.toFixed(2)} 1st 2h`
          : `$${totalCost.toFixed(2)}`

  return {
    estimatedCost: Number(totalCost.toFixed(2)),
    breakdown,
    rateSummary,
    isFree: totalCost === 0,
    gracePeriodMins: grace,
    isMall: true,
    mallName: mall.name,
    remarks: mall.remarks,
  }
}

function calculatePublicHdbUraFee(
  address: string,
  carparkNo: string,
  agency: string,
  arrivalDate: Date,
  durationMinutes: number,
): RateCalculationResult {
  const grace = 10
  if (durationMinutes <= grace) {
    return {
      estimatedCost: 0,
      breakdown: [`Stay under ${grace} min grace period: $0.00`],
      rateSummary: `Free (< ${grace} mins)`,
      isFree: true,
      gracePeriodMins: grace,
      isMall: false,
    }
  }

  const isCentral = isCentralArea(address, carparkNo)
  const isSunday = arrivalDate.getDay() === 0
  const breakdown: string[] = []

  // Check Sunday Free Parking (7:30am to 10:30pm) for non-central HDB
  if (isSunday && !isCentral && agency.toUpperCase() === "HDB") {
    const arrHours = arrivalDate.getHours() + arrivalDate.getMinutes() / 60
    const depHours = arrHours + durationMinutes / 60
    if (arrHours >= 7.5 && depHours <= 22.5) {
      return {
        estimatedCost: 0,
        breakdown: ["Sunday Free Parking Scheme (7:30am – 10:30pm): $0.00"],
        rateSummary: "Free (Sunday FPS)",
        isFree: true,
        gracePeriodMins: grace,
        isMall: false,
        remarks: "HDB Free Parking Scheme active on Sundays / Public Holidays.",
      }
    }
  }

  // Calculate 30-min blocks
  const numBlocks = Math.ceil(durationMinutes / 30)
  let totalCost = 0
  let dayBlocks = 0
  let normalBlocks = 0

  let curr = new Date(arrivalDate.getTime())

  for (let i = 0; i < numBlocks; i++) {
    const hours = curr.getHours() + curr.getMinutes() / 60
    const isPeakCentral =
      isCentral &&
      curr.getDay() !== 0 && // Not Sunday
      hours >= 7.0 &&
      hours < 17.0 // 7am to 5pm Mon-Sat

    if (isPeakCentral) {
      totalCost += 1.20
      dayBlocks++
    } else {
      totalCost += 0.60
      normalBlocks++
    }

    curr = new Date(curr.getTime() + 30 * 60 * 1000)
  }

  // Apply HDB Night Parking Cap ($5.00 max for 10:30pm to 7:00am)
  const isNightStay =
    arrivalDate.getHours() >= 22 || arrivalDate.getHours() < 7
  if (isNightStay && totalCost > 5.0 && durationMinutes >= 300) {
    totalCost = 5.0
    breakdown.push("HDB Night Parking Cap applied (10:30pm – 7:00am): $5.00")
  } else {
    if (dayBlocks > 0) {
      breakdown.push(
        `Central Area Peak (${dayBlocks} × 30m @ $1.20): $${(dayBlocks * 1.2).toFixed(2)}`,
      )
    }
    if (normalBlocks > 0) {
      breakdown.push(
        `Standard Rate (${normalBlocks} × 30m @ $0.60): $${(normalBlocks * 0.6).toFixed(2)}`,
      )
    }
  }

  const rateSummary = isCentral ? "$1.20/30m" : "$0.60/30m"

  return {
    estimatedCost: Number(totalCost.toFixed(2)),
    breakdown,
    rateSummary,
    isFree: totalCost === 0,
    gracePeriodMins: grace,
    isMall: false,
    remarks: isCentral
      ? "Central Area: $1.20/30m (7am–5pm Mon–Sat), $0.60/30m other times."
      : "Standard HDB/URA: $0.60 per half hour. Night cap $5.00.",
  }
}
