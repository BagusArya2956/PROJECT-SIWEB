CREATE TABLE IF NOT EXISTS shipin_admin_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_fingerprint TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  used_by_admin_id UUID UNIQUE REFERENCES shipin_users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipin_admin_codes_unused
  ON shipin_admin_codes (code_fingerprint)
  WHERE used_at IS NULL AND is_active = TRUE;
