"use client";

import { useState } from "react";
import { Check, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const EMPTY_AVAILABILITY = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 2, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 3, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 4, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", enabled: false },
  { dayOfWeek: 6, startTime: "", endTime: "", enabled: false },
  { dayOfWeek: 0, startTime: "", endTime: "", enabled: false },
];

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface AvailabilityEditorProps {
  initialSlots?: AvailabilitySlot[];
  onSaved?: () => void;
  showSaveButton?: boolean;
  compact?: boolean;
}

export function AvailabilityEditor({
  initialSlots,
  onSaved,
  showSaveButton = true,
  compact = false,
}: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    initialSlots ?? EMPTY_AVAILABILITY
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: availability }),
      });

      if (res.ok) {
        toast.success("Disponibilidad guardada correctamente");
        onSaved?.();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar disponibilidad");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {availability.map((slot, idx) => (
          <div
            key={slot.dayOfWeek}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
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
                  <Check className="h-full w-full text-primary-foreground p-0.5" />
                )}
              </button>
              <span
                className={`text-sm font-medium ${
                  !slot.enabled ? "text-muted-foreground" : ""
                }`}
              >
                {DAYS[slot.dayOfWeek] ?? ""}
              </span>
            </div>

            {slot.enabled && (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        ))}
      </div>

      {showSaveButton && (
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar disponibilidad
          </Button>
        </div>
      )}
    </div>
  );
}
