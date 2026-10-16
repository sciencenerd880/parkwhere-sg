export interface Destination {
  lat: number
  lng: number
  name: string
  address: string
}

export interface LtaCarpark {
  carParkId: string
  agency: "HDB" | "LTA" | "URA"
  development: string
  area: string
  lat: number
  lng: number
  availableLots: number
}

export type AvailabilityStatus =
  | "healthy"
  | "limited"
  | "very_limited"
  | "full"
  | "unknown"

export interface CarparkWithDistance {
  carparkNo: string
  address: string
  lat: number
  lng: number
  agency: string
  distance: number
  lotsAvailable: number | null
  totalLots: number | null
  lastUpdated: string | null
  availabilityStatus: AvailabilityStatus
  estimatedCost?: number | null
  rateSummary?: string
  rateBreakdown?: string[]
  isMall?: boolean
  mallName?: string
  remarks?: string
  savingsVsNearbyMall?: number | null
}

export interface OneMapSearchResult {
  lat: number
  lng: number
  name: string
  address: string
}

export interface MapViewState {
  latitude: number
  longitude: number
  zoom: number
}

export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export type LocationPermission = "prompt" | "granted" | "denied" | "error"

export interface ParkedCarSession {
  carparkNo: string
  address: string
  lat: number
  lng: number
  agency?: string
  parkedAt: string // ISO timestamp
  deck?: string
  lotNumber?: string
  photoUrl?: string
  notes?: string
}
