"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, CheckCircle2, Clock, Calendar, ChevronLeft,
  MessageSquare, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { TIME_SLOTS } from "@/data/mock";
import { CATEGORY_LABELS, type ProfessionalCategory } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const DAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

interface ApiProfile {
  id: string;
  category: ProfessionalCategory;
  headline: string | null;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  user: { id: string; name: string | null; image: string | null; bio: string | null };
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  sessions: {
    id: string;
    review: { id: string; rating: number; comment: string | null; createdAt: string } | null;
    client: { name: string | null; image: string | null };
  }[];
}

function getNextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function ProfessionalProfilePage() {
  const params = useParams();
  const [professional, setProfessional] = useState<ApiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/professionals/${params.id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        setProfessional(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const nextDays = useMemo(() => getNextDays(14), []);

  const availableDays = useMemo(() => {
    if (!professional) return [];
    const dow = professional.availability.map((a) => a.dayOfWeek);
    return nextDays.filter((d) => dow.includes(d.getDay()));
  }, [professional, nextDays]);

  const availableSlots = useMemo(() => {
    if (!professional || !selectedDate) return [];
    const slot = professional.availability.find(
      (a) => a.dayOfWeek === selectedDate.getDay()
    );
    if (!slot) return [];
    return TIME_SLOTS.filter((s) => s >= slot.startTime && s < slot.endTime);
  }, [professional, selectedDate]);

  const reviews = useMemo(
    () => professional?.sessions.filter((s) => s.review).slice(0, 4) ?? [],
    [professional]
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-6">
              <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !professional) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Profesional no encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          El perfil que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/explore">Volver a explorar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          <FadeIn>
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
                {professional.user.image ? (
                  <Image
                    src={professional.user.image}
                    alt={professional.user.name ?? ""}
                    fill className="object-cover" sizes="128px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground">
                    {professional.user.name?.[0] ?? "?"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">
                    {professional.user.name}
                  </h1>
                  {professional.verified && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <p className="mt-1 text-lg text-muted-foreground">{professional.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">{CATEGORY_LABELS[professional.category]}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{professional.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({professional.reviewCount} reseñas)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> Sesiones de 60 min
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" /> Videollamada
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div>
              <h2 className="font-heading text-xl font-semibold">Sobre mí</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {professional.user.bio ?? "Este profesional aún no ha añadido una biografía."}
              </p>
            </div>
          </FadeIn>

          <Separator />

          <FadeIn delay={0.15}>
            <div>
              <h2 className="font-heading text-xl font-semibold">Disponibilidad semanal</h2>
              {professional.availability.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Este profesional aún no ha configurado su disponibilidad.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {professional.availability.map((slot) => (
                    <div key={slot.id} className="rounded-lg border bg-card p-3 text-center">
                      <p className="text-sm font-medium">{DAYS[slot.dayOfWeek]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          <Separator />

          <FadeIn delay={0.2}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold">Reseñas</h2>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-heading text-lg font-bold">{professional.rating}</span>
                  <span className="text-sm text-muted-foreground">({professional.reviewCount})</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Aún no hay reseñas. ¡Sé el primero en dejar una!
                </p>
              ) : (
                <div className="mt-6 space-y-6">
                  {reviews.map(({ id, review, client }) => (
                    <div key={id} className="flex gap-4">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                        {client.image ? (
                          <Image src={client.image} alt={client.name ?? ""} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                            {client.name?.[0] ?? "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(review!.createdAt)}</p>
                        </div>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review!.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{review!.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Right — Booking card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-24"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="text-center">
                <span className="font-heading text-3xl font-bold text-primary">
                  {formatCurrency(professional.hourlyRate)}
                </span>
                <span className="text-muted-foreground"> / sesión</span>
              </div>

              <Separator className="my-6" />

              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4" /> Selecciona fecha
              </h3>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {availableDays.slice(0, 7).map((day) => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                      className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">{DAYS[day.getDay()].slice(0, 3)}</span>
                      <span className="mt-0.5 text-lg font-bold">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {availableDays.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  No hay disponibilidad en los próximos 14 días.
                </p>
              )}

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4" /> Selecciona hora
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                          selectedTime === slot ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <Button
                className="mt-6 w-full" size="lg"
                disabled={!selectedDate || !selectedTime}
                asChild={!!(selectedDate && selectedTime)}
              >
                {selectedDate && selectedTime ? (
                  <Link href={`/book/new?professional=${professional.id}&date=${selectedDate.toISOString()}&time=${selectedTime}`}>
                    Reservar sesión
                  </Link>
                ) : (
                  <span>Selecciona fecha y hora</span>
                )}
              </Button>

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
