"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarOff, Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function BlockedDatesManager() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calendar state
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // New block form
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await fetch("/api/blocked-dates");
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data.blockedDates ?? []);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedDates();
  }, [fetchBlockedDates]);

  const isBlocked = (dateStr: string) =>
    blockedDates.some((b) => b.date.startsWith(dateStr));

  const getBlockedId = (dateStr: string) =>
    blockedDates.find((b) => b.date.startsWith(dateStr))?.id;

  const handleDayClick = async (dateStr: string) => {
    const blockedId = getBlockedId(dateStr);

    if (blockedId) {
      // Unblock
      setSaving(true);
      try {
        const res = await fetch("/api/blocked-dates", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: blockedId }),
        });
        if (res.ok) {
          setBlockedDates((prev) => prev.filter((b) => b.id !== blockedId));
          toast.success("Fecha desbloqueada");
        } else {
          toast.error("Error al desbloquear fecha");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        setSaving(false);
      }
    } else {
      // Show form to block
      setSelectedDate(dateStr);
      setReason("");
    }
  };

  const handleBlock = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, reason: reason.trim() || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedDates((prev) => [...prev, data.blockedDate]);
        setSelectedDate(null);
        setReason("");
        toast.success("Fecha bloqueada");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al bloquear fecha");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="glass rounded-2xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-semibold">
            {MONTHS_ES[viewMonth]} {viewYear}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day names */}
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {DAYS_ES.map((d) => (
            <span key={d} className="text-xs font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const blocked = isBlocked(dateStr);

            return (
              <button
                key={day}
                onClick={() => !isPast && handleDayClick(dateStr)}
                disabled={isPast || saving}
                className={`
                  flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${isPast ? "cursor-not-allowed text-muted-foreground/30" : "cursor-pointer hover:bg-muted"}
                  ${isToday && !blocked ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-background" : ""}
                  ${blocked ? "bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-500/15 ring-1 ring-red-500/30" />
            Bloqueado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded ring-2 ring-indigo-500" />
            Hoy
          </span>
        </div>
      </div>

      {/* Block form (when a date is selected) */}
      {selectedDate && (
        <div className="glass rounded-2xl p-4">
          <h4 className="mb-2 text-sm font-semibold">
            Bloquear {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Motivo (opcional): vacaciones, festivo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleBlock} disabled={saving} size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
              Bloquear
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Blocked dates list */}
      {blockedDates.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CalendarOff className="h-4 w-4" />
            Fechas bloqueadas ({blockedDates.length})
          </h4>
          <div className="space-y-2">
            {blockedDates.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium">
                    {new Date(b.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {b.reason && (
                    <span className="ml-2 text-xs text-muted-foreground">— {b.reason}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDayClick(b.date.split("T")[0])}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
