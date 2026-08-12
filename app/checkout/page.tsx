import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { pricingPlans } from "@/lib/data"

export const dynamic = "force-dynamic"

/**
 * Server-side bridge to Stripe Checkout (spec: identify the paying user).
 *
 * This page never renders UI: it resolves the signed-in user and redirects to
 * the plan's Stripe Payment Link, tagging it with `client_reference_id` so the
 * webhook can map the payment back to this exact account. Access itself is only
 * ever granted later by the signed Stripe webhook, never here.
 *
 * Anonymous visitors are sent through login first and bounced straight back, so
 * the CTA works whether or not the user is already authenticated.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const target = pricingPlans.find((p) => p.id === plan)

  // Unknown or missing plan: send the visitor back to the pricing section.
  if (!target) redirect("/#tarifs")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/checkout?plan=${target.id}`)}`)
  }

  // client_reference_id is the only fully reliable key the webhook can trust to
  // attribute the payment; prefilled_email just saves the user a keystroke.
  const link = new URL(target.checkoutUrl)
  link.searchParams.set("client_reference_id", user.id)
  if (user.email) link.searchParams.set("prefilled_email", user.email)

  redirect(link.toString())
}
