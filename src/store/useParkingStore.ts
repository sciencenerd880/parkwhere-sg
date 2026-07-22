import { create } from "zustand"
import type {
  Destination,
  CarparkWithDistance,
  MapViewState,
  UserLocation,
  LocationPermission,
} from "@/types"
import { useAuthStore } from "@/store/useAuthStore"
import { addFavorite, removeFavorite } from "@/lib/favorites"

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
  favorites: string[]
  searchQuery: string

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
  toggleFavorite: (carparkNo: string) => void
  setFavorites: (favorites: string[]) => void
  setSearchQuery: (q: string) => void
  clearDestination: () => void
}

export const useParkingStore = create<ParkingStore>()((set, get) => ({
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
  favorites: [],
  searchQuery: "",

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
  toggleFavorite: (carparkNo) => {
    const user = useAuthStore.getState().user
    if (!user) {
      useAuthStore.getState().signInWithGoogle()
      return
    }

    const wasFavorite = get().favorites.includes(carparkNo)
    set((s) => ({
      favorites: wasFavorite
        ? s.favorites.filter((n) => n !== carparkNo)
        : [...s.favorites, carparkNo],
    }))

    const mutation = wasFavorite
      ? removeFavorite(user.id, carparkNo)
      : addFavorite(user.id, carparkNo)

    mutation.catch(() => {
      set((s) => ({
        favorites: wasFavorite
          ? [...s.favorites, carparkNo]
          : s.favorites.filter((n) => n !== carparkNo),
        error: "Couldn't update favourites. Please try again.",
      }))
    })
  },
  setFavorites: (favorites) => set({ favorites }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearDestination: () =>
    set({
      destination: null,
      selectedCarpark: null,
      carparks: [],
      error: null,
    }),
}))
