"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CreditCard,
  Shield,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Professional } from "@/types";
import { formatCurrency } from "@/lib/utils";

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [professional, setProfessional] = useState<Professional | null>(null);

  const professionalId = searchParams.get("professional");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  useEffect(() => {
    if (!professionalId) return;
    fetch(`/api/professionals/${professionalId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfessional)
      .catch(() => setProfessional(null));
  }, [professionalId]);

  const bookingDate = dateParam
    ? new Date(dateParam).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const bookingTime = timeParam ? `${timeParam} - ${addHour(timeParam)}` : "";
  const platformFee = professional ? professional.hourlyRate * 0.1 : 0;
  const total = professional?.hourlyRate ?? 0;

  if (!professional) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.id,
          date: dateParam,
          time: timeParam,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear checkout");
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
      alert("Error al procesar el pago. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href={`/professional/${professional.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <h1 className="mt-6 font-heading text-2xl font-bold sm:text-3xl">
        Confirmar reserva
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left - Details */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
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

            <div className="rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <CreditCard className="h-5 w-5" />
                Pago seguro
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Serás redirigido a Stripe para completar el pago de forma
                segura. Aceptamos tarjetas de crédito, débito y otros métodos.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                Pago encriptado y protegido por Stripe
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo a Stripe...
                </>
              ) : (
                `Pagar ${formatCurrency(total)}`
              )}
            </Button>
          </motion.div>
        </div>

        {/* Right - Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border bg-card p-6">
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
                  {CATEGORY_LABELS[professional.category]}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sesión (60 min)</span>
                <span>{formatCurrency(professional.hourlyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tarifa de servicio
                </span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
