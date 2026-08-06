"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

/**
 * App-wide client providers.
 * `reducedMotion="user"` makes every framer-motion animation automatically
 * respect the OS "prefers-reduced-motion" setting (transforms are neutralised,
 * opacity kept), so we honour accessibility without touching each component.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
