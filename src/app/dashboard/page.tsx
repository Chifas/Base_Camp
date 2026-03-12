"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Dashboard router — reads the session role and redirects to the correct
 * sub-dashboard. The role in useSession() is always fresh because the JWT
 * callback re-reads it from the database on every session access.
 */
export default function DashboardRouter() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    const role = (session.user as { role?: string })?.role ?? "CLIENT";
    window.location.href =
      role === "PROFESSIONAL"
        ? "/dashboard/professional"
        : "/dashboard/client";
  }, [status, session]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
