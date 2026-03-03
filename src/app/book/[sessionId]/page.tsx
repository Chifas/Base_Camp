"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
  ChevronLeft,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PriceSelector } from "@/components/shared/PriceSelector";
import { PROFESSIONALS } from "@/data/mock";
import { CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";

type BookingStep = "price" | "review" | "confirmed";

export default function BookingPage() {
  // The folder is named [sessionId] but the param represents the professional's profile id.
  // Rename the folder to [professionalId] when you no longer need the old mock booking flow.
  const params = useParams();
  const professionalId = params.sessionId as string;

  const [step, setStep] = useState<BookingStep>("price");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedPriceName, setSelectedPriceName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Use mock data while backend is being wired up; replace with a real API call later.
  const professional =
    PROFESSIONALS.find((p) => p.id === professionalId) ?? PROFESSIONALS[0];

  const bookingDate = "Lunes, 20 de enero de 2025";
  const bookingTime = "10:00 - 11:00";

  const handlePriceSelect = (
    priceId: string,
    amount: number,
    name?: string
  ) => {
    setSelectedPriceId(priceId);
    setSelectedAmount(amount);
    setSelectedPriceName(name ?? null);
  };

  const handleGoToReview = () => {
    if (!selectedPriceId) return;
    setStep("review");
  };

  const handlePayment = async () => {
    if (!selectedPriceId || !selectedAmount) return;

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.id,
          priceRuleId: selectedPriceId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al procesar el pago");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Error desconocido"
      );
      setIsProcessing(false);
    }
  };

  // ── Confirmed step ────────────────────────────────────────────────────────
  if (step === "confirmed") {
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
            Tu sesión con {professional.name} ha sido reservada. Recibirás un
            email con los detalles y el enlace a la videollamada.
          </p>

          <div className="mt-8 rounded-xl border bg-card p-6 text-left">
            <div className="flex items-center gap-4">
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
                <p className="text-sm text-muted-foreground">
                  {bookingDate} · {bookingTime}
                </p>
              </div>
            </div>
          </div>

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

  // ── Step indicator helper ─────────────────────────────────────────────────
  const steps: BookingStep[] = ["price", "review"];
  const currentStepIndex = steps.indexOf(step);

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
        Reservar sesión
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* ── Left: multi-step form ────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-3">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {steps.map((s, index) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-px flex-1 transition-colors ${
                      index < currentStepIndex ? "bg-primary" : "bg-border"
                    }`}
                    style={{ minWidth: "2rem" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Price selection ───────────────────────────────────── */}
          {step === "price" && (
            <motion.div
              key="price"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-xl border bg-card p-6">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <Tag className="h-5 w-5" />
                  Elige tu tarifa
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecciona la opción que mejor se adapte a ti.
                </p>

                <div className="mt-5">
                  <PriceSelector
                    professionalId={professional.id}
                    selectedPriceId={selectedPriceId}
                    onPriceSelect={(id, amount) =>
                      handlePriceSelect(id, amount)
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGoToReview}
                disabled={!selectedPriceId}
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Review + pay ──────────────────────────────────────── */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 10 }}
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
                  {selectedPriceName && selectedAmount !== null && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {selectedPriceName} —{" "}
                        <span className="font-semibold text-primary">
                          {formatCurrency(selectedAmount)}
                        </span>
                      </span>
                    </div>
                  )}
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Me gustaría hablar sobre gestión de ansiedad laboral..."
                />
              </div>

              {checkoutError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
                  {checkoutError}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                Pago seguro procesado por Stripe. Serás redirigido a la pasarela
                de pago.
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("price")}
                  disabled={isProcessing}
                >
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedAmount}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : (
                    `Pagar ${selectedAmount ? formatCurrency(selectedAmount) : ""}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: summary sidebar ───────────────────────────────────────── */}
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

            {professional.bio && (
              <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">
                {professional.bio}
              </p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sesión (60 min)</span>
                <span>
                  {selectedAmount
                    ? formatCurrency(selectedAmount)
                    : "—"}
                </span>
              </div>
              {selectedAmount !== null && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tarifa de servicio (10%)
                    </span>
                    <span>{formatCurrency(selectedAmount * 0.1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(selectedAmount)}
                    </span>
                  </div>
                </>
              )}
              {!selectedAmount && (
                <p className="text-xs text-muted-foreground">
                  Selecciona una tarifa para ver el desglose.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
