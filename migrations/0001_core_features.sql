PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL CHECK (topic IN ('Correction', 'Promotion', 'Partnership', 'General')),
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  source_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS contact_requests_queue
  ON contact_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS code_submissions (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  code TEXT NOT NULL,
  source_url TEXT,
  email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS code_submissions_queue
  ON code_submissions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  contact TEXT NOT NULL,
  contact_hash TEXT NOT NULL,
  games_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  manage_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (channel, contact_hash)
);

CREATE INDEX IF NOT EXISTS alert_subscriptions_delivery
  ON alert_subscriptions (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS request_rate_limits (
  scope TEXT NOT NULL,
  bucket TEXT NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (scope, bucket, fingerprint_hash)
);
