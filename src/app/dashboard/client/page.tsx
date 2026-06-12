"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  Heart,
  ExternalLink,
  RotateCcw,
  FileText,
} from "lucide-react";
import { SessionNotesViewer } from "@/components/shared/session-notes-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";
import { DashboardHero } from "@/components/shared/dashboard-hero";
import { Compass, CalendarClock } from "lucide-react";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { BetaFeedbackModal } from "@/components/shared/beta-feedback-modal";
import { ReferralPanel } from "@/components/shared/referral-panel";
import { SessionChat } from "@/components/shared/session-chat";
import { SubscriptionTab } from "./subscription-tab";
import { ProfileTab } from "./profile-tab";
import { OnboardingTour, type TourStep } from "@/components/shared/onboarding-tour";
import { STATUS_LABELS, type Session } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { CREDITS_CONFIG } from "@/lib/credits-config";

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
      "Pulsa aquí para explorar mentores, coaches y psicólogos. Elige el que mejor se adapte a lo que necesitas.",
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

// Must mirror the TabsTrigger values rendered below.
const CLIENT_TABS = ["upcoming", "past", "saved", "subscription", "referrals", "profile"] as const;
type ClientTab = typeof CLIENT_TABS[number];

interface SavedProfessional {
  professionalId: string;
  name: string;
  image: string;
  bio: string;
  headline: string;
  category: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: ClientTab = (CLIENT_TABS as readonly string[]).includes(rawTab ?? "")
    ? (rawTab as ClientTab)
    : "upcoming";

  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Review modal state
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
  const [notesView, setNotesView] = useState<{ id: string; name: string } | null>(null);

  // Credits state
  const [credits, setCredits] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [savedPros, setSavedPros] = useState<SavedProfessional[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Referrals state
  const [referrals, setReferrals] = useState<{ referrals: never[]; stats: { total: 0; completed: 0; pending: 0; totalCredits: 0 } }>({ referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } });

