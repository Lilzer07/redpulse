import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const ids = ["sub_1U6gIyDrT6M69ULaY6PFa2dU","sub_1U6WPPDrT6M69ULaPcFGhzTe","sub_1U5xzKDrT6M69ULaXYQhNKaN"]
for (const id of ids) {
  try {
    const s = await stripe.subscriptions.retrieve(id)
    console.log(id, "=> status:", s.status, "cancel_at_period_end:", s.cancel_at_period_end, "cancel_at:", s.cancel_at)
  } catch(e) {
    console.log(id, "=> ERROR:", e.type || e.name, "-", e.message)
  }
}
