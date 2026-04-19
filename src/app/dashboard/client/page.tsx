"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Star,
  Video,
  MessageSquare,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
  Gift,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { BetaFeedbackModal } from "@/components/shared/beta-feedback-modal";
import { ReferralPanel } from "@/components/shared/referral-panel";
import { SessionChat } from "@/components/shared/session-chat";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { OnboardingTour, type TourStep } from "@/components/shared/onboarding-tour";
import { STATUS_LABELS, type Session } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

const CLIENT_TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: "¡Bienvenido/a a GuidePath!",
    description:
      "Te mostramos en 4 pasos cómo funciona tu panel. Puedes saltar la guía en cualquier momento.",
  },
  {
    target: '[data-tour="credits-stat"]',
    title: "Tus sesiones gratuitas",
    description:
      "Tienes 3 sesiones gratuitas al mes. El contador se reinicia el 1 de cada mes automáticamente.",
  },
  {
    target: '[data-tour="new-session-btn"]',
    title: "Reserva una sesión",
    description:
      "Pulsa aquí para explorar mentores, coaches y psicólogos.",
  },
  {
    target: '[data-tour="dashboard-tabs"]',
    title: "Navega por tu panel",
    description:
      "En Próximas verás tus sesiones activas. En Historial las pasadas. En Referidos invita amigos y gana créditos extra.",
  },
];

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

const CATEGORY_LABELS_REVIEW = {
  ratingPunctuality: "Puntualidad",
  ratingKnowledge: "Conocimiento",
  ratingCommunication: "Comunicación",
  ratingValue: "Satisfacción general",
} as const;

