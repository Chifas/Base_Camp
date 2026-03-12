"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as "CLIENT" | "PROFESSIONAL" | null;

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    async function finalize() {
      // Only update role when explicitly requested (new Google registration)
      if (role === "CLIENT" || role === "PROFESSIONAL") {
        await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        // Refresh JWT so middleware sees the new role
        await update({ role });
      }

      const effectiveRole =
        role ?? (session?.user as { role?: string })?.role ?? "CLIENT";

      router.replace(
        effectiveRole === "PROFESSIONAL"
          ? "/dashboard/professional"
          : "/dashboard/client"
      );
    }

    finalize();
  }, [status, session, role, router, update]);

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
