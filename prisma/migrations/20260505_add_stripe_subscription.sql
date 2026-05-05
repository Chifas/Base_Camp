-- Migration: add_stripe_subscription
-- Apply this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- All statements use IF NOT EXISTS / DO blocks so it is safe to run more than once.

-- ─── 1. New Stripe subscription columns on users ──────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripeCustomerId"     TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionStatus"   TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionEndsAt"   TIMESTAMPTZ;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionInterval" TEXT;

-- Unique constraints (skip silently if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_stripeCustomerId_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_stripeSubscriptionId_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");
  END IF;
END $$;

-- ─── 2. Stripe webhook idempotency table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS "stripe_event_log" (
  "id"          TEXT        NOT NULL,
  "type"        TEXT        NOT NULL,
  "processedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "stripe_event_log_pkey" PRIMARY KEY ("id")
);

-- ─── 3. Priority-booking flag on availability slots ──────────────────────────
ALTER TABLE "availability" ADD COLUMN IF NOT EXISTS "priorityOnly" BOOLEAN NOT NULL DEFAULT false;
