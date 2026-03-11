"use client";

import { Suspense, useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2, Calendar, Clock, CreditCard,
  Shield, ChevronLeft, Loader2, AlertCircle,
} from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge }     from "@/components/ui/badge";
import { Skeleton }  from "@/components/ui/skeleton";
import { CATEGORY_LABELS, type ProfessionalCategory } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Stripe public key — must be prefixed with NEXT_PUBLIC_ to be exposed to the browser
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiProfile {
  id: string;
  category: ProfessionalCategory;
  headline: string | null;
  hourlyRate: number;
  user: { id: string; name: string | null; image: string | null };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Combines a Date ISO string (from the profile page) with a time string "HH:mm"
 *  and returns a Date in the user's local timezone. */
function buildScheduledAt(dateIso: string, time: string): Date {
  const base = new Date(dateIso);
  const [h, m] = time.split(":").map(Number);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
}

// ── Payment Form ─────────────────────────────────────────────────────────────
// Must live inside an <Elements> provider to use Stripe hooks.

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

function PaymentForm({ clientSecret, amount, onSuccess, onBack }: PaymentFormProps) {
  const stripe   = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError]   = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setStripeError("");

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardEl },
    });

    if (error) {
      setStripeError(error.message ?? "Error al procesar el pago");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <CreditCard className="h-5 w-5" />
          Información de pago
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pago seguro procesado por Stripe
        </p>

        {/* Stripe CardElement — rendered in a white box for consistent appearance */}
        <div className="mt-6">
          <label className="text-sm font-medium">Datos de la tarjeta</label>
          <div className="mt-2 rounded-lg border bg-white px-4 py-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#09090b",
                    fontFamily: "Inter, system-ui, sans-serif",
                    "::placeholder": { color: "#a1a1aa" },
                  },
                  invalid: { color: "#ef4444" },
                },
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Modo test: usa{" "}
            <code className="rounded bg-muted px-1 font-mono">4242 4242 4242 4242</code>,
            cualquier fecha futura y cualquier CVC.
          </p>
        </div>

        {/* Stripe error */}
        {stripeError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {stripeError}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          Tu información de pago está encriptada y segura
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          type="button"
          onClick={onBack}
          disabled={isProcessing}
        >
          Atrás
        </Button>
        <Button
          className="flex-1"
          size="lg"
          type="submit"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando…
            </>
          ) : (
            `Pagar ${formatCurrency(amount)}`
          )}
        </Button>
      </div>
    </form>
  );
}

// ── Booking Content ───────────────────────────────────────────────────────────

function BookingContent() {
  const searchParams   = useSearchParams();
  const professionalId = searchParams.get("professional");
  const dateStr        = searchParams.get("date");
  const timeStr        = searchParams.get("time");

  const [professional, setProfessional] = useState<ApiProfile | null>(null);
  const [loadingPro, setLoadingPro]     = useState(true);

  const [notes, setNotes]               = useState("");
  const [step, setStep]                 = useState<"review" | "payment" | "confirmed">("review");
  const [clientSecret, setClientSecret] = useState("");
  const [sessionAmount, setSessionAmount] = useState(0);
  const [isCreating, setIsCreating]     = useState(false);
  const [createError, setCreateError]   = useState("");

  // Fetch professional profile
  useEffect(() => {
    if (!professionalId) { setLoadingPro(false); return; }
    fetch(`/api/professionals/${professionalId}`)
      .then((r) => r.json())
      .then((data) => setProfessional(data))
      .catch(() => {})
      .finally(() => setLoadingPro(false));
  }, [professionalId]);

  // Build the scheduled datetime from URL params
  const scheduledAt =
    dateStr && timeStr ? buildScheduledAt(dateStr, timeStr) : null;

  // Step 1 → Step 2: create session + PaymentIntent
  const handleContinueToPayment = async () => {
    if (!scheduledAt) return;
    setIsCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/payments/create-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          scheduledAt: scheduledAt.toISOString(),
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear el pago");
      setClientSecret(data.clientSecret);
      setSessionAmount(data.amount);
      setStep("payment");
    } catch (err: unknown) {
      setCreateError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Invalid params guard ────────────────────────────────────────────────────
  if (!professionalId || !dateStr || !timeStr) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Reserva no válida</h1>
        <p className="mt-2 text-muted-foreground">
          Los parámetros de la reserva son incorrectos.
        </p>
        <Button asChild className="mt-6">
          <Link href="/explore">Volver a explorar</Link>
        </Button>
      </div>
    );
  }

  // ── Confirmed screen ────────────────────────────────────────────────────────
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
            Tu sesión con {professional?.user.name ?? "el profesional"} ha sido
            reservada. Recibirás un email con los detalles y el enlace a la
            videollamada.
          </p>

          {professional && (
            <div className="mt-8 rounded-xl border bg-card p-6 text-left">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {professional.user.image ? (
                    <Image
                      src={professional.user.image}
                      alt={professional.user.name ?? ""}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                      {professional.user.name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{professional.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduledAt ? formatDate(scheduledAt.toISOString()) : ""}{" "}
                    · {timeStr}
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

  // ── Summary values ──────────────────────────────────────────────────────────
  const hourlyRate   = professional?.hourlyRate ?? 0;
  const platformFee  = Math.round(hourlyRate * 0.1 * 100) / 100;
  const total        = hourlyRate;

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href={`/professional/${professionalId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <h1 className="mt-6 font-heading text-2xl font-bold sm:text-3xl">
        Confirmar reserva
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* ── Left: step forms ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-3 last:flex-none">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    (n === 1 && step === "review") || (n === 2 && step === "payment")
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </div>
                {n < 2 && <div className="h-px w-12 bg-border" />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Review ─────────────────────────────────────────────── */}
          {step === "review" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Session details */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-heading text-lg font-semibold">
                  Detalles de la sesión
                </h2>
                {loadingPro ? (
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      {scheduledAt
                        ? formatDate(scheduledAt.toISOString())
                        : "—"}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      {timeStr} · 60 minutos
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-heading text-lg font-semibold">
                  Notas para el profesional
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Opcional — describe brevemente lo que te gustaría trabajar en
                  esta sesión.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-4 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={4}
                  placeholder="Ej: Me gustaría hablar sobre un cambio de carrera…"
                />
              </div>

              {/* Create error */}
              {createError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {createError}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleContinueToPayment}
                disabled={isCreating || loadingPro}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparando pago…
                  </>
                ) : (
                  "Continuar al pago"
                )}
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Payment (Stripe Elements) ──────────────────────────── */}
          {step === "payment" && clientSecret && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Elements stripe={stripePromise}>
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={sessionAmount}
                  onSuccess={() => setStep("confirmed")}
                  onBack={() => setStep("review")}
                />
              </Elements>
            </motion.div>
          )}
        </div>

        {/* ── Right: summary card ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">Resumen</h3>

            {loadingPro ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ) : professional ? (
              <div className="mt-4 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {professional.user.image ? (
                    <Image
                      src={professional.user.image}
                      alt={professional.user.name ?? ""}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                      {professional.user.name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{professional.user.name}</p>
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {CATEGORY_LABELS[professional.category]}
                  </Badge>
                </div>
              </div>
            ) : null}

            <Separator className="my-4" />

            {loadingPro ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sesión (60 min)</span>
                  <span>{formatCurrency(hourlyRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa de servicio</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {scheduledAt && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(scheduledAt.toISOString())} · {timeStr}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    Cancelación gratuita hasta 24h antes
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page (Suspense boundary for useSearchParams) ──────────────────────────────

function BookingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-8 w-64" />
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingContent />
    </Suspense>
  );
}
