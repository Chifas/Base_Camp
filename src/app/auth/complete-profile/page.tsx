"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Compass, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const processedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (processedRef.current) return;

    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    processedRef.current = true;

    async function finalize() {
      const pendingRole = localStorage.getItem("guidepath-pending-role");
      localStorage.removeItem("guidepath-pending-role");

      if (pendingRole === "CLIENT" || pendingRole === "PROFESSIONAL") {
        await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: pendingRole }),
        });
      }

      // Redirect based on role — professionals go to onboarding to complete
      // their profile; clients go straight to dashboard
      if (pendingRole === "PROFESSIONAL") {
        window.location.href = "/onboarding/professional";
      } else {
        window.location.href = "/dashboard/client";
      }
    }

    finalize();
  }, [status, session]);

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
