-- A verified submission may belong to only one release, even if two editor requests race.
CREATE TABLE IF NOT EXISTS release_code_members (
  code_submission_id TEXT PRIMARY KEY REFERENCES code_submissions(id) ON DELETE RESTRICT,
  release_id TEXT NOT NULL REFERENCES alert_releases(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS release_code_members_release
  ON release_code_members (release_id);
