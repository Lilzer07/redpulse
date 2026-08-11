-- RedMatch — subscription state, one row per user.
-- The dashboard is gated on this table: no active row means no access. Stripe
-- is not wired up yet, so rows are currently created by the temporary
-- "continue without paying" action (see app/choose-plan/actions.ts). Once
-- Stripe is connected, the webhook becomes the only writer.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Matches the plan ids in lib/data.ts: 'monthly' | 'lifetime'.
  plan text not null check (plan in ('monthly', 'lifetime')),
  -- 'active' and 'trialing' grant access; anything else does not.
  status text not null default 'incomplete'
    check (status in ('incomplete', 'trialing', 'active', 'past_due', 'canceled')),
  -- Null for the lifetime plan, which never expires.
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscriptions_update_own" on public.subscriptions;
drop policy if exists "subscriptions_delete_own" on public.subscriptions;

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id);
create policy "subscriptions_delete_own" on public.subscriptions for delete using (auth.uid() = user_id);
