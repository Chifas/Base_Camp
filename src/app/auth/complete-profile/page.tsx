"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Compass, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    async function finalize() {
      // Read role from sessionStorage (set before Google OAuth) or URL param fallback
      const pendingRole =
        sessionStorage.getItem("guidepath-pending-role") ||
        searchParams.get("role");

      sessionStorage.removeItem("guidepath-pending-role");

      if (pendingRole === "CLIENT" || pendingRole === "PROFESSIONAL") {
        // Update role in DB
        await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: pendingRole }),
        });
        // Update the JWT cookie so middleware sees the new role
        await update({ role: pendingRole });

        // Hard redirect so the browser sends the updated JWT cookie
        window.location.href =
          pendingRole === "PROFESSIONAL"
            ? "/dashboard/professional"
            : "/dashboard/client";
      } else {
        // Returning user — just redirect based on existing session role
        const currentRole =
          (session?.user as { role?: string })?.role ?? "CLIENT";
        window.location.href =
          currentRole === "PROFESSIONAL"
            ? "/dashboard/professional"
            : "/dashboard/client";
      }
    }

    finalize();
  }, [status, session, searchParams, update]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Compass className="h-7 w-7" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Preparando tu cuenta...</span>
        </div>
      </div>
    </div>
  );
}
