"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface OdometerProps {
  value: number | null
  className?: string
  suffix?: string
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function DigitColumn({ digit, delayMs = 0 }: { digit: string; delayMs?: number }) {
  const isNumber = !Number.isNaN(Number(digit)) && digit.trim() !== ""

  if (!isNumber) {
    return <span className="inline-block">{digit}</span>
  }

  const num = Number(digit)

  return (
    <span
      className="inline-block h-[1em] overflow-hidden align-top select-none font-mono tabular-nums leading-none"
      style={{ width: "0.62em" }}
      aria-hidden="true"
    >
      <span
        className="flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
        style={{
          transform: `translateY(-${num * 10}%)`,
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1em] flex items-center justify-center">
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function Odometer({ value, className, suffix }: OdometerProps) {
  const componentId = useId()

  if (value === null || value === undefined) {
    return (
      <span className={cn("inline-flex items-baseline font-mono tabular-nums", className)}>
        —{suffix && <span className="ml-1 text-[0.5em] font-sans font-medium">{suffix}</span>}
      </span>
    )
  }

  const digits = String(value).split("")

  return (
    <span
      key={`${componentId}-${value}`}
      aria-label={`${value}${suffix ? ` ${suffix}` : ""}`}
      className={cn("inline-flex items-baseline font-mono tabular-nums", className)}
    >
      <span className="inline-flex items-baseline overflow-hidden h-[1em]">
        {digits.map((d, index) => (
          <DigitColumn
            key={index}
            digit={d}
            delayMs={(digits.length - 1 - index) * 35}
          />
        ))}
      </span>
      {suffix && (
        <span className="ml-1 text-[0.45em] font-sans font-medium opacity-80 self-baseline">
          {suffix}
        </span>
      )}
    </span>
  )
}
