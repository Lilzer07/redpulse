// Aggregates the real integration state for the dashboard panel.
import "server-only"

import { fetchAccountStatus } from "./api"
import { hasApiKey } from "./client"
import { enabledCompetitions } from "./competitions"
import { readMonitorState } from "./dedupe"
import type { IntegrationStatusView } from "@/components/dashboard/integration-status"

/**
 * Builds the dashboard's integration view.
 *
 * When the key is absent we skip the network call entirely: there is nothing to
 * ask, and reporting "unreachable" would misattribute a setup gap to an outage.
 */
export async function getIntegrationStatus(): Promise<IntegrationStatusView> {
  const monitor = await readMonitorState()

  const base = {
    competitionsMonitored: enabledCompetitions().length,
    lastCheckedAt: monitor?.lastCheckedAt ?? null,
    matchesWatched: monitor?.matchesWatched ?? 0,
    redCardsDetected: monitor?.redCardsDetected ?? 0,
  }

  if (!hasApiKey()) {
    return {
      ...base,
      configured: false,
      reachable: false,
      requestsCurrent: null,
      requestsLimit: null,
      error: "FOOTBALL_API_KEY is not set for this environment.",
    }
  }

  const status = await fetchAccountStatus()

  return {
    ...base,
    configured: true,
    reachable: status.ok,
    requestsCurrent: status.ok ? status.requests.current : null,
    requestsLimit: status.ok ? status.requests.limitDay : null,
    error: status.ok ? (monitor?.lastError ?? null) : status.error,
  }
}