export default function ClientDashboard() {
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPunctuality, setReviewPunctuality] = useState(0);
  const [reviewKnowledge, setReviewKnowledge] = useState(0);
  const [reviewCommunication, setReviewCommunication] = useState(0);
  const [reviewValue, setReviewValue] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedSessionIds, setReviewedSessionIds] = useState<Set<string>>(new Set());
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const [credits, setCredits] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [referrals, setReferrals] = useState<{ referrals: never[]; stats: { total: 0; completed: 0; pending: 0; totalCredits: 0 } }>({ referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } });

  const pageRef = useRef<HTMLDivElement>(null);

  const fetchReferrals = useCallback(() => {
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : { referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } }))
      .then(setReferrals)
      .catch(() => {});
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewSessionId || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: reviewSessionId,
          rating: reviewRating,
          comment: reviewComment || undefined,
          ratingPunctuality: reviewPunctuality || undefined,
          ratingKnowledge: reviewKnowledge || undefined,
          ratingCommunication: reviewCommunication || undefined,
          ratingValue: reviewValue || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Reseña enviada correctamente");
        setReviewedSessionIds((prev) => {
          const next = new Set(Array.from(prev));
          next.add(reviewSessionId);
          return next;
        });
        setReviewSessionId(null);
        resetReviewForm();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al enviar reseña");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewSessionId, reviewRating, reviewComment, reviewPunctuality, reviewKnowledge, reviewCommunication, reviewValue]);

  function resetReviewForm() {
    setReviewRating(0);
    setReviewComment("");
    setReviewPunctuality(0);
    setReviewKnowledge(0);
    setReviewCommunication(0);
    setReviewValue(0);
  }

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then(setCredits)
      .catch(() => {});
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED" || s.status === "PENDING"),
    [sessions]
  );

  const pastSessions = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED"),
    [sessions]
  );

  const completedCount = pastSessions.filter((s) => s.status === "COMPLETED").length;

  // Bento reveal
  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;
      if (loadingSessions) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const header = root.querySelectorAll<HTMLElement>("[data-dash-head]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", root);

      if (reduced) {
        gsap.set(header, { opacity: 1, y: 0 });
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      if (header.length) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", stagger: 0.08 }
        );
      }

      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 44, scale: 0.95 });
        const batch = ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (els) => {
            gsap.to(els, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out",
              stagger: { amount: 0.5, from: "start" },
            });
          },
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => batch.forEach((st) => st.kill());
      }
    },
    { scope: pageRef, dependencies: [loadingSessions] }
  );

  if (loadingSessions) return <DashboardSkeleton />;

  const creditLimit = credits?.limit ?? CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH;
  const creditsUsed = credits?.used ?? 0;
  const creditsRemaining = credits?.remaining ?? creditLimit;
  const creditsPercent = Math.min(100, Math.round((creditsUsed / creditLimit) * 100));

  return (
    <div ref={pageRef} className="relative">
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 via-violet-500/8 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OnboardingTour storageKey="guidepath_tour_client_v1" steps={CLIENT_TOUR_STEPS} />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p data-dash-head className="text-xs font-semibold uppercase tracking-widest text-primary">
              Panel de cliente
            </p>
            <h1 data-dash-head className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Hola, {authSession?.user?.name?.split(" ")[0] || "bienvenido"}
            </h1>
            <p data-dash-head className="mt-2 max-w-xl text-muted-foreground">
              Gestiona tus sesiones, revisa tu historial y mantén tu camino profesional en movimiento.
            </p>
          </div>
          <Button data-dash-head asChild data-tour="new-session-btn" className="shrink-0">
            <Link href="/explore">
              Nueva sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats bento */}
        <div className="mt-10 grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          {/* HERO credits card */}
          <div
            data-bento-card
            data-tour="credits-stat"
            className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6 row-span-2"
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white sm:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" /> Freemium
                </span>
                <span className="text-xs font-medium opacity-80">
                  Este mes
                </span>
              </div>
              <div className="relative mt-auto">
                <p className="font-heading text-6xl font-bold leading-none tracking-tight sm:text-7xl">
                  {creditsRemaining}
                  <span className="ml-2 text-2xl font-medium opacity-70">/{creditLimit}</span>
                </p>
                <p className="mt-3 text-lg font-medium">
                  {creditsRemaining > 0
                    ? `sesiones disponibles este mes`
                    : "has usado todas tus sesiones de este mes"}
                </p>
                {/* Progress bar */}
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${creditsPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs opacity-80">
                  Se reinician el 1 de cada mes
                </p>
              </div>
            </div>
          </div>

          {/* Stat: completadas */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  <AnimatedCounter target={completedCount} decimals={0} />
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  sesiones completadas
                </p>
              </div>
            </div>
          </div>

          {/* Stat: próximas */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  <AnimatedCounter target={upcomingSessions.length} decimals={0} />
                </p>
                <p className="mt-2 text-xs font-medium opacity-90">
                  próximas sesiones
                </p>
              </div>
            </div>
          </div>

          {/* Stat: referidos */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  {referrals.stats.total}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  referidos enviados
                </p>
              </div>
            </div>
          </div>

          {/* Stat: reseñas */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  {reviewedSessionIds.size}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  reseñas dejadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="mt-10">
          <div data-tour="dashboard-tabs">
            <TabsList className="overflow-x-auto rounded-full bg-muted/70 p-1.5 backdrop-blur">
              <TabsTrigger value="upcoming" className="rounded-full">
                Próximas ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-full">
                Historial ({pastSessions.length})
              </TabsTrigger>
              <TabsTrigger value="referrals" className="rounded-full">
                Referidos
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-full">
                Mi perfil
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingSessions.length === 0 ? (
              <div data-bento-card className="rounded-3xl border bg-card/80 p-12 text-center backdrop-blur">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
                  <Calendar className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="font-heading text-xl font-semibold">
                  No tienes sesiones próximas
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explora profesionales y reserva tu primera sesión gratuita.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/explore">Explorar profesionales</Link>
                </Button>
              </div>
            ) : (
              <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    data-bento-card
                    className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
                  >
                    <div className="group flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 transition-all hover:shadow-lg sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                          <Image
                            src={session.professionalImage}
                            alt={session.professionalName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-heading font-semibold">
                            {session.professionalName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(session.scheduledAt)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(session.scheduledAt)}
                            </span>
                          </div>
                          <Badge
                            className={`mt-2 ${statusColors[session.status]}`}
                            variant="secondary"
                          >
                            {STATUS_LABELS[session.status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-end">
                        {["PENDING", "CONFIRMED"].includes(session.status) && (
                          <Button size="sm" variant="outline" onClick={() => setChatSessionId(session.id)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        )}
                        {session.status === "CONFIRMED" &&
                          (() => {
                            void now;
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
                                  <span className="text-[10px] text-muted-foreground">
                                    {waitMsg}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastSessions.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Sin historial todavía"
                description="Aquí verás las sesiones que ya hayas completado o cancelado."
              />
            ) : (
              <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    data-bento-card
                    className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
                  >
                    <div className="flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={session.professionalImage}
                            alt={session.professionalName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {session.professionalName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(session.scheduledAt)}</span>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400">Gratuita</span>
                          </div>
                          <Badge className={`mt-2 ${statusColors[session.status]}`} variant="secondary">
                            {STATUS_LABELS[session.status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {session.status === "COMPLETED" && !reviewedSessionIds.has(session.id) && (
                          <Button size="sm" variant="outline" onClick={() => setReviewSessionId(session.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            Reseña
                          </Button>
                        )}
                        {session.status === "COMPLETED" && (
                          <Button size="sm" variant="outline" onClick={() => setChatSessionId(session.id)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        )}
                        {session.status === "COMPLETED" && (
                          <Button size="sm" variant="ghost" onClick={() => setFeedbackSessionId(session.id)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <ReferralPanel
                referrals={referrals.referrals}
                stats={referrals.stats}
                userRole="CLIENT"
                onRefresh={fetchReferrals}
              />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Mi perfil</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Actualiza tu foto de perfil.
              </p>
              <div className="mt-6">
                <PhotoUpload currentImage={authSession?.user?.image || ""} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Beta feedback modal */}
      {feedbackSessionId && (
        <BetaFeedbackModal
          sessionId={feedbackSessionId}
          onClose={() => setFeedbackSessionId(null)}
        />
      )}

      {/* Review modal */}
      {reviewSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="mx-4 w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Dejar reseña</h3>
              <button
                onClick={() => {
                  setReviewSessionId(null);
                  resetReviewForm();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Valoración general</p>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        i < reviewRating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Valoraciones detalladas (opcional)</p>
              {(
                [
                  ["ratingPunctuality", reviewPunctuality, setReviewPunctuality],
                  ["ratingKnowledge", reviewKnowledge, setReviewKnowledge],
                  ["ratingCommunication", reviewCommunication, setReviewCommunication],
                  ["ratingValue", reviewValue, setReviewValue],
                ] as const
              ).map(([key, value, setter]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{CATEGORY_LABELS_REVIEW[key]}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => (setter as (_v: number) => void)(i + 1)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            i < value ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Comenta tu experiencia (opcional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setReviewSessionId(null);
                  resetReviewForm();
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}>
                {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar reseña
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur sm:items-center">
          <div
            className="mx-0 flex w-full max-w-lg flex-col rounded-t-3xl border bg-card shadow-xl sm:mx-4 sm:rounded-3xl"
            style={{ height: "min(600px, 80vh)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-heading text-base font-semibold">Chat de sesión</h3>
              <button onClick={() => setChatSessionId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SessionChat sessionId={chatSessionId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
