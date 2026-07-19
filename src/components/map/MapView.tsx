"use client"

import { useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useParkingStore } from "@/store/useParkingStore"
import { filterCarparks, getAvailabilityStatus } from "@/lib/carpark-utils"

const ONEMAP_TILES =
  "https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"

const getMapPadding = (opts: { hasDestination: boolean; hasSelectedCarpark: boolean; drawerExpanded: boolean }) => {
  if (typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 }
  const isDesktop = window.innerWidth >= 768
  if (isDesktop) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }
  return {
    top: 0,
    bottom: opts.hasDestination
      ? window.innerHeight * (
          opts.drawerExpanded
            ? 0.8
            : opts.hasSelectedCarpark
              ? 0.42
              : 0.55
        )
      : opts.hasSelectedCarpark
        ? window.innerHeight * 0.6
        : 0,
    left: 0,
    right: 0,
  }
}

const STATUS_MUTED: Record<string, { bg: string; shadow: string }> = {
  healthy: { bg: "#2E9E63", shadow: "rgba(46, 158, 99, 0.4)" },
  limited: { bg: "#E8A33D", shadow: "rgba(232, 163, 61, 0.4)" },
  very_limited: { bg: "#E2762E", shadow: "rgba(226, 110, 46, 0.4)" },
  full: { bg: "#D64541", shadow: "rgba(214, 69, 65, 0.4)" },
  unknown: { bg: "#D4D4D4", shadow: "rgba(0, 0, 0, 0.1)" },
}

