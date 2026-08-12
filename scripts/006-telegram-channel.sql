-- RedMatch 006 — passage au modèle "canal privé unique".
--
-- Nouveau fonctionnement : les alertes ne sont plus envoyées en message privé à
-- chaque utilisateur, mais publiées dans un seul canal Telegram privé
-- ("Red match alertes", TELEGRAM_CHAT_ID). Chaque abonné actif connecte son
-- compte, reçoit un lien d'invitation personnel à usage unique, puis rejoint le
-- canal. À la fin de l'abonnement, le bot le retire du canal.
--
-- On réutilise la table telegram_settings existante (colonnes de liaison de la
-- migration 005 : link_token_hash, telegram_user_id, access_status). On ajoute
-- seulement le suivi de l'appartenance au canal. Aucune donnée n'est perdue.

alter table public.telegram_settings
  add column if not exists telegram_connected_at timestamptz,
  -- Lien d'invitation personnel émis pour cet utilisateur (jamais public).
  add column if not exists invite_link text,
  add column if not exists invite_link_expires_at timestamptz,
  -- Appartenance au canal, pilotée par le serveur :
  --   none    : pas encore invité
  --   invited : lien émis, pas encore rejoint (ou état non confirmé)
  --   member  : présent dans le canal
  --   removed : retiré (abonnement terminé)
  add column if not exists channel_status text not null default 'none'
    check (channel_status in ('none', 'invited', 'member', 'removed'));

-- Retrouver un utilisateur à partir de son identifiant Telegram numérique
-- (jamais depuis le username, spec section 2) — utilisé par le webhook.
create index if not exists telegram_settings_telegram_user_id_idx
  on public.telegram_settings (telegram_user_id)
  where telegram_user_id is not null;
