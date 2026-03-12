"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Compass, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (processedRef.current) return;

    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    // Prevent double execution (update ref changes on each render)
    processedRef.current = true;

    async function finalize() {
      const pendingRole =
        localStorage.getItem("guidepath-pending-role") ||
        searchParams.get("role");

      localStorage.removeItem("guidepath-pending-role");

      if (pendingRole === "CLIENT" || pendingRole === "PROFESSIONAL") {
        // 1. Update role in DB
        await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: pendingRole }),
        });

        // 2. Trigger JWT refresh — the jwt callback re-reads role from DB
        await update();

        // 3. Hard redirect so the browser sends the updated JWT cookie
        window.location.href =
          pendingRole === "PROFESSIONAL"
            ? "/dashboard/professional"
            : "/dashboard/client";
      } else {
        // Returning user — redirect based on existing session role
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
