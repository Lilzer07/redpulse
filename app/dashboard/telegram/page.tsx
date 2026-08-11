import { Topbar } from "@/components/dashboard/topbar"
import { TelegramForm } from "@/components/dashboard/telegram-form"
import { TelegramHelp } from "@/components/dashboard/telegram-help"
import { getTelegramSettings } from "@/lib/user-data"

export default async function TelegramPage() {
  // The signed-in user's own credentials, or null if they never saved any.
  const settings = await getTelegramSettings()

  return (
    <>
      <Topbar section="telegram" />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <TelegramForm initial={settings} />
          <TelegramHelp />
        </div>
      </div>
    </>
  )
}
