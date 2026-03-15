"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronLeft,
  MessageSquare,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/shared/motion-wrapper";
import type { Professional, Review } from "@/types";

const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];
import { formatCurrency, formatDate } from "@/lib/utils";

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function getNextDays(count: number) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
}

export default function ProfessionalProfilePage() {
  const params = useParams();
  const [professional, setProfessional] = useState<(Professional & { reviews: Review[]; blockedDates?: { id: string; date: string; reason: string | null }[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/professionals/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setProfessional(data))
      .catch(() => setProfessional(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const nextDays = useMemo(() => getNextDays(14), []);

  // Filter available days based on professional availability and blocked dates
  const availableDays = useMemo(() => {
    if (!professional) return [];
    const availableDayOfWeek = professional.availability.map(
      (a) => a.dayOfWeek
    );
    const blockedDateStrings = new Set(
      (professional.blockedDates ?? []).map((b) =>
        new Date(b.date).toDateString()
      )
    );
    return nextDays.filter(
      (d) =>
        availableDayOfWeek.includes(d.getDay()) &&
        !blockedDateStrings.has(d.toDateString())
    );
  }, [professional, nextDays]);

  // Filter available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!professional || !selectedDate) return [];
    const dayAvailability = professional.availability.find(
      (a) => a.dayOfWeek === selectedDate.getDay()
    );
    if (!dayAvailability) return [];
    return TIME_SLOTS.filter(
      (slot) =>
        slot >= dayAvailability.startTime && slot < dayAvailability.endTime
    );
  }, [professional, selectedDate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">
          Profesional no encontrado
        </h1>
        <p className="mt-2 text-muted-foreground">
          El perfil que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/explore">Volver a explorar</Link>
        </Button>
      </div>
    );
  }

  const professionalReviews = professional.reviews?.slice(0, 4) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <FadeIn>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a explorar
        </Link>
      </FadeIn>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Left column - Profile info */}
        <div className="lg:col-span-2 space-y-8">
          <FadeIn>
            {/* Profile header */}
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={professional.image}
                  alt={professional.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">
                    {professional.name}
                  </h1>
                  {professional.verified && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <p className="mt-1 text-lg text-muted-foreground">
                  {professional.headline}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">
                    {professional.categoryName}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {professional.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({professional.reviewCount} reseñas)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Sesiones de 60 min
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    Videollamada
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Bio */}
          <FadeIn delay={0.1}>
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Sobre mí
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {professional.bio}
              </p>
            </div>
          </FadeIn>

          <Separator />

          {/* Availability overview */}
          <FadeIn delay={0.15}>
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Disponibilidad semanal
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {professional.availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-lg border bg-card p-3 text-center"
                  >
                    <p className="text-sm font-medium">
                      {DAYS[slot.dayOfWeek]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <Separator />

          {/* Reviews */}
          <FadeIn delay={0.2}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold">
                  Reseñas
                </h2>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-heading text-lg font-bold">
                    {professional.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({professional.reviewCount})
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {professionalReviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={review.userImage}
                        alt={review.userName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {review.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right column - Booking card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-24"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              {/* Price */}
              <div className="text-center">
                <span className="font-heading text-3xl font-bold text-primary">
                  {formatCurrency(professional.hourlyRate)}
                </span>
                <span className="text-muted-foreground"> / sesión</span>
              </div>

              <Separator className="my-6" />

              {/* Date selection */}
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4" />
                Selecciona fecha
              </h3>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {availableDays.slice(0, 7).map((day) => {
                  const isSelected =
                    selectedDate?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">
                        {DAYS[day.getDay()].slice(0, 3)}
                      </span>
                      <span className="mt-0.5 text-lg font-bold">
                        {day.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time selection */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    Selecciona hora
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                          selectedTime === slot
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Book button */}
              <Button
                className="mt-6 w-full"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                asChild={selectedDate && selectedTime ? true : undefined}
              >
                {selectedDate && selectedTime ? (
                  <Link href={`/book/new?professional=${professional.id}&date=${selectedDate.toISOString()}&time=${selectedTime}`}>
                    Reservar sesión
                  </Link>
                ) : (
                  <span>Selecciona fecha y hora</span>
                )}
              </Button>

              {/* Info */}
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Cancelación gratuita hasta 24h antes
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" />
                  Videollamada integrada en la plataforma
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
