"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Video,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { STATUS_LABELS } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Mock availability for the settings tab
const defaultAvailability = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "14:00", enabled: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "14:00", enabled: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "14:00", enabled: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", enabled: true },
  { dayOfWeek: 6, startTime: "", endTime: "", enabled: false },
  { dayOfWeek: 0, startTime: "", endTime: "", enabled: false },
];

export default function ProfessionalDashboard() {
  const [sessions, setSessions] = useState<{ id: string; clientId: string; professionalId: string; clientName: string; clientImage: string; scheduledAt: string; duration: number; status: string; price: number; dailyRoomUrl?: string | null }[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [availability, setAvailability] = useState(defaultAvailability);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, []);

  const confirmedSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED"),
    [sessions]
  );

  const pendingSessions = useMemo(
    () => sessions.filter((s) => s.status === "PENDING"),
    [sessions]
  );

  const totalEarnings = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED").reduce((acc, s) => acc + s.price, 0),
    [sessions]
  );
  const totalSessions = sessions.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          Panel Profesional
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tus sesiones, disponibilidad e ingresos.
        </p>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Ingresos totales",
              value: formatCurrency(totalEarnings),
              icon: DollarSign,
              change: "+12%",
            },
            {
              label: "Este mes",
              value: formatCurrency(0),
              icon: TrendingUp,
              change: "+8%",
            },
            {
              label: "Sesiones totales",
              value: totalSessions.toString(),
              icon: Users,
              change: null,
            },
            {
              label: "Próximas sesiones",
              value: (confirmedSessions.length + pendingSessions.length).toString(),
              icon: Calendar,
              change: null,
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                {stat.change && (
                  <span className="text-xs font-medium text-green-600">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="sessions" className="mt-8">
          <TabsList>
            <TabsTrigger value="sessions">
              Sesiones ({confirmedSessions.length + pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="earnings">Ingresos</TabsTrigger>
          </TabsList>

          {/* Sessions */}
          <TabsContent value="sessions" className="mt-6 space-y-6">
            {/* Pending approvals */}
            {pendingSessions.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold">
                  Pendientes de aprobación
                </h3>
                <div className="mt-3 space-y-3">
                  {pendingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-5 dark:border-yellow-900/30 dark:bg-yellow-900/10 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{session.clientName}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(session.scheduledAt)}
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(session.scheduledAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                        <Button size="sm">
                          <Check className="mr-1 h-4 w-4" />
                          Aceptar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed sessions */}
            <div>
              <h3 className="font-heading text-lg font-semibold">
                Próximas sesiones confirmadas
              </h3>
              <div className="mt-3 space-y-3">
                {confirmedSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{session.clientName}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(session.scheduledAt)}
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(session.scheduledAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatCurrency(session.price)}
                      </span>
                      <Button size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Iniciar sesión
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Availability */}
          <TabsContent value="availability" className="mt-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Horario semanal
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configura los días y horarios en los que estás disponible para
                sesiones.
              </p>

              <div className="mt-6 space-y-4">
                {availability.map((slot, idx) => (
                  <div
                    key={slot.dayOfWeek}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex w-32 items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = [...availability];
                          updated[idx] = {
                            ...updated[idx],
                            enabled: !updated[idx].enabled,
                          };
                          setAvailability(updated);
                        }}
                        className={`h-5 w-5 rounded border transition-colors ${
                          slot.enabled
                            ? "border-primary bg-primary"
                            : "border-input"
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
                        {DAYS[slot.dayOfWeek]}
                      </span>
                    </div>

                    {slot.enabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = {
                              ...updated[idx],
                              startTime: e.target.value,
                            };
                            setAvailability(updated);
                          }}
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          a
                        </span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = {
                              ...updated[idx],
                              endTime: e.target.value,
                            };
                            setAvailability(updated);
                          }}
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <Button>Guardar disponibilidad</Button>
            </div>
          </TabsContent>

          {/* Earnings */}
          <TabsContent value="earnings" className="mt-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Resumen de ingresos
              </h3>

              <div className="mt-6 space-y-4">
                {[
                  { month: "Enero 2025", sessions: 12, amount: 780 },
                  { month: "Diciembre 2024", sessions: 15, amount: 975 },
                  { month: "Noviembre 2024", sessions: 10, amount: 650 },
                  { month: "Octubre 2024", sessions: 8, amount: 520 },
                  { month: "Septiembre 2024", sessions: 7, amount: 455 },
                ].map((row) => (
                  <div
                    key={row.month}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{row.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {row.sessions} sesiones
                      </p>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary">
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Conectado con Stripe
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Los pagos se transfieren automáticamente a tu cuenta
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar Stripe
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
