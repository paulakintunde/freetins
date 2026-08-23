PRAGMA foreign_keys = ON;

ALTER TABLE alert_subscriptions ADD COLUMN confirmed_at TEXT;
ALTER TABLE alert_subscriptions ADD COLUMN delivery_frequency TEXT NOT NULL DEFAULT 'weekly';

CREATE TABLE IF NOT EXISTS alert_subscription_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  contact_hash TEXT NOT NULL UNIQUE,
  games_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  confirmed_at TEXT
);

CREATE INDEX IF NOT EXISTS alert_subscription_requests_pending
  ON alert_subscription_requests (status, expires_at);

CREATE TABLE IF NOT EXISTS alert_subscription_games (
  subscription_id TEXT NOT NULL REFERENCES alert_subscriptions(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  PRIMARY KEY (subscription_id, game_slug)
);

CREATE INDEX IF NOT EXISTS alert_subscription_games_game
  ON alert_subscription_games (game_slug, subscription_id);

INSERT OR IGNORE INTO alert_subscription_games (subscription_id, game_slug)
SELECT alert_subscriptions.id, json_each.value
FROM alert_subscriptions, json_each(alert_subscriptions.games_json)
WHERE typeof(json_each.value) = 'text';

CREATE TABLE IF NOT EXISTS alert_releases (
  id TEXT PRIMARY KEY,
  game_slug TEXT NOT NULL,
  code_ids_json TEXT NOT NULL,
  published_at TEXT NOT NULL,
  queued_at TEXT,
  source_url TEXT
);

CREATE INDEX IF NOT EXISTS alert_releases_game_published
  ON alert_releases (game_slug, published_at DESC);

CREATE TABLE IF NOT EXISTS alert_email_deliveries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('confirmation', 'weekly_digest')),
  subscription_id TEXT,
  request_id TEXT,
  release_id TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS alert_email_deliveries_status
  ON alert_email_deliveries (status, updated_at DESC);
