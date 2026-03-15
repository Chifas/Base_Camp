"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionInfo {
  id: string;
  professionalName: string;
  professionalImage: string;
  scheduledAt: string;
  duration: number;
  status: string;
  price: number;
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-20 text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" /></div>}>
      <BookingConfirmedContent />
    </Suspense>
  );
}

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Fetch session details
    fetch("/api/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then((sessions: SessionInfo[]) => {
        const found = sessions.find((s: SessionInfo) => s.id === sessionId);
        setSessionInfo(found ?? null);
      })
      .catch(() => setSessionInfo(null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const date = sessionInfo
    ? new Date(sessionInfo.scheduledAt).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const time = sessionInfo
    ? new Date(sessionInfo.scheduledAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold">
          ¡Reserva confirmada!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {sessionInfo
            ? `Tu sesión con ${sessionInfo.professionalName} ha sido reservada.
               Recibirás un email con los detalles.`
            : "Tu pago ha sido procesado correctamente."}
        </p>

        {sessionInfo && (
          <div className="mt-8 rounded-xl border bg-card p-6 text-left">
            <div className="flex items-center gap-4">
              {sessionInfo.professionalImage && (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                  <Image
                    src={sessionInfo.professionalImage}
                    alt={sessionInfo.professionalName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {sessionInfo.professionalName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {date} · {time}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/client">Ir a mi panel</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore">Seguir explorando</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
