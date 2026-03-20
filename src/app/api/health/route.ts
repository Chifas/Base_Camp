import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ServiceCheck {
  status: "ok" | "error" | "skipped";
  latencyMs?: number;
  error?: string;
}

export async function GET() {
  const checks: Record<string, ServiceCheck> = {};

  // Database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "error",
      latencyMs: Date.now() - dbStart,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // Daily.co
  if (process.env.DAILY_API_KEY) {
    const dailyStart = Date.now();
    try {
      const res = await fetch("https://api.daily.co/v1/rooms?limit=1", {
        headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.daily = {
        status: res.ok ? "ok" : "error",
        latencyMs: Date.now() - dailyStart,
        ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
      };
    } catch (err) {
      checks.daily = {
        status: "error",
        latencyMs: Date.now() - dailyStart,
        error: err instanceof Error ? err.message : "Timeout",
      };
    }
  } else {
    checks.daily = { status: "skipped" };
  }

  // Resend
  if (process.env.RESEND_API_KEY) {
    const resendStart = Date.now();
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.resend = {
        status: res.ok ? "ok" : "error",
        latencyMs: Date.now() - resendStart,
        ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
      };
    } catch (err) {
      checks.resend = {
        status: "error",
        latencyMs: Date.now() - resendStart,
        error: err instanceof Error ? err.message : "Timeout",
      };
    }
  } else {
    checks.resend = { status: "skipped" };
  }

  // Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redisStart = Date.now();
    try {
      const res = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          signal: AbortSignal.timeout(5000),
        }
      );
      checks.redis = {
        status: res.ok ? "ok" : "error",
        latencyMs: Date.now() - redisStart,
        ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
      };
    } catch (err) {
      checks.redis = {
        status: "error",
        latencyMs: Date.now() - redisStart,
        error: err instanceof Error ? err.message : "Timeout",
      };
    }
  } else {
    checks.redis = { status: "skipped" };
  }

  const allOk = Object.values(checks).every(
    (c) => c.status === "ok" || c.status === "skipped"
  );

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
