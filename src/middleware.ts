import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { validateOrigin } from "@/lib/csrf";

// In-memory rate limiter (Edge-compatible, resets on cold start)
type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (bucket.count >= limit) return true;
  bucket.count++;
  return false;
}

const AUTH_PATHS = ["/api/auth/register", "/api/auth/login"];
const MUTATION_PATHS = ["/api/messages", "/api/rewards", "/api/sessions"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const method = req.method.toUpperCase();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Rate limiting — applied before CSRF to fail fast
    if (method === "POST") {
      if (AUTH_PATHS.some((p) => path.startsWith(p))) {
        if (isRateLimited(`auth:${ip}`, 5, 60_000)) {
          return NextResponse.json({ error: "Demasiados intentos. Espera un momento." }, { status: 429 });
        }
      } else if (MUTATION_PATHS.some((p) => path.startsWith(p))) {
        if (isRateLimited(`mut:${ip}`, 20, 10_000)) {
          return NextResponse.json({ error: "Demasiadas peticiones. Espera un momento." }, { status: 429 });
        }
      }
    }

    // CSRF protection for mutation requests on protected routes
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (!validateOrigin(req)) {
        return NextResponse.json(
          { error: "Origen no autorizado" },
          { status: 403 }
        );
      }
    }

    // Role-based access control for dashboards
    if (path.startsWith("/dashboard/professional") && token?.role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }
    if (path.startsWith("/dashboard/client") && token?.role === "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/professional", req.url));
    }

    // Only professionals can access onboarding
    if (path.startsWith("/onboarding/professional") && token?.role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        if (req.nextUrl.pathname.startsWith("/api/")) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/session/:path*",
    "/book/:path*",
    "/onboarding/:path*",
    "/api/sessions/:path*",
    "/api/conversations/:path*",
    "/api/reviews/:path*",
    "/api/availability/:path*",
    "/api/blocked-dates/:path*",
    "/api/notifications/:path*",
    "/api/messages/:path*",
    "/api/credits/:path*",
    "/api/rewards/:path*",
    "/api/certifications/:path*",
    "/api/referrals/:path*",
    "/api/upload",
  ],
};