  const fetchReferrals = useCallback(() => {
    fetch("/api/referrals")
      .then((r) => r.ok ? r.json() : { referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } })
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
        setReviewedSessionIds((prev) => { const next = new Set(Array.from(prev)); next.add(reviewSessionId); return next; });
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
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
    fetch("/api/credits")
      .then((r) => r.ok ? r.json() : null)
      .then(setCredits)
      .catch(() => {});
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    if (activeTab !== "saved" || loadingSaved || savedPros.length > 0) return;
    setLoadingSaved(true);
    fetch("/api/favorites?include=details")
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((res: { data: SavedProfessional[] }) => setSavedPros(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, [activeTab, loadingSaved, savedPros.length]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const upcomingSessions = useMemo(
    () =>
      sessions.filter((s) => {
        if (s.status === "COMPLETED" || s.status === "CANCELLED") return false;
        const sessionEnd = new Date(s.scheduledAt).getTime() + s.duration * 60 * 1000;
        return sessionEnd > Date.now();
      }),
    [sessions]
  );

  const pastSessions = useMemo(
    () =>
      sessions.filter((s) => {
        if (s.status === "COMPLETED" || s.status === "CANCELLED") return true;
        // CONFIRMED/PENDING sessions whose time has already passed belong in history
        const sessionEnd = new Date(s.scheduledAt).getTime() + s.duration * 60 * 1000;
        return sessionEnd <= Date.now();
      }),
    [sessions]
  );

  if (loadingSessions) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <OnboardingTour storageKey="guidepath_tour_client_v1" steps={CLIENT_TOUR_STEPS} />

      <FadeIn>
        {(() => {
          // Skip honorific titles like "Dra.", "Dr.", "Sr.", "Sra." when picking the first name.
          const tokens = (authSession?.user?.name ?? "").split(" ").filter(Boolean);
          const firstName = (tokens.find((t) => !t.endsWith(".")) ?? tokens[0] ?? "");
          const remaining = credits?.remaining ?? CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH;
          const limit = credits?.limit ?? CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH;
          const next = upcomingSessions
            .slice()
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
          const nextLabel = next
            ? new Date(next.scheduledAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sin sesiones";
          return (
            <DashboardHero
              name={authSession?.user?.name ?? "Cliente"}
              avatar={authSession?.user?.image ?? null}
              greeting={firstName ? `Hola, ${firstName} 👋` : "Hola 👋"}
              subtitle={
                remaining > 0
                  ? `Tienes ${remaining} de ${limit} sesiones gratuitas disponibles este mes.`
                  : `Has usado tus ${limit} sesiones de este mes. Se renuevan el 1 del próximo mes.`
              }
              primaryAction={{ label: "Explorar profesionales", href: "/explore", icon: Compass }}
              featuredMetric={{
                label: "Próxima sesión",
                value: nextLabel,
                icon: CalendarClock,
                accent: "teal",
              }}
            />
          );
        })()}
      </FadeIn>

      {/* Stats */}
      <StaggerContainer className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4" delay={0.1}>
        {[
          { label: "Sesiones disponibles", value: credits ? `${credits.remaining}/${credits.limit}` : `—/${CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH}`, icon: Calendar, tourAttr: "credits-stat", accent: "text-teal-600 dark:text-teal-400", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
          { label: "Sesiones completadas", value: pastSessions.filter((s) => {
              if (s.status === "COMPLETED") return true;
              const sessionEnd = new Date(s.scheduledAt).getTime() + s.duration * 60 * 1000;
              return s.status === "CONFIRMED" && sessionEnd <= Date.now();
            }).length.toString(), icon: Clock, tourAttr: undefined, accent: "text-stone-700 dark:text-stone-300", iconBg: "bg-stone-100 dark:bg-stone-800" },
          { label: "Próximas sesiones", value: upcomingSessions.length.toString(), icon: Star, tourAttr: undefined, accent: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
          { label: "Reseñas dejadas", value: reviewedSessionIds.size.toString(), icon: MessageSquare, tourAttr: undefined, accent: "text-stone-700 dark:text-stone-300", iconBg: "bg-stone-100 dark:bg-stone-800" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <div
              className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4"
              {...(stat.tourAttr ? { "data-tour": stat.tourAttr } : {})}
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.accent}`} />
              </div>
              <p className={`mt-2 font-display text-2xl font-bold ${stat.accent}`}>
                {stat.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{stat.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Sessions tabs */}
      <FadeIn delay={0.2}>
        <Tabs
          value={activeTab}
          onValueChange={(v) => router.replace(`?tab=${v}`, { scroll: false })}
          className="mt-8"
        >
          <div data-tour="dashboard-tabs" className="overflow-x-auto">
            <TabsList className="w-max">
              <TabsTrigger value="upcoming">
                Próximas ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Historial ({pastSessions.length})
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Heart className="mr-1.5 h-3.5 w-3.5" />
                Guardados
              </TabsTrigger>
              <TabsTrigger value="subscription">Suscripción</TabsTrigger>
              <TabsTrigger value="referrals">Referidos</TabsTrigger>
              <TabsTrigger value="profile">Mi perfil</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingSessions.length === 0 ? (
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                <h3 className="mt-4 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                  No tienes sesiones próximas
                </h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  Explora profesionales y reserva tu primera sesión.
                </p>
                <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-display" asChild>
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
                      {["PENDING", "CONFIRMED"].includes(session.status) && (
                        <Button size="sm" variant="outline" onClick={() => setChatSessionId(session.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                      )}
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
            {pastSessions.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Sin historial todavía"
                description="Aquí verás las sesiones que ya hayas completado o cancelado."
              />
            ) : (
            <div className="space-y-4">
              {pastSessions.map((session, i) => {
                // Treat a CONFIRMED session whose time has passed as effectively completed
                // until the cleanup cron marks it COMPLETED in the DB
                const sessionEnd = new Date(session.scheduledAt).getTime() + session.duration * 60 * 1000;
                const effectivelyCompleted =
                  session.status === "COMPLETED" ||
                  (session.status === "CONFIRMED" && sessionEnd <= Date.now());

                return (
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
                        <span className="text-green-600 dark:text-green-400">Gratuita</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={effectivelyCompleted ? statusColors["COMPLETED"] : statusColors[session.status]}
                      variant="secondary"
                    >
                      {effectivelyCompleted ? STATUS_LABELS["COMPLETED"] : STATUS_LABELS[session.status]}
                    </Badge>
                    {effectivelyCompleted && !reviewedSessionIds.has(session.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewSessionId(session.id)}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Dejar reseña
                      </Button>
                    )}
                    {effectivelyCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setChatSessionId(session.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    )}
                    {effectivelyCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotesView({ id: session.id, name: session.professionalName })}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver notas
                      </Button>
                    )}
                    {effectivelyCompleted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFeedbackSessionId(session.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feedback beta
                      </Button>
                    )}
                    {effectivelyCompleted && session.professionalId && (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-display"
                        asChild
                      >
                        <Link href={`/professional/${session.professionalId}`}>
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Reservar de nuevo
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>
            )}
          </TabsContent>
          {/* ===== Saved professionals ===== */}
          <TabsContent value="saved" className="mt-6">
            {loadingSaved ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : savedPros.length === 0 ? (
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center">
                <Heart className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                <h3 className="mt-4 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                  Aún no has guardado ningún profesional
                </h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  Pulsa el corazón en cualquier perfil para guardarlo aquí.
                </p>
                <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-display" asChild>
                  <Link href="/explore">Explorar profesionales</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {savedPros.map((pro) => (
                  <div
                    key={pro.professionalId}
                    className="flex flex-col gap-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                        {pro.image ? (
                          <Image src={pro.image} alt={pro.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">
                            {pro.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 dark:text-stone-50 truncate">{pro.name}</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400 truncate">{pro.headline}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{pro.rating.toFixed(1)}</span>
                          <span>({pro.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/professional/${pro.professionalId}`}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Ver perfil
                        </Link>
                      </Button>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                        <Link href={`/professional/${pro.professionalId}`}>
                          Reservar
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== Subscription ===== */}
          <TabsContent value="subscription" className="mt-6">
            <SubscriptionTab />
          </TabsContent>

          {/* ===== Referrals ===== */}
          <TabsContent value="referrals" className="mt-6">
            <ReferralPanel
              referrals={referrals.referrals}
              stats={referrals.stats}
              userRole="CLIENT"
              onRefresh={fetchReferrals}
            />
          </TabsContent>

          {/* ===== Profile ===== */}
          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Session notes viewer */}
      {notesView && (
        <SessionNotesViewer
          sessionId={notesView.id}
          professionalName={notesView.name}
          onClose={() => setNotesView(null)}
        />
      )}

      {/* Beta feedback modal */}
      {feedbackSessionId && (
        <BetaFeedbackModal
          sessionId={feedbackSessionId}
          onClose={() => setFeedbackSessionId(null)}
        />
      )}

      {/* Review modal */}
      {reviewSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Dejar reseña</h3>
              <button
                onClick={() => { setReviewSessionId(null); resetReviewForm(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overall rating */}
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

            {/* Category ratings */}
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Valoraciones detalladas (opcional)</p>
              {([
                ["ratingPunctuality", reviewPunctuality, setReviewPunctuality],
                ["ratingKnowledge", reviewKnowledge, setReviewKnowledge],
                ["ratingCommunication", reviewCommunication, setReviewCommunication],
                ["ratingValue", reviewValue, setReviewValue],
              ] as const).map(([key, value, setter]) => (
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

            {/* Comment */}
            <div className="mt-4">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Comenta tu experiencia (opcional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={500}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {reviewComment.length}/500
              </p>
            </div>

            {/* Submit */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => { setReviewSessionId(null); resetReviewForm(); }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || reviewRating === 0}
              >
                {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar reseña
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50">
          <div className="mx-0 sm:mx-4 w-full max-w-lg rounded-t-xl sm:rounded-xl border bg-card shadow-xl flex flex-col" style={{ height: "min(600px, 80vh)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-heading text-base font-semibold">Chat de sesión</h3>
              <button
                onClick={() => setChatSessionId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
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
