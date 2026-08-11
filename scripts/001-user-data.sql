-- RedPulse — per-user data model.
-- Every table is owned by a single user and locked down with RLS, so one
-- account can never read or write another account's rows. The public landing
-- demo uses no database at all, which is what keeps it a demo.

-- ---------------------------------------------------------------- profiles --
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Europe/Paris',
  locale text not null default 'fr',
  -- Notification preferences, one row per user.
  notify_instant boolean not null default true,
  notify_digest boolean not null default false,
  notify_product boolean not null default true,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- ------------------------------------------------- competition selections --
-- One row per (user, competition) the user follows. Absence of a row means the
-- competition is not monitored for that user.
create table if not exists public.user_competitions (
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, competition_id)
);

alter table public.user_competitions enable row level security;

drop policy if exists "user_competitions_select_own" on public.user_competitions;
drop policy if exists "user_competitions_insert_own" on public.user_competitions;
drop policy if exists "user_competitions_update_own" on public.user_competitions;
drop policy if exists "user_competitions_delete_own" on public.user_competitions;

create policy "user_competitions_select_own" on public.user_competitions for select using (auth.uid() = user_id);
create policy "user_competitions_insert_own" on public.user_competitions for insert with check (auth.uid() = user_id);
create policy "user_competitions_update_own" on public.user_competitions for update using (auth.uid() = user_id);
create policy "user_competitions_delete_own" on public.user_competitions for delete using (auth.uid() = user_id);

-- ------------------------------------------------------- telegram settings --
create table if not exists public.telegram_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  bot_token text,
  chat_id text,
  -- Set once a real getMe/sendMessage round-trip has succeeded.
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.telegram_settings enable row level security;

drop policy if exists "telegram_settings_select_own" on public.telegram_settings;
drop policy if exists "telegram_settings_insert_own" on public.telegram_settings;
drop policy if exists "telegram_settings_update_own" on public.telegram_settings;
drop policy if exists "telegram_settings_delete_own" on public.telegram_settings;

create policy "telegram_settings_select_own" on public.telegram_settings for select using (auth.uid() = user_id);
create policy "telegram_settings_insert_own" on public.telegram_settings for insert with check (auth.uid() = user_id);
create policy "telegram_settings_update_own" on public.telegram_settings for update using (auth.uid() = user_id);
create policy "telegram_settings_delete_own" on public.telegram_settings for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------- alerts ----
-- Red-card analyses actually delivered to this user. A brand-new account has
-- none: the dashboard shows an empty state rather than demo rows.
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id text not null,
  competition text not null,
  home_team text not null,
  away_team text not null,
  score text not null,
  minute integer not null check (minute between 0 and 130),
  player text not null,
  carded_team text not null,
  favorite text not null,
  extra_goal_prob integer not null check (extra_goal_prob between 0 and 100),
  favorite_win_prob integer not null check (favorite_win_prob between 0 and 100),
  impact integer not null check (impact between 0 and 100),
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alerts_user_created_idx on public.alerts (user_id, created_at desc);

alter table public.alerts enable row level security;

drop policy if exists "alerts_select_own" on public.alerts;
drop policy if exists "alerts_insert_own" on public.alerts;
drop policy if exists "alerts_update_own" on public.alerts;
drop policy if exists "alerts_delete_own" on public.alerts;

create policy "alerts_select_own" on public.alerts for select using (auth.uid() = user_id);
create policy "alerts_insert_own" on public.alerts for insert with check (auth.uid() = user_id);
create policy "alerts_update_own" on public.alerts for update using (auth.uid() = user_id);
create policy "alerts_delete_own" on public.alerts for delete using (auth.uid() = user_id);

-- ------------------------------------------------- new-user bootstrapping --
-- Runs with definer rights because a freshly created user has no session yet,
-- so RLS-bound inserts from the client would be rejected. search_path is
-- pinned and names fully qualified so a caller cannot shadow them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, terms_accepted_at)
  values (
    new.id,
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
