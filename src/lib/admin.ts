import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Returns the session if the current user is an ADMIN, null otherwise.
 * Admin API routes return 403 on null.
 */
export async function requireAdmin(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if ((session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}
