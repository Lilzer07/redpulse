-- RedMatch — red-card monitoring, deduplication and Telegram authorization.
--
-- Unlike the tables in 001, the two tables below are NOT per-user: a red card in
-- Marseille-Lyon is a single global fact that must be detected exactly once, then
-- fanned out to every eligible subscriber. They are therefore written only by the
-- server (service role, which bypasses RLS). RLS stays enabled with no
-- permissive policy, so a logged-in user holding the anon key cannot read or
-- forge monitoring rows.

-- ------------------------------------------------------- red card events ----
-- The deduplication ledger. One row per real expulsion, ever.
create table if not exists public.red_card_events (
  id uuid primary key default gen_random_uuid(),

  -- Stable identity of the expulsion, built from API-Football ids
  -- (fixture + team + player + minute + detail). The unique constraint on this
  -- column is what makes duplicate alerts structurally impossible: concurrent
  -- monitor runs race on the same key and exactly one insert survives.
  event_key text not null unique,

  fixture_id bigint not null,
  league_id integer not null,
  league_name text not null,
  country text,
  season integer,

  home_team text not null,
  away_team text not null,
  home_score integer not null default 0,
  away_score integer not null default 0,

  player text not null,
  team text not null,
  minute integer not null check (minute between 0 and 130),
  minute_extra integer,
  -- API-Football event detail, e.g. 'Red Card' or 'Second Yellow card'.
  detail text not null,
  fixture_status text,

  -- AI analysis, filled in after detection. Percentages are 0-100 and
  -- confidence is on a 0-100 scale (never 0-10).
  extra_goal_prob integer check (extra_goal_prob between 0 and 100),
  favorite_win_prob integer check (favorite_win_prob between 0 and 100),
  confidence integer check (confidence between 0 and 100),
  analysis_favorite text,

  detected_at timestamptz not null default now(),
  -- Set once fan-out to subscribers finished, so an interrupted run can be
  -- retried without re-alerting.
  dispatched_at timestamptz
);

create index if not exists red_card_events_detected_idx
  on public.red_card_events (detected_at desc);
create index if not exists red_card_events_fixture_idx
  on public.red_card_events (fixture_id);

alter table public.red_card_events enable row level security;

-- Deliberately no policies: server-side (service role) access only.
drop policy if exists "red_card_events_no_client_access" on public.red_card_events;

-- ------------------------------------------------------- monitor state -----
-- Single-row table describing the health of the polling loop. Powers the
-- "API FOOTBALL" dashboard block without leaking the API key.
create table if not exists public.monitor_state (
  id boolean primary key default true check (id),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  matches_watched integer not null default 0,
  red_cards_detected integer not null default 0,
  last_alert_at timestamptz,
  -- Guards against overlapping monitor runs (section 6): a run refuses to start
  -- while a recent lock is held.
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.monitor_state (id) values (true) on conflict (id) do nothing;

alter table public.monitor_state enable row level security;

drop policy if exists "monitor_state_no_client_access" on public.monitor_state;

-- --------------------------------------------- telegram access + statuses --
-- Section 11: a registered Telegram chat is NOT sufficient authorization. The
-- server must independently confirm the subscription is active before sending,
-- and be able to revoke access when it lapses.
alter table public.telegram_settings
  add column if not exists access_status text not null default 'pending';

alter table public.telegram_settings
  add column if not exists revoked_at timestamptz;

do $$
begin
  alter table public.telegram_settings
    add constraint telegram_settings_access_status_check
    check (access_status in ('pending', 'active', 'revoked', 'suspended'));
exception
  when duplicate_object then null;
end $$;

-- Section 13: allow subscriptions to be marked expired/suspended by the
-- automatic expiry sweep, on top of the Stripe-driven statuses.
do $$
begin
  alter table public.subscriptions drop constraint if exists subscriptions_status_check;
  alter table public.subscriptions
    add constraint subscriptions_status_check
    check (status in (
      'incomplete', 'trialing', 'active', 'past_due',
      'canceled', 'expired', 'suspended'
    ));
end $$;

-- ------------------------------------------------------- expiry sweep ------
-- Flips lapsed subscriptions to 'expired' and revokes their Telegram access in
-- one transaction, so authorization can never drift from billing state. Called
-- from the server (cron/monitor), never from the browser.
create or replace function public.expire_lapsed_subscriptions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  with lapsed as (
    update public.subscriptions
       set status = 'expired',
           updated_at = now()
     where status in ('active', 'trialing', 'past_due')
       and current_period_end is not null
       and current_period_end < now()
    returning user_id
  )
  update public.telegram_settings ts
     set access_status = 'revoked',
         revoked_at = now(),
         updated_at = now()
    from lapsed
   where ts.user_id = lapsed.user_id
     and ts.access_status <> 'revoked';

  select count(*) into affected
    from public.subscriptions
   where status = 'expired';

  return affected;
end;
$$;

revoke all on function public.expire_lapsed_subscriptions() from anon, authenticated;
