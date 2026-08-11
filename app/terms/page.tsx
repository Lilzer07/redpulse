import type { Metadata } from "next"
import { TermsContent } from "@/components/legal/terms-content"

export const metadata: Metadata = {
  title: "Conditions générales — RedPulse",
  description:
    "Conditions générales d'utilisation de RedPulse, outil de surveillance football en temps réel.",
}

export default function TermsPage() {
  return <TermsContent />
}
