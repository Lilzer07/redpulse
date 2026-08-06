"use client"

import { useEffect, useRef } from "react"
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

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    // Write straight to the DOM on each spring frame instead of setState,
    // so the count-up never triggers a React re-render (better INP).
    const format = (n: number) =>
      n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    if (ref.current) ref.current.textContent = `${prefix}${format(0)}${suffix}`
    const unsub = spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${format(latest)}${suffix}`
    })
    return () => unsub()
  }, [spring, decimals, prefix, suffix])

  // Render the final value in the server/initial HTML for SEO + no layout shift.
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
