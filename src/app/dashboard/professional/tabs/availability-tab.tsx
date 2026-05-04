"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Check, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AvailabilitySlot } from "./types";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const EMPTY_AVAILABILITY: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: false, priorityOnly: false },
  { dayOfWeek: 2, startTime: "09:00", endTime: "14:00", enabled: false, priorityOnly: false },
  { dayOfWeek: 3, startTime: "09:00", endTime: "14:00", enabled: false, priorityOnly: false },
  { dayOfWeek: 4, startTime: "09:00", endTime: "14:00", enabled: false, priorityOnly: false },
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", enabled: false, priorityOnly: false },
  { dayOfWeek: 6, startTime: "", endTime: "", enabled: false, priorityOnly: false },
  { dayOfWeek: 0, startTime: "", endTime: "", enabled: false, priorityOnly: false },
];

function buildAvailability(initial: AvailabilitySlot[]): AvailabilitySlot[] {
  if (initial.length === 0) return EMPTY_AVAILABILITY;
  return EMPTY_AVAILABILITY.map((slot) => {
    const db = initial.find((a) => a.dayOfWeek === slot.dayOfWeek);
    return db
      ? {
          dayOfWeek: db.dayOfWeek,
          startTime: db.startTime,
          endTime: db.endTime,
          enabled: true,
          priorityOnly: db.priorityOnly ?? false,
        }
      : slot;
  });
}

interface Props {
  initialAvailability: AvailabilitySlot[];
  onSaved?: (enabled: AvailabilitySlot[]) => void;
}

export default function AvailabilityTab({ initialAvailability, onSaved }: Props) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    () => buildAvailability(initialAvailability)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const invalid = availability.find(
      (s) => s.enabled && s.startTime && s.endTime && s.startTime >= s.endTime
    );
    if (invalid) {
      toast.error(`${DAYS[invalid.dayOfWeek]}: la hora de fin debe ser posterior a la hora de inicio`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: availability }),
      });
      if (res.ok) {
        toast.success("Disponibilidad guardada correctamente");
        onSaved?.(availability.filter((s) => s.enabled));
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }, [availability, onSaved]);

  return (
    <div className="mt-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Horario semanal</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura los días y horarios en los que estás disponible para sesiones.
        </p>

        <div className="mt-6 space-y-4">
          {availability.map((slot, idx) => (
            <div key={slot.dayOfWeek} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex w-32 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...availability];
                    updated[idx] = { ...slot, enabled: !slot.enabled };
                    setAvailability(updated);
                  }}
                  className={`h-5 w-5 rounded border transition-colors ${
                    slot.enabled ? "border-primary bg-primary" : "border-input"
                  }`}
                >
                  {slot.enabled && (
                    <Check className="h-full w-full p-0.5 text-primary-foreground" />
                  )}
                </button>
                <span className={`text-sm font-medium ${!slot.enabled ? "text-muted-foreground" : ""}`}>
                  {DAYS[slot.dayOfWeek] ?? ""}
                </span>
              </div>

              {slot.enabled && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => {
                      const updated = [...availability];
                      updated[idx] = { ...slot, startTime: e.target.value };
                      setAvailability(updated);
                    }}
                    className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">a</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => {
                      const updated = [...availability];
                      updated[idx] = { ...slot, endTime: e.target.value };
                      setAvailability(updated);
                    }}
                    className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...availability];
                      updated[idx] = { ...slot, priorityOnly: !slot.priorityOnly };
                      setAvailability(updated);
                    }}
                    title="Reservar este horario solo a clientes Premium"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      slot.priorityOnly
                        ? "border-amber-300 bg-gradient-to-r from-teal-50 to-amber-50 text-amber-700 dark:border-amber-800 dark:from-teal-950/40 dark:to-amber-950/40 dark:text-amber-300"
                        : "border-stone-200 text-stone-500 hover:border-stone-300 dark:border-stone-700 dark:text-stone-400"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Solo Premium
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Marca un horario como <span className="font-medium">Solo Premium</span> para reservarlo a clientes con plan de pago. Útil para tus mejores franjas.
        </p>

        <Separator className="my-6" />

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar disponibilidad
        </Button>
      </div>
    </div>
  );
}
