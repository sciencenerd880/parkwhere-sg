"use client"

import { useParkingStore } from "@/store/useParkingStore"
import { fetchAllLtaCarparks } from "@/lib/lta-api"
import FavouriteCard from "./FavouriteCard"
import { useEffect, useState } from "react"
import type { CarparkWithDistance } from "@/types"

export default function FavouriteList() {
  const favorites = useParkingStore((s) => s.favorites)
  const setDestination = useParkingStore((s) => s.setDestination)
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery)
  const [favouriteCarparks, setFavouriteCarparks] = useState<
    CarparkWithDistance[]
  >([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const all = await fetchAllLtaCarparks()
      if (cancelled) return
      const matched: CarparkWithDistance[] = []
      for (const no of favorites) {
        const cp = all.find((c) => c.carParkId === no)
        if (cp) {
          matched.push({
            carparkNo: cp.carParkId,
            address: cp.development,
            lat: cp.lat,
            lng: cp.lng,
            agency: cp.agency,
            distance: 0,
            lotsAvailable: cp.availableLots,
            totalLots: null,
            lastUpdated: null,
            availabilityStatus: "unknown",
          })
        }
      }
      setFavouriteCarparks(matched)
    }
    load()
    return () => { cancelled = true }
  }, [favorites])

  if (favorites.length === 0) return null

  const handleNavigate = (cp: CarparkWithDistance) => {
    setSearchQuery(cp.address)
    setDestination({
      lat: cp.lat,
      lng: cp.lng,
      name: cp.address,
      address: cp.address,
    })
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <p className="text-[12px] font-medium text-neutral-500">
          {favouriteCarparks.length} saved carpark
          {favouriteCarparks.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {favouriteCarparks.map((cp) => (
          <FavouriteCard
            key={cp.carparkNo}
            carpark={cp}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  )
}
