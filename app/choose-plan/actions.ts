"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { SubscriptionPlan } from "@/lib/user-data"

const PLANS: SubscriptionPlan[] = ["monthly", "lifetime"]

/**
 * TEMPORARY — grants dashboard access without taking payment.
 *
 * Stripe is not wired up yet, so this exists only so the app stays usable in
 * the meantime. DELETE this action, and the "continue without paying" link in
 * app/choose-plan/plan-picker.tsx, as soon as checkout goes live: any visitor
 * who reaches it gets a paid plan for free.
 */
export async function activatePlanWithoutPayment(plan: SubscriptionPlan) {
  if (!PLANS.includes(plan)) return { ok: false, error: "unknown-plan" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "not-authenticated" }

  // A monthly plan needs an end date for hasActiveSubscription() to accept it;
  // a lifetime one stays valid with none.
  const currentPeriodEnd =
    plan === "monthly" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan,
      status: "active",
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}
