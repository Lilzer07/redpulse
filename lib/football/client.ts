// Server-only API-Football client (spec sections 1 and 18).
//
// The key is read from process.env.FOOTBALL_API_KEY inside the request functions
// and never returned to a caller, logged, or included in an error message. This
// module must never be imported from a Client Component; `server-only` turns any
// such import into a build error rather than a silent key leak.
import "server-only"

const BASE_URL = "https://v3.football.api-sports.io"
const DEFAULT_TIMEOUT_MS = 10_000

export type FootballApiError = {
  kind: "missing_key" | "auth" | "rate_limit" | "timeout" | "network" | "invalid_response" | "http"
  message: string
  status?: number
}

export class FootballApiFailure extends Error {
  readonly kind: FootballApiError["kind"]
  readonly status?: number

  constructor(error: FootballApiError) {
    super(error.message)
    this.name = "FootballApiFailure"
    this.kind = error.kind
    this.status = error.status
  }
}

/** True when the key is configured at all. Never exposes the value itself. */
export function hasApiKey(): boolean {
  const key = process.env.FOOTBALL_API_KEY
  return typeof key === "string" && key.trim().length > 0
}

type RequestOptions = {
  /** Query parameters; undefined values are dropped. */
  params?: Record<string, string | number | undefined>
  /**
   * Seconds to cache the response. API-Football data changes at very different
   * rates: league metadata is stable for days, live fixtures for seconds.
   * Caching is what keeps the request count sane (spec section 1).
   */
  revalidate?: number
  timeoutMs?: number
}

/**
 * Performs one API-Football request and returns its `response` array.
 *
 * Throws `FootballApiFailure` with a machine-readable `kind` so callers can
 * distinguish "your key is wrong" from "the network blipped" without parsing
 * message strings.
 */
export async function apiFootballRequest<T>(path: string, options: RequestOptions = {}): Promise<T[]> {
  const key = process.env.FOOTBALL_API_KEY?.trim()
  if (!key) {
    throw new FootballApiFailure({
      kind: "missing_key",
      message: "FOOTBALL_API_KEY is not configured on the server.",
    })
  }

  const url = new URL(`${BASE_URL}${path}`)
  for (const [name, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(name, String(value))
    }
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(url, {
      headers: { "x-apisports-key": key },
      signal: controller.signal,
      // `revalidate: 0` would disable caching entirely; live endpoints pass a
      // small positive value instead so bursts of dashboard requests collapse
      // into a single upstream call.
      next: options.revalidate === undefined ? { revalidate: 0 } : { revalidate: options.revalidate },
    })
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError"
    throw new FootballApiFailure({
      kind: aborted ? "timeout" : "network",
      message: aborted
        ? `API-Football did not respond within ${timeoutMs}ms.`
        : `Could not reach API-Football: ${error instanceof Error ? error.message : "unknown error"}`,
    })
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 429) {
    throw new FootballApiFailure({
      kind: "rate_limit",
      message: "API-Football request quota exceeded.",
      status: 429,
    })
  }
  if (response.status === 401 || response.status === 403) {
    throw new FootballApiFailure({
      kind: "auth",
      message: "API-Football rejected the key (invalid or inactive subscription).",
      status: response.status,
    })
  }
  if (!response.ok) {
    throw new FootballApiFailure({
      kind: "http",
      message: `API-Football returned HTTP ${response.status}.`,
      status: response.status,
    })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new FootballApiFailure({ kind: "invalid_response", message: "API-Football returned malformed JSON." })
  }

  if (typeof payload !== "object" || payload === null) {
    throw new FootballApiFailure({ kind: "invalid_response", message: "API-Football returned an unexpected payload." })
  }

  // API-Football answers 200 with a populated `errors` field for auth and plan
  // problems, so a successful HTTP status is not sufficient.
  const envelope = payload as { errors?: unknown; response?: unknown }
  const errorText = normaliseErrors(envelope.errors)
  if (errorText) {
    const isAuth = /token|key|subscription|account/i.test(errorText)
    const isQuota = /limit|quota|requests/i.test(errorText)
    throw new FootballApiFailure({
      kind: isAuth ? "auth" : isQuota ? "rate_limit" : "invalid_response",
      message: `API-Football error: ${errorText}`,
    })
  }

  if (!Array.isArray(envelope.response)) {
    throw new FootballApiFailure({
      kind: "invalid_response",
      message: "API-Football response field was not an array.",
    })
  }

  return envelope.response as T[]
}

/**
 * API-Football uses `errors: []` for success but `{}` or `{token: "..."}` for
 * failures, so the shape has to be normalised before it can be reported.
 */
function normaliseErrors(errors: unknown): string | null {
  if (!errors) return null
  if (Array.isArray(errors)) return errors.length ? errors.map(String).join("; ") : null
  if (typeof errors === "string") return errors.trim() ? errors : null
  if (typeof errors === "object") {
    const entries = Object.entries(errors as Record<string, unknown>)
    if (!entries.length) return null
    return entries.map(([field, message]) => `${field}: ${String(message)}`).join("; ")
  }
  return null
}

/** Human-readable, key-free description of a failure, safe to log or display. */
export function describeFailure(error: unknown): { kind: FootballApiError["kind"] | "unknown"; message: string } {
  if (error instanceof FootballApiFailure) return { kind: error.kind, message: error.message }
  return { kind: "unknown", message: error instanceof Error ? error.message : "Unknown error" }
}
