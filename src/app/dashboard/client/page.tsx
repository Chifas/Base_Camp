"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar, Clock, Star, Video, MessageSquare, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { STATUS_LABELS, type SessionStatus } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ApiSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: SessionStatus;
  price: number;
  dailyRoomUrl: string | null;
  review: { id: string } | null;
  professional: {
    id: string;
    user: { id: string; name: string | null; image: string | null };
  };
}

const statusColors: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export default function ClientDashboard() {
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/sessions?role=client")
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED" || s.status === "PENDING"),
    [sessions]
  );
  const pastSessions = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED"),
    [sessions]
  );
  const totalSpent  = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED").reduce((a, s) => a + s.price, 0),
    [sessions]
  );
  const reviewsLeft = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED" && s.review).length,
    [sessions]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">Mi Panel</h1>
            <p className="mt-1 text-muted-foreground">Gestiona tus sesiones y revisa tu historial.</p>
          </div>
          <Button asChild>
            <Link href="/explore">
              Nueva sesión <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
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
              { label: "Próximas sesiones",    value: upcomingSessions.length.toString(), icon: Calendar },
              { label: "Sesiones completadas", value: pastSessions.filter(s => s.status === "COMPLETED").length.toString(), icon: Clock },
              { label: "Total invertido",      value: formatCurrency(totalSpent), icon: Star },
              { label: "Reseñas dejadas",      value: reviewsLeft.toString(), icon: MessageSquare },
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
        <Tabs defaultValue="upcoming" className="mt-8">
          <TabsList>
            <TabsTrigger value="upcoming">
              Próximas ({loading ? "…" : upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Historial ({loading ? "…" : pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 font-heading text-lg font-semibold">No tienes sesiones próximas</h3>
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
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {session.professional.user.image ? (
                          <Image src={session.professional.user.image} alt={session.professional.user.name ?? ""} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                            {session.professional.user.name?.[0] ?? "?"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{session.professional.user.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(session.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {formatTime(session.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[session.status]} variant="secondary">
                        {STATUS_LABELS[session.status]}
                      </Badge>
                      {session.status === "CONFIRMED" && (
                        <Button size="sm" asChild>
                          <Link href={`/session/${session.id}`}>
                            <Video className="mr-2 h-4 w-4" /> Unirse
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 font-heading text-lg font-semibold">Sin historial aún</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tus sesiones completadas aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {session.professional.user.image ? (
                          <Image src={session.professional.user.image} alt={session.professional.user.name ?? ""} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                            {session.professional.user.name?.[0] ?? "?"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{session.professional.user.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(session.scheduledAt)}</span>
                          <span>·</span>
                          <span>{formatCurrency(session.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[session.status]} variant="secondary">
                        {STATUS_LABELS[session.status]}
                      </Badge>
                      {session.status === "COMPLETED" && !session.review && (
                        <Button size="sm" variant="outline">
                          <Star className="mr-2 h-4 w-4" /> Dejar reseña
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
