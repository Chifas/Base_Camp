-- Migration: session notes, action items, NPS feedback, followupSent flag
-- Idempotent — safe to run multiple times.

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS "followupSent" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS session_notes (
  id          TEXT         NOT NULL PRIMARY KEY,
  "sessionId" TEXT         NOT NULL UNIQUE,
  summary     TEXT,
  "nextSteps" TEXT,
  resources   TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT session_notes_session_fk
    FOREIGN KEY ("sessionId") REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_items (
  id              TEXT         NOT NULL PRIMARY KEY,
  "sessionNoteId" TEXT         NOT NULL,
  content         TEXT         NOT NULL,
  completed       BOOLEAN      NOT NULL DEFAULT false,
  "order"         INTEGER      NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT action_items_note_fk
    FOREIGN KEY ("sessionNoteId") REFERENCES session_notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS action_items_sessionNoteId_idx ON action_items("sessionNoteId");

CREATE TABLE IF NOT EXISTS session_feedbacks (
  id          TEXT         NOT NULL PRIMARY KEY,
  "sessionId" TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "npsScore"  INTEGER      NOT NULL,
  comment     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT session_feedbacks_session_fk
    FOREIGN KEY ("sessionId") REFERENCES sessions(id) ON DELETE CASCADE,
  CONSTRAINT session_feedbacks_unique
    UNIQUE ("sessionId", "userId")
);

CREATE INDEX IF NOT EXISTS session_feedbacks_sessionId_idx ON session_feedbacks("sessionId");
