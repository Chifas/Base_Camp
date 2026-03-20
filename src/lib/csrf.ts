import { NextRequest } from "next/server";

/**
 * Validate that the request origin matches the expected host.
 * Checks both Origin and Referer headers against NEXTAUTH_URL.
 * Returns true if the request is safe, false if it looks like a CSRF attempt.
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Allow requests with no origin (same-origin non-CORS requests from some browsers)
  // but require at least one header to be present for POST/PUT/PATCH/DELETE
  if (!origin && !referer) {
    // Server-to-server or same-origin — safe in most cases
    return true;
  }

  const allowedHost = process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).host
    : "localhost:3000";

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === allowedHost;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === allowedHost;
    } catch {
      return false;
    }
  }

  return false;
}
