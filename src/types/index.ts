export interface Destination {
  lat: number
  lng: number
  name: string
  address: string
}

export interface HdbCarpark {
  carparkNo: string
  address: string
  lat: number
  lng: number
  carParkType: string
  parkingSystem: string
  decks: number
  gantryHeight: number
  basement: boolean
}

export interface CarparkAvailability {
  carparkNo: string
  totalLots: number
  lotsAvailable: number
  lotType: string
  updateDateTime: string
}

export type AvailabilityStatus =
  | "healthy"
  | "limited"
  | "very_limited"
  | "full"
  | "unknown"

export interface CarparkWithDistance extends HdbCarpark {
  distance: number
  lotsAvailable: number | null
  totalLots: number | null
  lastUpdated: string | null
  availabilityStatus: AvailabilityStatus
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
