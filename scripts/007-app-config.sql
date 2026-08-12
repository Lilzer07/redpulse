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
  value text not null,
  updated_at timestamptz not null default now()
);

-- The first cut of this migration used jsonb, which forced every plain secret to
-- be JSON-encoded. Values here are opaque strings, so convert to text. Guarded
-- so re-running on an already-correct table is a no-op.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'app_config' and column_name = 'value' and data_type = 'jsonb'
  ) then
    alter table app_config
      alter column value type text
      using case when jsonb_typeof(value) = 'string' then value #>> '{}' else value::text end;
  end if;
end $$;

alter table app_config enable row level security;

-- Deliberately no policies: service-role bypasses RLS, everyone else is denied.

comment on table app_config is
  'Server-only config/secrets provisioned at runtime. RLS on, no policies: service-role access only.';
