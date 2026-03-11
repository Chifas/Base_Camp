"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, Clock, DollarSign, TrendingUp, Users,
  Video, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { type SessionStatus } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ApiSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: SessionStatus;
  price: number;
  client: { id: string; name: string | null; image: string | null };
}

const DAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

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
  const [sessions, setSessions]       = useState<ApiSession[]>([]);
  const [loading, setLoading]         = useState(true);
  const [availability, setAvailability] = useState(defaultAvailability);

  useEffect(() => {
    fetch("/api/sessions?role=professional")
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateSessionStatus(id: string, status: "CONFIRMED" | "CANCELLED") {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    }
  }

  const confirmedSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED"),
    [sessions]
  );
  const pendingSessions = useMemo(
    () => sessions.filter((s) => s.status === "PENDING"),
    [sessions]
  );
  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED"),
    [sessions]
  );

  const totalEarnings   = useMemo(() => completedSessions.reduce((a, s) => a + s.price * 0.8, 0), [completedSessions]);
  const currentMonth    = new Date().getMonth();
  const monthlyEarnings = useMemo(
    () => completedSessions
      .filter((s) => new Date(s.scheduledAt).getMonth() === currentMonth)
      .reduce((a, s) => a + s.price * 0.8, 0),
    [completedSessions, currentMonth]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Panel Profesional</h1>
        <p className="mt-1 text-muted-foreground">Gestiona tus sesiones, disponibilidad e ingresos.</p>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="mt-2 h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            ))
          ) : (
            [
              { label: "Ingresos totales",   value: formatCurrency(totalEarnings),   icon: DollarSign, change: null },
              { label: "Este mes",           value: formatCurrency(monthlyEarnings), icon: TrendingUp, change: null },
              { label: "Sesiones totales",   value: completedSessions.length.toString(), icon: Users, change: null },
              { label: "Próximas sesiones",  value: (confirmedSessions.length + pendingSessions.length).toString(), icon: Calendar, change: null },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-4">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))
          )}
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="sessions" className="mt-8">
          <TabsList>
            <TabsTrigger value="sessions">
              Sesiones ({loading ? "…" : confirmedSessions.length + pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="earnings">Ingresos</TabsTrigger>
          </TabsList>

          {/* Sessions */}
          <TabsContent value="sessions" className="mt-6 space-y-6">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : (
              <>
                {/* Pending */}
                {pendingSessions.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Pendientes de aprobación</h3>
                    <div className="mt-3 space-y-3">
                      {pendingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col gap-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-5 dark:border-yellow-900/30 dark:bg-yellow-900/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{session.client.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" /> {formatDate(session.scheduledAt)}
                              <Clock className="h-3.5 w-3.5" /> {formatTime(session.scheduledAt)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => updateSessionStatus(session.id, "CANCELLED")}
                            >
                              <X className="mr-1 h-4 w-4" /> Rechazar
                            </Button>
                            <Button size="sm" onClick={() => updateSessionStatus(session.id, "CONFIRMED")}>
                              <Check className="mr-1 h-4 w-4" /> Aceptar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmed */}
                <div>
                  <h3 className="font-heading text-lg font-semibold">Próximas sesiones confirmadas</h3>
                  {confirmedSessions.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">No hay sesiones confirmadas por el momento.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {confirmedSessions.map((session, i) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{session.client.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" /> {formatDate(session.scheduledAt)}
                              <Clock className="h-3.5 w-3.5" /> {formatTime(session.scheduledAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{formatCurrency(session.price)}</span>
                            <Button size="sm" asChild>
                              <Link href={`/session/${session.id}`}>
                                <Video className="mr-2 h-4 w-4" /> Iniciar sesión
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Availability — still local state, saved to API in a future iteration */}
          <TabsContent value="availability" className="mt-6">
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
                        onClick={() => {
                          const updated = [...availability];
                          updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                          setAvailability(updated);
                        }}
                        className={`h-5 w-5 rounded border transition-colors ${slot.enabled ? "border-primary bg-primary" : "border-input"}`}
                      >
                        {slot.enabled && <Check className="h-full w-full text-primary-foreground p-0.5" />}
                      </button>
                      <span className={`text-sm font-medium ${!slot.enabled ? "text-muted-foreground" : ""}`}>
                        {DAYS[slot.dayOfWeek]}
                      </span>
                    </div>
                    {slot.enabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time" value={slot.startTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = { ...updated[idx], startTime: e.target.value };
                            setAvailability(updated);
                          }}
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">a</span>
                        <input
                          type="time" value={slot.endTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = { ...updated[idx], endTime: e.target.value };
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
              <h3 className="font-heading text-lg font-semibold">Resumen de ingresos</h3>
              {loading ? (
                <div className="mt-6 space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : completedSessions.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Aún no tienes sesiones completadas.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {completedSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{session.client.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(session.scheduledAt)}</p>
                      </div>
                      <span className="font-heading text-lg font-bold text-primary">
                        {formatCurrency(session.price * 0.8)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conectado con Stripe</p>
                  <p className="text-xs text-muted-foreground">Los pagos se transfieren automáticamente a tu cuenta</p>
                </div>
                <Button variant="outline" size="sm">Configurar Stripe</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
