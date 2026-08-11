-- Daily API request budget tracking.
--
-- The project runs on API-Football's free tier (100 requests/day). One monitor
-- pass costs 1 request for the live-fixture list plus 1 per live fixture, so an
-- unguarded pass on a busy Saturday can burn the entire day's quota at once and
-- leave the service dead until midnight UTC.
--
-- These columns let the monitor reserve budget before spending it, and reset
-- automatically when the provider's quota day rolls over.

alter table public.monitor_state
  add column if not exists api_requests_used integer not null default 0;

alter table public.monitor_state
  -- The provider resets quota at midnight UTC, so the day is tracked as a plain
  -- date in UTC rather than a timestamp.
  add column if not exists api_quota_date date not null default (now() at time zone 'utc')::date;

comment on column public.monitor_state.api_requests_used is
  'Requests spent against the API-Football daily quota during api_quota_date.';
comment on column public.monitor_state.api_quota_date is
  'UTC day the api_requests_used counter applies to; a newer date resets the counter.';

/**
 * Atomically reserves up to `wanted` requests from today's budget.
 *
 * Returns how many were actually granted, which may be fewer than requested (or
 * zero) when the budget is exhausted. `SELECT ... FOR UPDATE` serialises
 * concurrent callers on the single state row, so two monitor runs can never both
 * reserve the same last request and overshoot the provider's daily limit.
 */
create or replace function public.reserve_api_requests(wanted integer, daily_budget integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
  used integer;
  quota_day date;
  granted integer;
begin
  if wanted is null or wanted <= 0 or daily_budget is null or daily_budget <= 0 then
    return 0;
  end if;

  -- Blocks any concurrent reservation until this transaction commits.
  select api_requests_used, api_quota_date
  into used, quota_day
  from public.monitor_state
  where id = true
  for update;

  if not found then
    return 0;
  end if;

  -- A new UTC day means the provider's counter reset, so ours does too.
  if quota_day < today then
    used := 0;
  end if;

  granted := least(wanted, greatest(daily_budget - used, 0));

  update public.monitor_state
  set api_requests_used = used + granted,
      api_quota_date = today
  where id = true;

  return granted;
end;
$$;

-- Only the service role may spend budget; clients must never touch the counter.
revoke all on function public.reserve_api_requests(integer, integer) from public, anon, authenticated;
