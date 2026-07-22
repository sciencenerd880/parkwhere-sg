"use client"

import Lottie from "lottie-react"
import animationData from "@/../public/loading-map.json"

export default function MapLoadingAnimation({
  className,
}: {
  className?: string
}) {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className={className}
    />
  )
}
