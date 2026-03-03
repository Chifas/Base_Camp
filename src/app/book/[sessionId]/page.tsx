"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PROFESSIONALS } from "@/data/mock";
import { CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function BookingPage() {
  const [step, setStep] = useState<"review" | "payment" | "confirmed">(
    "review"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock booking data
  const professional = PROFESSIONALS[0];
  const bookingDate = "Lunes, 20 de enero de 2025";
  const bookingTime = "10:00 - 11:00";
  const platformFee = professional.hourlyRate * 0.1;
  const total = professional.hourlyRate;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("confirmed");
    }, 2000);
  };

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
        {/* Left - Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === "review"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <div className="h-px flex-1 bg-border" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === "payment"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          {step === "review" && (
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
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep("payment")}
              >
                Continuar al pago
              </Button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-xl border bg-card p-6">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <CreditCard className="h-5 w-5" />
                  Información de pago
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pago seguro procesado por Stripe
                </p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Número de tarjeta
                    </label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Fecha de expiración
                      </label>
                      <Input placeholder="MM / AA" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVC</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Tu información de pago está encriptada y segura
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("review")}
                >
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Pagar ${formatCurrency(total)}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}
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
                <span className="text-muted-foreground">
                  Sesión (60 min)
                </span>
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
