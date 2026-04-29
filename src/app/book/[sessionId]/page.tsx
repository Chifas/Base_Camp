"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Shield,
  ChevronLeft,
  Loader2,
  Sparkles,
  Heart,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Professional } from "@/types";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { gsap, useGSAP } from "@/lib/gsap-config";

function addHour(time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [credits, setCredits] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  const professionalId = searchParams.get("professional");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const left = root.querySelector<HTMLElement>("[data-left]");
      const right = root.querySelector<HTMLElement>("[data-right]");
      const heading = root.querySelector<HTMLElement>("[data-heading]");

      const tl = gsap.timeline();
      if (heading) tl.from(heading, { y: 14, duration: 0.5, ease: "power3.out" }, 0);
      if (left) tl.from(left, { x: -16, duration: 0.6, ease: "power3.out" }, 0.05);
      if (right) tl.from(right, { x: 16, duration: 0.6, ease: "power3.out" }, 0.1);
    },
    { scope: rootRef, dependencies: [professional?.id] }
  );

  useEffect(() => {
    if (!professionalId) return;
    fetch(`/api/professionals/${professionalId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfessional)
      .catch(() => setProfessional(null));
  }, [professionalId]);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then(setCredits)
      .catch(() => setCredits(null));
  }, []);

  const bookingDate = dateParam
    ? new Date(dateParam).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const bookingTime = timeParam ? `${timeParam} - ${addHour(timeParam)}` : "";
  const hasCredits = credits ? credits.remaining > 0 : false;

  if (!professional) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleBooking = async () => {
    setIsProcessing(true);
    try {
      const scheduledAt = dateParam && timeParam
        ? new Date(`${dateParam.split("T")[0]}T${timeParam}:00`)
        : null;

      if (!scheduledAt) throw new Error("Fecha inválida");

      const response = await fetch("/api/credits/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.id,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reservar");
      }

      router.push(`/dashboard/client`);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
      alert(error instanceof Error ? error.message : "Error al reservar. Inténtalo de nuevo.");
    }
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href={`/professional/${professional.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <h1 data-heading className="mt-6 font-heading text-2xl font-bold sm:text-3xl">
        Confirmar reserva
      </h1>

      <div className="mt-8 grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-5">
        {/* Left - Details */}
        <div data-left className="lg:col-span-3 space-y-6">
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold">
                Detalles de la sesión
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{bookingDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{bookingTime} (60 minutos)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold">
                Notas para el profesional
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Opcional — describe brevemente lo que te gustaría trabajar en
                esta sesión.
              </p>
              <textarea
                className="mt-4 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
                placeholder="Ej: Me gustaría hablar sobre gestión de ansiedad laboral..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Credits info */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Sesión gratuita
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta sesión se confirma al instante sin coste alguno.
                Tu profesional recibe puntos de impacto social por cada sesión realizada.
              </p>
              {credits && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>
                    {credits.remaining} de {credits.limit} sesiones disponibles este mes
                  </span>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                Cancelación gratuita hasta 24h antes
              </div>
            </div>

            {hasCredits ? (
              <Button
                className="w-full"
                size="lg"
                onClick={handleBooking}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar reserva gratuita"
                )}
              </Button>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <Lock className="mx-auto h-8 w-8 text-primary/60" />
                <h3 className="mt-3 font-heading text-lg font-semibold">
                  Has agotado tus sesiones gratuitas
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Has usado tus {CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH} sesiones de este mes.
                  Tus créditos se renuevan automáticamente el primer día del próximo mes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Summary */}
        <div data-right className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 rounded-xl border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">Resumen</h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                <Image
                  src={professional.image}
                  alt={professional.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-semibold">{professional.name}</p>
                <Badge variant="secondary" className="mt-0.5 text-xs">
                  {professional.categoryName}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sesión (60 min)</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Gratuito
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impacto social</span>
                <span className="text-xs text-muted-foreground">
                  +{CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION} pts para el profesional
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400">Gratis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
