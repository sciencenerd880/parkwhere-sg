"use client"

import Lottie from "lottie-react"
import animationData from "@/../public/heart-fav.json"
import { useEffect, useRef } from "react"
import type { LottieRefCurrentProps } from "lottie-react"

interface HeartAnimationProps {
  onComplete: () => void
}

export default function HeartAnimation({ onComplete }: HeartAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    const timer = setTimeout(onComplete, 1200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay
        className="h-24 w-24"
      />
    </div>
  )
}
