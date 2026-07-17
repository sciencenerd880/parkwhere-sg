"use client"

import { useState, useCallback, useRef } from "react"
import { searchDestination } from "@/lib/onemap"
import { useParkingStore } from "@/store/useParkingStore"
import type { OneMapSearchResult } from "@/types"

export function useDestinationSearch() {
  const [suggestions, setSuggestions] = useState<OneMapSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const { setDestination, setIsSearching } = useParkingStore()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    async (query: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      if (query.length < 2) {
        setSuggestions([])
        setOpen(false)
        return
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchDestination(query)
          setSuggestions(results)
          setOpen(results.length > 0)
        } catch {
          setSuggestions([])
        }
      }, 300)
    },
    [],
  )

  const selectResult = useCallback(
    (result: OneMapSearchResult) => {
      setDestination({
        lat: result.lat,
        lng: result.lng,
        name: result.name,
        address: result.address,
      })
      setSuggestions([])
      setOpen(false)
    },
    [setDestination],
  )

  return { suggestions, open, setOpen, search, selectResult, setIsSearching }
}
