import Link from "next/link"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type ButtonProps = ComponentProps<typeof Button>

type ButtonLinkProps = {
  href: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
  children: React.ReactNode
  external?: boolean
} & Omit<ButtonProps, "render" | "nativeButton" | "children">

/**
 * A Button that renders as a navigation link.
 * base-ui's Button uses the `render` prop for polymorphism (not `asChild`),
 * and requires `nativeButton={false}` when the rendered element is not a <button>.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  external,
  ...props
}: ButtonLinkProps) {
  const rendered = external ? (
    <a href={href} />
  ) : href.startsWith("#") ? (
    <a href={href} />
  ) : (
    <Link href={href} />
  )

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      nativeButton={false}
      render={rendered}
      {...props}
    >
      {children}
    </Button>
  )
}
