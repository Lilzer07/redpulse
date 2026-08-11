// Aggregates the real integration state for the dashboard panel.
import "server-only"

import { readBudgetUsage } from "./budget"
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

  // Deliberately does NOT call the provider. On the free tier every request
  // counts, and a dashboard that spent quota on each page view would starve the
  // monitor it is reporting on. The locally tracked counter is authoritative for
  // spend, and the monitor's own last run tells us whether the API is answering.
  const usage = await readBudgetUsage()

  return {
    ...base,
    configured: true,
    // "Reachable" is inferred from the last real monitor run rather than a fresh
    // probe: a successful run is proof the API answered, and a recorded error is
    // proof it did not.
    reachable: monitor?.lastError == null && monitor?.lastCheckedAt != null,
    requestsCurrent: usage?.used ?? null,
    requestsLimit: usage?.budget ?? null,
    error: monitor?.lastError ?? null,
  }
}