export default function MapView({ drawerExpanded = false }: { drawerExpanded?: boolean }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const destMarkerRef = useRef<maplibregl.Marker | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)

  const { destination, carparks, selectedCarpark, setSelectedCarpark, setMapView, userLocation, availableNowOnly } =
    useParkingStore()

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    markerElementsRef.current.clear()
  }, [])

  const clearDestinationMarker = useCallback(() => {
    if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }
  }, [])

  const clearUserLocationMarker = useCallback(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          onemap: {
            type: "raster",
            tiles: [ONEMAP_TILES],
            tileSize: 256,
            attribution: "© Singapore Land Authority",
          },
        },
        layers: [
          {
            id: "onemap",
            type: "raster",
            source: "onemap",
          },
        ],
      },
      center: [103.8198, 1.3521],
      zoom: 11,
    })

    map.on("moveend", () => {
      const center = map.getCenter()
      setMapView({
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom(),
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [setMapView])

  // Handle Destination Marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !destination) return

    clearDestinationMarker()

    const el = document.createElement("div")
    el.className = "flex items-center justify-center"
    el.innerHTML = `
      <div class="flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all duration-200" style="background: #007AFF; border: 2.5px solid rgba(255,255,255,0.95); box-shadow: 0 4px 14px rgba(0,122,255,0.4), 0 0 0 4px rgba(0,122,255,0.15);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
    `
    const child = el.firstElementChild as HTMLElement

    const marker = new maplibregl.Marker({ element: child })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map)

    destMarkerRef.current = marker

    const popup = new maplibregl.Popup({ offset: 18 }).setText(
      destination.name || destination.address,
    )
    marker.setPopup(popup)

    map.flyTo({
      center: [destination.lng, destination.lat],
      zoom: 15,
      padding: getMapPadding({ hasDestination: true, hasSelectedCarpark: !!selectedCarpark, drawerExpanded }),
      duration: 1500,
    })

    return clearDestinationMarker
  }, [destination, clearDestinationMarker, selectedCarpark, drawerExpanded])

  // Handle User Location Marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) return

    clearUserLocationMarker()

    const el = document.createElement("div")
    el.className = "flex items-center justify-center"
    el.innerHTML = `
      <div class="relative flex items-center justify-center w-[22px] h-[22px]">
        <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="relative w-[14px] h-[14px] rounded-full bg-blue-500 border-[2.5px] border-white shadow-[0_2px_8px_rgba(0,122,255,0.4)]"></div>
      </div>
    `
    const child = el.firstElementChild as HTMLElement

    const marker = new maplibregl.Marker({ element: child })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map)

    userMarkerRef.current = marker

    if (!destination) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        padding: getMapPadding({ hasDestination: false, hasSelectedCarpark: !!selectedCarpark, drawerExpanded }),
        duration: 1200,
      })
    }

    return clearUserLocationMarker
  }, [userLocation, clearUserLocationMarker, destination, selectedCarpark, drawerExpanded])

  // Fly to selected carpark
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedCarpark) return

    const hasDest = !!destination
    map.flyTo({
      center: [selectedCarpark.lng, selectedCarpark.lat],
      zoom: 16,
      padding: getMapPadding({ hasDestination: hasDest, hasSelectedCarpark: true, drawerExpanded }),
      duration: 800,
    })
  }, [selectedCarpark, destination, drawerExpanded])

  // Handle Carpark Markers Creation
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    filterCarparks(carparks, availableNowOnly).forEach((cp, i) => {
      const el = document.createElement("div")
      // Start with neutral style
      el.innerHTML = `
        <div class="flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 animate-marker-in overflow-hidden"
             style="animation-delay: ${i * 30}ms;">
          <div class="marker-shimmer absolute inset-0 bg-white/40 pointer-events-none opacity-0"></div>
          <span class="marker-label font-bold text-white z-10 transition-colors duration-300"></span>
        </div>
      `
      const child = el.firstElementChild as HTMLElement

      child.addEventListener("click", () => {
        setSelectedCarpark(cp)
      })

      const marker = new maplibregl.Marker({ element: child })
        .setLngLat([cp.lng, cp.lat])
        .addTo(map)

      markersRef.current.push(marker)
      markerElementsRef.current.set(cp.carparkNo, child)
    })
  }, [carparks, availableNowOnly, clearMarkers, setSelectedCarpark]) // Removed selectedCarpark to prevent recreation

  // Handle Styling for Selected vs Unselected
  useEffect(() => {
    markerElementsRef.current.forEach((el, carparkNo) => {
      const cp = carparks.find((c) => c.carparkNo === carparkNo)
      if (!cp) return

      const isSelected = cp.carparkNo === selectedCarpark?.carparkNo
      const status = getAvailabilityStatus(cp.lotsAvailable)
      const isUnknown = status === "unknown"
      const c = STATUS_MUTED[status]
      const labelText = cp.lotsAvailable !== null ? String(cp.lotsAvailable) : ""
      
      const span = el.querySelector(".marker-label") as HTMLElement
      const shimmer = el.querySelector(".marker-shimmer") as HTMLElement

      span.innerText = isUnknown ? "" : labelText

      if (isSelected) {
        // Selected marker: bigger circle, bright colors, shimmering glow
        el.classList.remove("scale-100", "hover:scale-110")
        el.classList.add("scale-110", "z-20")
        el.classList.remove("z-10")
        el.style.background = c.bg
        el.style.border = "3px solid white"
        el.style.boxShadow = `0 4px 16px ${c.shadow}, 0 0 0 4px rgba(255,255,255,0.4)`
        el.style.opacity = "1"
        el.style.width = "38px"
        el.style.minWidth = "38px"
        el.style.height = "38px"
        el.style.padding = "0"
        span.style.fontSize = isUnknown ? "0px" : labelText.length >= 3 ? "11px" : "13px"
        span.style.color = "white"
        shimmer.classList.add("animate-shimmer")
        shimmer.classList.remove("opacity-0")
      } else {
        // Unselected nearby markers: retain color but dim if another is selected
        el.classList.remove("scale-110", "z-20")
        el.classList.add("scale-100", "z-10", "hover:scale-110")
        el.style.background = c.bg
        el.style.border = "2px solid white"
        el.style.boxShadow = `0 2px 8px ${c.shadow}`
        el.style.opacity = selectedCarpark ? "0.4" : "0.95"
        el.style.width = "28px"
        el.style.minWidth = "28px"
        el.style.height = "28px"
        el.style.padding = "0"
        span.style.fontSize = isUnknown ? "0px" : labelText.length >= 3 ? "9px" : "10px"
        span.style.color = "white"
        shimmer.classList.remove("animate-shimmer")
        shimmer.classList.add("opacity-0")
      }
    })
  }, [selectedCarpark, carparks])

  return (
    <div
      ref={mapContainer}
      className="h-full w-full map-container"
    />
  )
}