"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, CalendarPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap-config";

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
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const card = root.querySelector<HTMLElement>("[data-card]");
      const icon = root.querySelector<HTMLElement>("[data-icon]");
      const tl = gsap.timeline();
      if (card) tl.from(card, { y: 16, duration: 0.6, ease: "power3.out" }, 0);
      if (icon) tl.from(icon, { scale: 0.6, duration: 0.55, ease: "back.out(1.8)" }, 0.1);
    },
    { scope: rootRef, dependencies: [loading] }
  );

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

  const buildGoogleCalendarUrl = useCallback(() => {
    if (!sessionInfo) return "#";
    const start = new Date(sessionInfo.scheduledAt);
    const end   = new Date(start.getTime() + sessionInfo.duration * 60 * 1000);

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text:   `Sesión con ${sessionInfo.professionalName} — GuidePath`,
      dates:  `${fmt(start)}/${fmt(end)}`,
      details: "Sesión de orientación profesional en GuidePath. Accede desde tu panel.",
      location: "GuidePath (videollamada)",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [sessionInfo]);

  const downloadIcal = useCallback(() => {
    if (!sessionInfo) return;
    const start = new Date(sessionInfo.scheduledAt);
    const end   = new Date(start.getTime() + sessionInfo.duration * 60 * 1000);

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GuidePath//ES",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Sesión con ${sessionInfo.professionalName} — GuidePath`,
      "DESCRIPTION:Sesión de orientación profesional en GuidePath. Accede desde tu panel.",
      "LOCATION:GuidePath (videollamada)",
      `UID:${sessionInfo.id}@guidepath`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `sesion-guidepath.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessionInfo]);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div data-card>
        <div data-icon className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
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

        {/* Calendar CTAs */}
        {sessionInfo && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              Añade la sesión a tu calendario
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={buildGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CalendarPlus className="mr-2 h-4 w-4 text-teal-600" />
                  Google Calendar
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={downloadIcal}>
                <Download className="mr-2 h-4 w-4 text-stone-500" />
                Descargar .ics (Apple / Outlook)
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/client">Ir a mi panel</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore">Seguir explorando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
