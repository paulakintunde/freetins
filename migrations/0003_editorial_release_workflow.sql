-- Editorial data is immutable once released, so every public dispatch can be audited and retried safely.
ALTER TABLE code_submissions ADD COLUMN game_slug TEXT;
ALTER TABLE code_submissions ADD COLUMN reviewed_at TEXT;
ALTER TABLE code_submissions ADD COLUMN reviewed_by TEXT;
ALTER TABLE code_submissions ADD COLUMN published_release_id TEXT REFERENCES alert_releases(id);

CREATE INDEX IF NOT EXISTS code_submissions_editorial_queue
  ON code_submissions (status, game_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS release_dispatches (
  release_id TEXT NOT NULL REFERENCES alert_releases(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('discord')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  provider_message_id TEXT,
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sent_at TEXT,
  PRIMARY KEY (release_id, channel)
);

CREATE INDEX IF NOT EXISTS release_dispatches_pending
  ON release_dispatches (status, updated_at ASC);
