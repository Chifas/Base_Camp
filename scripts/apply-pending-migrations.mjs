#!/usr/bin/env node
/**
 * Apply pending SQL migrations against the configured database.
 *
 * Why this script exists:
 *   This project historically used `prisma db push` (no migration history)
 *   instead of `prisma migrate`. When the schema gained new Stripe / Premium
 *   columns we shipped a hand-written SQL file that has to be applied to the
 *   production Supabase DB before any code that touches those columns can run.
 *
 *   Wiring this into the build step means the columns get created the first
 *   time Vercel rebuilds, with no manual SQL Editor step needed.
 *
 * Properties:
 *   - Idempotent: each .sql file uses IF NOT EXISTS / DO blocks, so running
 *     the script repeatedly is safe.
 *   - Best-effort: if no DATABASE_URL is set (local build with a stub URL)
 *     or the connection fails, we log a warning and exit 0 so `next build`
 *     can still proceed. Runtime queries will surface any real DB issues.
 */

import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "prisma/migrations";

function listSqlFiles() {
  try {
    return readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => join(MIGRATIONS_DIR, name));
  } catch {
    return [];
  }
}

function isLocalStubUrl(url) {
  if (!url) return true;
  // Treat the placeholder URLs we use in CI/local builds as "no real DB".
  return /postgresql:\/\/x(\/|$|\?)/.test(url);
}

function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (isLocalStubUrl(url)) {
    console.log("[migrations] Skipping — no real DATABASE_URL/DIRECT_URL detected.");
    return;
  }

  const files = listSqlFiles();
  if (files.length === 0) {
    console.log("[migrations] No .sql files in prisma/migrations/, nothing to apply.");
    return;
  }

  for (const file of files) {
    const stats = statSync(file);
    if (!stats.isFile()) continue;

    console.log(`[migrations] Applying ${file}…`);
    try {
      execSync(
        `npx --no-install prisma db execute --file "${file}" --schema prisma/schema.prisma`,
        { stdio: "inherit" },
      );
      console.log(`[migrations] ✔ ${file}`);
    } catch (err) {
      // Don't break the build over a migration step — surface the warning and
      // let runtime tell us if the schema is actually broken.
      console.warn(
        `[migrations] ⚠ Could not apply ${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

main();
