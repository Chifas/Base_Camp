-- Migration: add favorites table
-- Idempotent — safe to run multiple times.

CREATE TABLE IF NOT EXISTS favorites (
  id             TEXT         NOT NULL PRIMARY KEY,
  "userId"       TEXT         NOT NULL,
  "professionalId" TEXT       NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT favorites_user_fk
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT favorites_professional_fk
    FOREIGN KEY ("professionalId") REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT favorites_unique
    UNIQUE ("userId", "professionalId")
);

CREATE INDEX IF NOT EXISTS favorites_userId_idx ON favorites("userId");
