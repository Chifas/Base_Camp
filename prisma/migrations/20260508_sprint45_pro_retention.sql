-- Migration: profile views, client notes, message templates,
-- composite session indexes, soft-delete column.
-- Idempotent — safe to run multiple times.

-- Soft-delete column
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Composite indexes (covering common query patterns)
CREATE INDEX IF NOT EXISTS sessions_client_status_scheduled_idx
  ON sessions("clientId", status, "scheduledAt");
CREATE INDEX IF NOT EXISTS sessions_professional_status_scheduled_idx
  ON sessions("professionalId", status, "scheduledAt");
CREATE INDEX IF NOT EXISTS sessions_client_pro_status_idx
  ON sessions("clientId", "professionalId", status);

-- ProfileView (analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id               TEXT         NOT NULL PRIMARY KEY,
  "professionalId" TEXT         NOT NULL,
  "viewerId"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT profile_views_pro_fk
    FOREIGN KEY ("professionalId") REFERENCES professional_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS profile_views_pro_created_idx
  ON profile_views("professionalId", "createdAt");

-- ClientNote (CRM)
CREATE TABLE IF NOT EXISTS client_notes (
  id               TEXT         NOT NULL PRIMARY KEY,
  "professionalId" TEXT         NOT NULL,
  "clientId"       TEXT         NOT NULL,
  content          TEXT         NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT client_notes_pro_fk
    FOREIGN KEY ("professionalId") REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT client_notes_unique
    UNIQUE ("professionalId", "clientId")
);

CREATE INDEX IF NOT EXISTS client_notes_pro_idx ON client_notes("professionalId");

-- MessageTemplate
CREATE TABLE IF NOT EXISTS message_templates (
  id               TEXT         NOT NULL PRIMARY KEY,
  "professionalId" TEXT         NOT NULL,
  name             TEXT         NOT NULL,
  content          TEXT         NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT message_templates_pro_fk
    FOREIGN KEY ("professionalId") REFERENCES professional_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS message_templates_pro_idx ON message_templates("professionalId");
