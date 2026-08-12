import { Topbar } from "@/components/dashboard/topbar"
import { TelegramForm } from "@/components/dashboard/telegram-form"
import { TelegramHelp } from "@/components/dashboard/telegram-help"
import { getTelegramJourney, getTelegramSettings, hasActiveSubscription } from "@/lib/user-data"

export default async function TelegramPage() {
  // Three independent gates: billing, linkage, and channel membership. They are
  // read separately because each can be true without the others, and the UI must
  // name the exact step that is missing rather than collapsing them into "connecté".
  const [settings, subscriptionActive, journey] = await Promise.all([
    getTelegramSettings(),
    hasActiveSubscription(),
    getTelegramJourney(),
  ])
  const connected = Boolean(settings?.chat_id) && settings?.access_status === "active"

  return (
    <>
      <Topbar section="telegram" />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <TelegramForm
            connected={connected}
            subscriptionActive={subscriptionActive}
            inChannel={journey.inChannel}
            pendingInvite={journey.inviteLink}
          />
          <TelegramHelp />
        </div>
      </div>
    </>
  )
}
