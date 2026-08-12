-- RedMatch — Telegram linking via a single shared bot (spec section 1).
--
-- This migration moves away from the earlier "bring your own bot token" model,
-- which required each user to paste a bot token into the dashboard form. That
-- contradicts the spec: the bot token must live ONLY on the server, in the
-- TELEGRAM_BOT_TOKEN environment variable, and users must link their account
-- through a /start <token> deep link handled by the webhook.
--
-- telegram_settings currently holds 0 rows, so dropping the per-user bot token
-- and reshaping the linking columns is non-destructive.

-- ----------------------------------------------------- linking reshape ------

-- 1. The per-user bot token contradicts the security model. No data depends on
--    it (empty table), so it is removed rather than left as a dangerous option.
alter table public.telegram_settings
  drop column if exists bot_token;

-- 2. Linking token. We store only a SHA-256 *hash* of the one-time token, never
--    the token itself — the same reason passwords are hashed. The plaintext is
--    shown to the user once (in the deep link) and then only ever arrives back
--    through Telegram, where we hash it again to match this column.
alter table public.telegram_settings
  add column if not exists link_token_hash text;

alter table public.telegram_settings
  add column if not exists link_token_expires_at timestamptz;

-- 3. Telegram identity captured by the webhook when the user runs /start.
--    telegram_user_id is the stable numeric id of the Telegram account; chat_id
--    is where messages are sent (they are equal for private chats but kept
--    distinct so a future group/channel target stays possible).
alter table public.telegram_settings
  add column if not exists telegram_user_id bigint;

alter table public.telegram_settings
  add column if not exists telegram_username text;

-- 4. Look up a pending link by its token hash during the webhook /start flow.
create index if not exists telegram_settings_link_token_idx
  on public.telegram_settings (link_token_hash)
  where link_token_hash is not null;

-- RLS is already enabled on telegram_settings from migration 001. The linking
-- columns are written only by the server (service role / security definer), so
-- no new client policy is added: the browser must go through server actions.

-- --------------------------------------------- atomic link redemption -------
-- Redeems a linking token in one round-trip, from the webhook. Doing it in SQL
-- (rather than select-then-update in the app) means two rapid /start messages
-- cannot both consume the same pending row: the UPDATE ... WHERE token matches
-- is atomic and the token hash is cleared as it is consumed.
--
-- Grants 'active' access only when the user is currently entitled (active or
-- trialing subscription, not past its period end). Otherwise the chat is linked
-- but left 'pending', so billing state — not mere possession of a chat — decides
-- delivery, exactly as authorizeTelegramDelivery expects.
create or replace function public.redeem_telegram_link(
  p_token_hash text,
  p_chat_id text,
  p_telegram_user_id bigint,
  p_telegram_username text
)
returns table (user_id uuid, access_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_entitled boolean;
begin
  -- Find the pending link. A non-null, unexpired hash is required.
  select ts.user_id into v_user_id
    from public.telegram_settings ts
   where ts.link_token_hash = p_token_hash
     and ts.link_token_expires_at is not null
     and ts.link_token_expires_at > now()
   for update;

  if v_user_id is null then
    return; -- no matching / expired token: caller reports an invalid link
  end if;

  -- Independent entitlement check, mirroring authorizeTelegramDelivery: a null
  -- period end is a non-expiring (lifetime) plan; a past date is expired.
  select exists (
    select 1 from public.subscriptions s
     where s.user_id = v_user_id
       and s.status in ('active', 'trialing')
       and (s.current_period_end is null or s.current_period_end > now())
  ) into v_entitled;

  update public.telegram_settings ts
     set chat_id = p_chat_id,
         telegram_user_id = p_telegram_user_id,
         telegram_username = p_telegram_username,
         verified_at = now(),
         access_status = case when v_entitled then 'active' else 'pending' end,
         revoked_at = null,
         link_token_hash = null,
         link_token_expires_at = null,
         updated_at = now()
   where ts.user_id = v_user_id;

  return query select v_user_id, (case when v_entitled then 'active' else 'pending' end)::text;
end;
$$;

revoke all on function public.redeem_telegram_link(text, text, bigint, text) from anon, authenticated;

-- --------------------------------------------- per-user delivery dedupe -----
-- The alerts table already records one row per (user, alert) with delivered_at.
-- To make fan-out idempotent — so a retried monitor run cannot alert the same
-- user twice for the same expulsion — we tie each alert row to the global
-- red_card_events.event_key and enforce uniqueness per user.
alter table public.alerts
  add column if not exists event_key text;

-- Partial unique index: only rows carrying an event_key are constrained, so any
-- legacy/manual alert rows without one are unaffected.
create unique index if not exists alerts_user_event_unique_idx
  on public.alerts (user_id, event_key)
  where event_key is not null;
