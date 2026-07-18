"use client"

import { useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useParkingStore } from "@/store/useParkingStore"
import { getAvailabilityStatus } from "@/lib/carpark-utils"

const ONEMAP_TILES =
  "https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"

const getMapPadding = (hasSelectedCarpark: boolean = false) => {
  if (typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 }
  const isDesktop = window.innerWidth >= 768
  return isDesktop
    ? { top: 0, bottom: hasSelectedCarpark ? 120 : 0, left: 0, right: 450 }
    : { top: 0, bottom: window.innerHeight * (hasSelectedCarpark ? 0.6 : 0.45), left: 0, right: 0 }
}

const STATUS_MUTED: Record<string, { bg: string; border: string; shadow: string }> = {
  healthy: { bg: "#7FB069", border: "#7FB069", shadow: "rgba(127, 176, 105, 0.4)" },
  limited: { bg: "#E9C46A", border: "#E9C46A", shadow: "rgba(233, 196, 106, 0.4)" },
  very_limited: { bg: "#E76F51", border: "#E76F51", shadow: "rgba(231, 111, 81, 0.4)" },
  full: { bg: "#D62828", border: "#D62828", shadow: "rgba(214, 40, 40, 0.4)" },
  unknown: { bg: "#E5E5E5", border: "#D4D4D4", shadow: "rgba(0, 0, 0, 0.1)" },
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const destMarkerRef = useRef<maplibregl.Marker | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)

  const { destination, carparks, selectedCarpark, setSelectedCarpark, setMapView, userLocation } =
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
      padding: getMapPadding(!!selectedCarpark),
      duration: 1500,
    })

    return clearDestinationMarker
  }, [destination, clearDestinationMarker, selectedCarpark])

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
        padding: getMapPadding(!!selectedCarpark),
        duration: 1200,
      })
    }

    return clearUserLocationMarker
  }, [userLocation, clearUserLocationMarker, destination, selectedCarpark])

  // Fly to selected carpark
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedCarpark) return

    map.flyTo({
      center: [selectedCarpark.lng, selectedCarpark.lat],
      zoom: 16,
      padding: getMapPadding(true),
      duration: 800,
    })
  }, [selectedCarpark])

  // Handle Carpark Markers Creation
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    carparks.forEach((cp, i) => {
      const el = document.createElement("div")
      // Start with neutral style
      el.innerHTML = `
        <div class="flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 animate-marker-in relative overflow-hidden" 
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
  }, [carparks, clearMarkers, setSelectedCarpark]) // Removed selectedCarpark to prevent recreation

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
        // Selected marker: Full size, bright colors, shimmering glow
        el.className = "flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden scale-110 z-20"
        el.style.background = c.bg
        el.style.border = "3px solid white"
        el.style.boxShadow = `0 4px 16px ${c.shadow}, 0 0 0 4px rgba(255,255,255,0.4)`
        el.style.opacity = "1"
        el.style.minWidth = "36px"
        el.style.height = "36px"
        el.style.padding = "0 8px"
        span.style.fontSize = "13px"
        span.style.color = "white"
        shimmer.classList.add("animate-shimmer")
        shimmer.classList.remove("opacity-0")
      } else {
        // Unselected nearby markers: retain color but dim if another is selected
        el.className = "flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden scale-100 z-10 hover:scale-110"
        el.style.background = c.bg
        el.style.border = "2px solid white"
        el.style.boxShadow = `0 2px 8px ${c.shadow}`
        el.style.opacity = selectedCarpark ? "0.4" : "0.95"
        el.style.minWidth = "24px"
        el.style.height = "24px"
        el.style.padding = isUnknown ? "0" : "0 6px"
        span.style.fontSize = isUnknown ? "0px" : "10px"
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