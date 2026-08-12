import { Topbar } from "@/components/dashboard/topbar"
import { TelegramForm } from "@/components/dashboard/telegram-form"
import { TelegramHelp } from "@/components/dashboard/telegram-help"
import { getTelegramSettings, hasActiveSubscription } from "@/lib/user-data"

export default async function TelegramPage() {
  // Linking state and billing state are independent gates: a chat can be linked
  // while the subscription has lapsed, and the UI must say so honestly.
  const [settings, subscriptionActive] = await Promise.all([getTelegramSettings(), hasActiveSubscription()])
  const connected = Boolean(settings?.chat_id) && settings?.access_status === "active"

  return (
    <>
      <Topbar section="telegram" />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <TelegramForm connected={connected} subscriptionActive={subscriptionActive} />
          <TelegramHelp />
        </div>
      </div>
    </>
  )
}
