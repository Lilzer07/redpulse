"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

type Props = {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, decimals = 0, prefix = "", suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 40, stiffness: 90 })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      setDisplay(
        latest.toLocaleString("fr-FR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      )
    })
    return () => unsub()
  }, [spring, decimals])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
