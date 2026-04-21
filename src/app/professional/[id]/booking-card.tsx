"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, MessageSquare, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { AvailabilitySlot } from "@/types";

const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];

const DAYS = [
  "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado",
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

interface BookingCardProps {
  professionalId: string;
  hourlyRate?: number;
  availability: AvailabilitySlot[];
  socialImpactScore?: number;
}

export const BookingCard = memo(function BookingCard({ professionalId, availability, socialImpactScore }: BookingCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const nextDays = useMemo(() => getNextDays(14), []);

  const availableDays = useMemo(() => {
    const availableDayOfWeek = availability.map((a) => a.dayOfWeek);
    return nextDays.filter((d) => availableDayOfWeek.includes(d.getDay()));
  }, [availability, nextDays]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayAvailability = availability.find(
      (a) => a.dayOfWeek === selectedDate.getDay()
    );
    if (!dayAvailability) return [];
    return TIME_SLOTS.filter(
      (slot) =>
        slot >= dayAvailability.startTime && slot < dayAvailability.endTime
    );
  }, [availability, selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:sticky lg:top-24"
    >
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center">
          <Badge className="bg-teal-600 text-white text-sm px-4 py-1 border-0">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Sesión gratuita
          </Badge>
          {socialImpactScore !== undefined && socialImpactScore > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 tabular">
                Impacto social: {socialImpactScore.toFixed(1)} pts
              </span>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4" />
          Selecciona fecha
        </h3>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
          {availableDays.slice(0, 7).map((day) => {
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            return (
              <button
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                aria-label={`${DAYS[day.getDay()]} ${day.getDate()} de ${day.toLocaleDateString("es-ES", { month: "long" })}`}
                aria-pressed={isSelected}
                className={`flex shrink-0 snap-center flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all ${
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{DAYS[day.getDay()].slice(0, 3)}</span>
                <span className="mt-0.5 text-lg font-bold tabular">{day.getDate()}</span>
              </button>
            );
          })}
        </div>

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
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  aria-label={`Hora ${slot}`}
                  aria-pressed={selectedTime === slot}
                  className={`rounded-lg border px-3 py-2 text-sm tabular transition-all ${
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
          className="mt-6 w-full"
          size="lg"
          disabled={!selectedDate || !selectedTime}
          asChild={selectedDate && selectedTime ? true : undefined}
        >
          {selectedDate && selectedTime ? (
            <Link href={`/book/new?${new URLSearchParams({ professional: professionalId, date: selectedDate.toISOString(), time: selectedTime! }).toString()}`}>
              Reservar sesión gratuita
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
  );
});
