import { Topbar } from "@/components/dashboard/topbar"
import { BillingPanel } from "@/components/dashboard/billing-panel"
import { getSubscription, hasActiveSubscription } from "@/lib/user-data"

/**
 * Billing page.
 *
 * A server component so the plan, status and renewal date come from the row the
 * Stripe webhook writes rather than from hardcoded copy. The previous version
 * showed a fixed "•••• 4242" card and a list of invented invoices, which looked
 * convincing while being entirely false — worse than showing nothing, because a
 * user could not tell it apart from real billing data.
 */
export default async function BillingPage() {
  const [subscription, active] = await Promise.all([getSubscription(), hasActiveSubscription()])

  return (
    <>
      <Topbar section="billing" />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Feature bullets live in the dictionary so both languages stay in sync. */}
          <BillingPanel subscription={subscription} active={active} />
        </div>
      </div>
    </>
  )
}
