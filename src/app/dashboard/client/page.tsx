"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Star,
  Video,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { STATUS_LABELS, type Session } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

function isJoinEnabled(scheduledAt: string, durationMin: number): boolean {
  const now = Date.now();
  const sessionTime = new Date(scheduledAt).getTime();
  const twoHoursBefore = sessionTime - 2 * 60 * 60 * 1000;
  const sessionEnd = sessionTime + durationMin * 60 * 1000;
  return now >= twoHoursBefore && now <= sessionEnd;
}

function timeUntilEnabled(scheduledAt: string): string {
  const sessionTime = new Date(scheduledAt).getTime();
  const twoHoursBefore = sessionTime - 2 * 60 * 60 * 1000;
  const diff = twoHoursBefore - Date.now();
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Disponible en ${h}h ${m}m`;
  return `Disponible en ${m}m`;
}

export default function ClientDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const upcomingSessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.status === "CONFIRMED" || s.status === "PENDING"
      ),
    [sessions]
  );

  const pastSessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.status === "COMPLETED" || s.status === "CANCELLED"
      ),
    [sessions]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              Mi Panel
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona tus sesiones y revisa tu historial.
            </p>
          </div>
          <Button asChild>
            <Link href="/explore">
              Nueva sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Próximas sesiones", value: upcomingSessions.length.toString(), icon: Calendar },
            { label: "Sesiones completadas", value: pastSessions.filter((s) => s.status === "COMPLETED").length.toString(), icon: Clock },
            { label: "Total invertido", value: formatCurrency(sessions.reduce((acc, s) => acc + (s.status === "COMPLETED" ? s.price : 0), 0)), icon: Star },
            { label: "Reseñas dejadas", value: "2", icon: MessageSquare },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-4"
            >
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 font-heading text-2xl font-bold">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Sessions tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="upcoming" className="mt-8">
          <TabsList>
            <TabsTrigger value="upcoming">
              Próximas ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Historial ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingSessions.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  No tienes sesiones próximas
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explora profesionales y reserva tu primera sesión.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/explore">Explorar profesionales</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={session.professionalImage}
                          alt={session.professionalName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {session.professionalName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(session.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(session.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 sm:items-center sm:flex-row sm:gap-3">
                      <Badge
                        className={statusColors[session.status]}
                        variant="secondary"
                      >
                        {STATUS_LABELS[session.status]}
                      </Badge>
                      {session.status === "CONFIRMED" && (() => {
                        void now; // re-render on tick
                        const canJoin = isJoinEnabled(session.scheduledAt, session.duration);
                        const waitMsg = timeUntilEnabled(session.scheduledAt);
                        return canJoin ? (
                          <Button size="sm" asChild>
                            <Link href={`/session/${session.id}`}>
                              <Video className="mr-2 h-4 w-4" />
                              Unirse
                            </Link>
                          </Button>
                        ) : (
                          <div className="flex flex-col items-end gap-0.5">
                            <Button size="sm" disabled>
                              <Video className="mr-2 h-4 w-4" />
                              Unirse
                            </Button>
                            {waitMsg && (
                              <span className="text-xs text-muted-foreground">{waitMsg}</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="space-y-4">
              {pastSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={session.professionalImage}
                        alt={session.professionalName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {session.professionalName}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(session.scheduledAt)}</span>
                        <span>·</span>
                        <span>{formatCurrency(session.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={statusColors[session.status]}
                      variant="secondary"
                    >
                      {STATUS_LABELS[session.status]}
                    </Badge>
                    {session.status === "COMPLETED" && (
                      <Button size="sm" variant="outline">
                        <Star className="mr-2 h-4 w-4" />
                        Dejar reseña
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
