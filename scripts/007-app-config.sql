-- 007 — Server-owned configuration store.
--
-- Purpose: hold secrets the app provisions for itself at runtime, so no manual
-- environment configuration is required. Today it holds the Stripe webhook
-- signing secret that lib/stripe/provision.ts creates through the Stripe API.
--
-- Security: RLS is enabled and NO policy is created, so this table is
-- unreachable with the anon key. Only the service-role client (server-side) can
-- read or write it. Never expose these values to the browser.

create table if not exists app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

-- Deliberately no policies: service-role bypasses RLS, everyone else is denied.

comment on table app_config is
  'Server-only config/secrets provisioned at runtime. RLS on, no policies: service-role access only.';
