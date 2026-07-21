"use client"

import { useParkingStore } from "@/store/useParkingStore"
import hdbCarparks from "@/data/hdb-carparks.json"
import FavouriteCard from "./FavouriteCard"
import type { HdbCarpark } from "@/types"

export default function FavouriteList() {
  const favorites = useParkingStore((s) => s.favorites)
  const setDestination = useParkingStore((s) => s.setDestination)
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery)

  if (favorites.length === 0) return null

  const favouriteCarparks: HdbCarpark[] = []
  for (const no of favorites) {
    const cp = (hdbCarparks as HdbCarpark[]).find((c) => c.carparkNo === no)
    if (cp) favouriteCarparks.push(cp)
  }

  if (favouriteCarparks.length === 0) return null

  const handleNavigate = (cp: HdbCarpark) => {
    setSearchQuery(cp.address)
    setDestination({
      lat: cp.lat,
      lng: cp.lng,
      name: cp.address,
      address: cp.address,
    })
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <p className="text-[12px] font-medium text-neutral-500">
          {favouriteCarparks.length} saved carpark{favouriteCarparks.length !== 1 ? "s" : ""}
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
