import { create } from "zustand"
import type {
  Destination,
  CarparkWithDistance,
  MapViewState,
  UserLocation,
  LocationPermission,
} from "@/types"

interface ParkingStore {
  destination: Destination | null
  selectedCarpark: CarparkWithDistance | null
  carparks: CarparkWithDistance[]
  isLoading: boolean
  isSearching: boolean
  isRefreshing: boolean
  error: string | null
  mapView: MapViewState
  userLocation: UserLocation | null
  locationPermission: LocationPermission

  setDestination: (dest: Destination | null) => void
  setSelectedCarpark: (cp: CarparkWithDistance | null) => void
  setCarparks: (carparks: CarparkWithDistance[]) => void
  setIsLoading: (v: boolean) => void
  setIsSearching: (v: boolean) => void
  setIsRefreshing: (v: boolean) => void
  setError: (err: string | null) => void
  setMapView: (view: MapViewState) => void
  setUserLocation: (loc: UserLocation | null) => void
  setLocationPermission: (status: LocationPermission) => void
}

export const useParkingStore = create<ParkingStore>((set) => ({
  destination: null,
  selectedCarpark: null,
  carparks: [],
  isLoading: false,
  isSearching: false,
  isRefreshing: false,
  error: null,
  mapView: {
    latitude: 1.3521,
    longitude: 103.8198,
    zoom: 11,
  },
  userLocation: null,
  locationPermission: "prompt",

  setDestination: (dest) => set({ destination: dest, selectedCarpark: null }),
  setSelectedCarpark: (cp) => set({ selectedCarpark: cp }),
  setCarparks: (carparks) => set({ carparks }),
  setIsLoading: (v) => set({ isLoading: v }),
  setIsSearching: (v) => set({ isSearching: v }),
  setIsRefreshing: (v) => set({ isRefreshing: v }),
  setError: (err) => set({ error: err }),
  setMapView: (view) => set({ mapView: view }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setLocationPermission: (status) => set({ locationPermission: status }),
}))
