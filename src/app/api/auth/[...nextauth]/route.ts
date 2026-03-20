import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { loginLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

async function postHandler(req: NextRequest) {
  // Rate limit only credential login attempts (POST with credentials action)
  const url = new URL(req.url);
  const isCredentialSignIn =
    url.pathname.endsWith("/callback/credentials") ||
    url.searchParams.get("action") === "callback/credentials";

  if (isCredentialSignIn) {
    const ip = getClientIp(req);
    const limiter = loginLimiter();
    const { success, reset } = await checkRateLimit(limiter, ip);

    if (!success) {
      return NextResponse.json(
        { error: "Demasiados intentos de login. Inténtalo de nuevo más tarde." },
        {
          status: 429,
          headers: reset ? { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } : {},
        }
      );
    }
  }

  return handler(req as unknown as Request) as Promise<Response>;
}

export { handler as GET, postHandler as POST };
