"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Video,
  Check,
  X,
  Loader2,
  Save,
  Briefcase,
  Tag,
  FileText,
  Star,
  Plus,
  Trash2,
  Globe,
  Award,
  MessageSquare,
  Sparkles,
  Heart,
  Gift,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { ReferralPanel } from "@/components/shared/referral-panel";
import { SessionChat } from "@/components/shared/session-chat";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import ProfileCompleteness from "@/components/shared/ProfileCompleteness";
import { OnboardingTour, type TourStep } from "@/components/shared/onboarding-tour";
import { formatDate, formatTime } from "@/lib/utils";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

const PROFESSIONAL_TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: "¡Bienvenido/a a tu panel de profesional!",
    description:
      "Te guiamos por los 5 puntos clave de tu espacio. Puedes omitir la guía cuando quieras.",
  },
  {
    target: '[data-tour="prof-completeness"]',
    title: "Completa tu perfil",
    description:
      "Cuanto más completo esté tu perfil, más alto aparecerás en los resultados. Añade bio, foto, idiomas y experiencia.",
  },
  {
    target: '[data-tour="prof-sessions"]',
    title: "Gestiona tus sesiones",
    description:
      "Aquí recibirás las solicitudes de clientes. Acéptalas o recházalas, y únete a la videollamada cuando llegue el momento.",
  },
  {
    target: '[data-tour="prof-availability"]',
    title: "Configura tu disponibilidad",
    description:
      "Define qué días y horarios estás disponible. Sin disponibilidad configurada no apareces en los resultados de búsqueda.",
  },
  {
    target: '[data-tour="prof-impact"]',
    title: "Tu impacto social",
    description:
      "Ganas +10 puntos por cada sesión completada. Con 100 puntos obtienes una certificación; con 50, haces una donación solidaria.",
  },
];

interface CategoryOption {
  id: string;
  name: string;
}

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const EMPTY_AVAILABILITY = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 2, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 3, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 4, startTime: "09:00", endTime: "14:00", enabled: false },
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", enabled: false },
  { dayOfWeek: 6, startTime: "", endTime: "", enabled: false },
  { dayOfWeek: 0, startTime: "", endTime: "", enabled: false },
];

interface SessionItem {
  id: string;
  clientId: string;
  professionalId: string;
  clientName: string;
  clientImage: string;
  scheduledAt: string;
  duration: number;
  status: string;
  price: number;
  dailyRoomUrl?: string | null;
  messageCount?: number;
}

interface ProfileData {
  id: string;
  headline: string | null;
  category: string;
  categoryName: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  languages: string[];
  yearsExperience: number | null;
  hasProfile: boolean;
  impactPoints: number;
  totalSessionsCompleted: number;
  socialImpactScore: number;
}

interface RedemptionItem {
  id: string;
  type: string;
  pointsSpent: number;
  description: string | null;
  createdAt: string;
}

interface CertificationItem {
  id: string;
  title: string;
  institution: string;
  year?: number;
}

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  ratingPunctuality?: number;
  ratingKnowledge?: number;
  ratingCommunication?: number;
  ratingValue?: number;
  comment: string | null;
  professionalResponse: string | null;
  createdAt: string;
}

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
};

export default function ProfessionalDashboard() {
  const router = useRouter();
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const pageRef = useRef<HTMLDivElement>(null);

  // Availability state
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(EMPTY_AVAILABILITY);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Profile edit state
  const [editHeadline, setEditHeadline] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLanguages, setEditLanguages] = useState<string[]>(["es"]);
  const [editYearsExperience, setEditYearsExperience] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Certifications state
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certInstitution, setCertInstitution] = useState("");
  const [certYear, setCertYear] = useState("");
  const [savingCert, setSavingCert] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  // Impact / Rewards state
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [redeemingType, setRedeemingType] = useState<string | null>(null);

  // Chat state
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Referrals
  const [referrals, setReferrals] = useState<{
    referrals: never[];
    stats: { total: 0; completed: 0; pending: 0; totalCredits: 0 };
  }>({ referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } });
  const fetchReferrals = useCallback(() => {
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : { referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } }))
      .then(setReferrals)
      .catch(() => {});
  }, []);

  // Load all data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/professionals/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/availability").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/certifications").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/reviews/received").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([sessData, profData, catsData, availData, certsData, reviewsData]) => {
        setSessions(Array.isArray(sessData) ? sessData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCertifications(Array.isArray(certsData) ? certsData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        if (!profData.hasProfile) {
          router.replace("/onboarding/professional");
          return;
        }

        setProfile(profData);
        setEditHeadline(profData.headline ?? "");
        setEditCategory(profData.category ?? "");
        setEditBio(profData.bio ?? "");
        setEditLanguages(profData.languages ?? ["es"]);
        setEditYearsExperience(profData.yearsExperience?.toString() ?? "");

        if (Array.isArray(availData) && availData.length > 0) {
          const merged = EMPTY_AVAILABILITY.map((slot) => {
            const dbSlot = availData.find(
              (a: { dayOfWeek: number }) => a.dayOfWeek === slot.dayOfWeek
            );
            if (dbSlot) {
              return {
                dayOfWeek: dbSlot.dayOfWeek,
                startTime: dbSlot.startTime,
                endTime: dbSlot.endTime,
                enabled: true,
              };
            }
            return slot;
          });
          setAvailability(merged);
        }
      })
      .catch(() => {
        setSessions([]);
      })
      .finally(() => setLoadingAll(false));

    fetchReferrals();

    fetch("/api/rewards")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.redemptions) setRedemptions(data.redemptions);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleRedeem = useCallback(async (type: "CERTIFICATION" | "DONATION") => {
    setRedeemingType(type);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(type === "CERTIFICATION" ? "Certificación canjeada" : "Donación realizada");
        setRedemptions((prev) => [data.redemption, ...prev]);
        setProfile((p) => (p ? { ...p, impactPoints: data.remainingPoints } : p));
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al canjear");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setRedeemingType(null);
    }
  }, []);

  const handleSessionAction = useCallback(
    async (sessionId: string, newStatus: "CONFIRMED" | "CANCELLED") => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
          );
        }
      } catch {}
    },
    []
  );

  const handleSaveAvailability = useCallback(async () => {
    setSavingAvailability(true);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: availability }),
      });
      if (res.ok) {
        toast.success("Disponibilidad guardada correctamente");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingAvailability(false);
    }
  }, [availability]);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/professionals/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: editHeadline || undefined,
          category: editCategory || undefined,
          bio: editBio || undefined,
          languages: editLanguages,
          yearsExperience: editYearsExperience ? parseInt(editYearsExperience) : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Perfil actualizado correctamente");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingProfile(false);
    }
  }, [editHeadline, editCategory, editBio, editLanguages, editYearsExperience]);

  const handleAddCertification = useCallback(async () => {
    setSavingCert(true);
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: certTitle,
          institution: certInstitution,
          year: certYear ? parseInt(certYear) : undefined,
        }),
      });
      if (res.ok) {
        const cert = await res.json();
        setCertifications((prev) => [...prev, cert]);
        setCertTitle("");
        setCertInstitution("");
        setCertYear("");
        setShowCertForm(false);
        toast.success("Certificación añadida");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingCert(false);
    }
  }, [certTitle, certInstitution, certYear]);

  const handleDeleteCertification = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/certifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCertifications((prev) => prev.filter((c) => c.id !== id));
        toast.success("Certificación eliminada");
      }
    } catch {
      toast.error("Error al eliminar");
    }
  }, []);

  const handleRespondReview = useCallback(
    async (reviewId: string) => {
      setSavingResponse(true);
      try {
        const res = await fetch(`/api/reviews/${reviewId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText }),
        });
        if (res.ok) {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId ? { ...r, professionalResponse: responseText } : r
            )
          );
          setRespondingTo(null);
          setResponseText("");
          toast.success("Respuesta publicada");
        } else {
          const data = await res.json();
          toast.error(data.error ?? "Error al responder");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        setSavingResponse(false);
      }
    },
    [responseText]
  );

  const confirmedSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED"),
    [sessions]
  );
  const pendingSessions = useMemo(
    () => sessions.filter((s) => s.status === "PENDING"),
    [sessions]
  );
  const totalSessions = sessions.filter((s) => s.status === "COMPLETED").length;

  // Bento reveal animations
  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;
      if (loadingAll) return;

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
    { scope: pageRef, dependencies: [loadingAll] }
  );

  if (loadingAll) return <DashboardSkeleton />;

  const impactPoints = profile?.impactPoints ?? 0;
  const certThreshold = CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION;
  const pointsPct = Math.min(100, Math.round((impactPoints / certThreshold) * 100));
  const firstName = authSession?.user?.name?.split(" ")[0] ?? profile?.name?.split(" ")[0] ?? "profesional";

  return (
    <div ref={pageRef} className="relative">
      {/* Aurora backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/8 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OnboardingTour storageKey="guidepath_tour_professional_v1" steps={PROFESSIONAL_TOUR_STEPS} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p data-dash-head className="text-xs font-semibold uppercase tracking-widest text-primary">
              Panel profesional
            </p>
            <h1
              data-dash-head
              className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Hola, {firstName}
            </h1>
            <p data-dash-head className="mt-2 max-w-xl text-muted-foreground">
              Gestiona tus sesiones, afina tu disponibilidad y multiplica tu impacto social.
            </p>
          </div>
          {pendingSessions.length > 0 && (
            <div
              data-dash-head
              className="hidden shrink-0 items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 sm:inline-flex"
            >
              <Flame className="h-4 w-4" />
              {pendingSessions.length} solicitud{pendingSessions.length > 1 ? "es" : ""} pendiente{pendingSessions.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Bento stats grid */}
        <div className="mt-10 grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          {/* HERO: Impact points card */}
          <div
            data-bento-card
            data-tour="prof-impact"
            className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6 row-span-2"
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-6 text-white sm:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl"
              />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" /> Impact points
                </span>
                <span className="text-xs font-medium opacity-80">
                  +{CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION} pts por sesión
                </span>
              </div>
              <div className="relative mt-auto">
                <p className="font-heading text-6xl font-bold leading-none tracking-tight sm:text-7xl">
                  <AnimatedCounter target={impactPoints} decimals={0} />
                  <span className="ml-2 text-2xl font-medium opacity-70">/{certThreshold}</span>
                </p>
                <p className="mt-3 text-lg font-medium">
                  {impactPoints >= certThreshold
                    ? "¡Puedes canjear una certificación!"
                    : `${certThreshold - impactPoints} pts hasta tu próxima certificación`}
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${pointsPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs opacity-80">
                  Canjea tus puntos por certificaciones o donaciones solidarias
                </p>
              </div>
            </div>
          </div>

          {/* Stat: sesiones completadas */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  <AnimatedCounter target={totalSessions} decimals={0} />
                </p>
                <p className="mt-2 text-xs text-muted-foreground">sesiones completadas</p>
              </div>
            </div>
          </div>

          {/* Stat: próximas */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  <AnimatedCounter target={confirmedSessions.length + pendingSessions.length} decimals={0} />
                </p>
                <p className="mt-2 text-xs font-medium opacity-90">próximas sesiones</p>
              </div>
            </div>
          </div>

          {/* Stat: puntuación impacto */}
          <div
            data-bento-card
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-3xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-4xl font-bold leading-none">
                  {(profile?.socialImpactScore ?? 0).toFixed(1)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">impacto social</p>
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
                <p className="font-heading text-4xl font-bold leading-none">{reviews.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">reseñas recibidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile completeness */}
        {profile && (
          <div data-bento-card data-tour="prof-completeness" className="mt-6">
            <div className="rounded-3xl border bg-card p-5 sm:p-6">
              <ProfileCompleteness
                profile={{
                  headline: profile.headline,
                  bio: profile.bio,
                  image: profile.image,
                  category: profile.category,
                  languages: profile.languages,
                  yearsExperience: profile.yearsExperience,
                  availability,
                }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="mt-10">
          <TabsList className="overflow-x-auto rounded-full bg-muted/70 p-1.5 backdrop-blur">
            <TabsTrigger value="sessions" className="rounded-full" data-tour="prof-sessions">
              Sesiones ({confirmedSessions.length + pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="availability" className="rounded-full" data-tour="prof-availability">
              Disponibilidad
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">
              Reseñas ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-full">
              Referidos
            </TabsTrigger>
            <TabsTrigger value="impact" className="rounded-full">
              Impacto
            </TabsTrigger>
          </TabsList>

          {/* ===== Sessions ===== */}
          <TabsContent value="sessions" className="mt-6 space-y-6">
            {pendingSessions.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
                  <Flame className="h-4 w-4 text-amber-500" />
                  Pendientes de aprobación
                </h3>
                <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
                  {pendingSessions.map((session) => (
                    <div
                      key={session.id}
                      data-bento-card
                      className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
                    >
                      <div className="flex h-full flex-col gap-4 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 dark:border-amber-500/20 dark:from-amber-900/10 dark:to-orange-900/5 sm:flex-row sm:items-center">
                        <div className="flex-1">
                          <p className="font-heading font-semibold">{session.clientName}</p>
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
                          <span className="mt-2 inline-flex items-center rounded-full bg-amber-200/60 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                            Pendiente
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {(session.messageCount ?? 0) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setChatSessionId(session.id)}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Mensajes ({session.messageCount})
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => handleSessionAction(session.id, "CANCELLED")}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Rechazar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSessionAction(session.id, "CONFIRMED")}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Aceptar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 font-heading text-lg font-semibold">
                Próximas sesiones confirmadas
              </h3>
              {confirmedSessions.length === 0 && pendingSessions.length === 0 ? (
                <div data-bento-card className="rounded-3xl border bg-card/80 p-12 text-center backdrop-blur">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
                    <Calendar className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">
                    No tienes sesiones programadas
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando un cliente reserve contigo, sus sesiones aparecerán aquí.
                  </p>
                </div>
              ) : confirmedSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay sesiones confirmadas por el momento.
                </p>
              ) : (
                <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
                  {confirmedSessions.map((session) => (
                    <div
                      key={session.id}
                      data-bento-card
                      className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
                    >
                      <div className="group flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 transition-all hover:shadow-lg sm:flex-row sm:items-center">
                        <div className="flex-1">
                          <p className="font-heading font-semibold">{session.clientName}</p>
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
                          <span className="mt-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Gratuita
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {(session.messageCount ?? 0) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setChatSessionId(session.id)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Mensajes ({session.messageCount})
                            </Button>
                          )}
                          <Button size="sm" onClick={() => router.push(`/session/${session.id}`)}>
                            <Video className="mr-2 h-4 w-4" />
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== Availability ===== */}
          <TabsContent value="availability" className="mt-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Horario semanal</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configura los días y horarios en los que estás disponible para sesiones.
              </p>

              <div className="mt-6 space-y-4">
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
                          updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
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
                        className={`text-sm font-medium ${!slot.enabled ? "text-muted-foreground" : ""}`}
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
                            updated[idx] = { ...updated[idx], startTime: e.target.value };
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

              <Button onClick={handleSaveAvailability} disabled={savingAvailability}>
                {savingAvailability ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar disponibilidad
              </Button>
            </div>
          </TabsContent>

          {/* ===== Profile ===== */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Tu perfil profesional</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta información es visible para los clientes en tu perfil público.
              </p>

              <div className="mt-6">
                <PhotoUpload
                  currentImage={profile?.image || ""}
                  onUpload={(url) => setProfile((p) => (p ? { ...p, image: url } : p))}
                />
              </div>

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Categoría
                  </label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-headline" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Titular profesional
                  </label>
                  <Input
                    id="edit-headline"
                    placeholder="Ej: Coach ejecutivo con 10 años de experiencia"
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    maxLength={120}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-bio" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Sobre ti
                  </label>
                  <textarea
                    id="edit-bio"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe tu experiencia y enfoque profesional..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{editBio.length}/1000</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-years" className="flex items-center gap-2 text-sm font-medium">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Años de experiencia
                  </label>
                  <Input
                    id="edit-years"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Ej: 5"
                    value={editYearsExperience}
                    onChange={(e) => setEditYearsExperience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Idiomas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => setEditLanguages((prev) => prev.filter((l) => l !== lang))}
                          className="ml-1 text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Añadir idioma"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newLanguage.trim()) {
                          e.preventDefault();
                          if (!editLanguages.includes(newLanguage.trim())) {
                            setEditLanguages((prev) => [...prev, newLanguage.trim()]);
                          }
                          setNewLanguage("");
                        }
                      }}
                      className="max-w-[200px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newLanguage.trim() && !editLanguages.includes(newLanguage.trim())) {
                          setEditLanguages((prev) => [...prev, newLanguage.trim()]);
                          setNewLanguage("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>

            {/* Certifications */}
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold">Certificaciones</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Títulos y credenciales que avalan tu experiencia.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCertForm(!showCertForm)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Añadir
                </Button>
              </div>

              {showCertForm && (
                <div className="mt-4 space-y-3 rounded-2xl border p-4">
                  <Input
                    placeholder="Título (ej: Máster en Psicología Clínica)"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Institución (ej: Universidad de Barcelona)"
                    value={certInstitution}
                    onChange={(e) => setCertInstitution(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Año (opcional)"
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    min="1950"
                    max="2030"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCertification}
                      disabled={savingCert || !certTitle || !certInstitution}
                    >
                      {savingCert ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowCertForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {certifications.length === 0 && !showCertForm ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No has añadido certificaciones todavía.
                </p>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between rounded-2xl border bg-background/50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{cert.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {cert.institution}
                          {cert.year ? ` · ${cert.year}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="ml-3 shrink-0 text-zinc-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== Reviews ===== */}
          <TabsContent value="reviews" className="mt-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Reseñas de clientes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Valoraciones recibidas de tus sesiones completadas.
              </p>

              {reviews.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={MessageSquare}
                    title="Sin reseñas todavía"
                    description="Cuando los clientes valoren tus sesiones, aparecerán aquí."
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {(review.ratingPunctuality ||
                        review.ratingKnowledge ||
                        review.ratingCommunication ||
                        review.ratingValue) && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {review.ratingPunctuality && <span>Puntualidad: {review.ratingPunctuality}/5</span>}
                          {review.ratingKnowledge && <span>Conocimiento: {review.ratingKnowledge}/5</span>}
                          {review.ratingCommunication && <span>Comunicación: {review.ratingCommunication}/5</span>}
                          {review.ratingValue && <span>Valor: {review.ratingValue}/5</span>}
                        </div>
                      )}

                      {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}

                      {review.professionalResponse ? (
                        <div className="ml-4 mt-3 rounded-2xl border-l-2 border-indigo-500 bg-indigo-50/50 p-3 dark:bg-indigo-950/20">
                          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Tu respuesta</p>
                          <p className="mt-1 text-sm">{review.professionalResponse}</p>
                        </div>
                      ) : respondingTo === review.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Escribe tu respuesta..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            maxLength={500}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRespondReview(review.id)}
                              disabled={savingResponse || !responseText.trim()}
                            >
                              {savingResponse ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                              Publicar respuesta
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => setRespondingTo(review.id)}
                        >
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          Responder
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== Referrals ===== */}
          <TabsContent value="referrals" className="mt-6">
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <ReferralPanel
                referrals={referrals.referrals}
                stats={referrals.stats}
                userRole="PROFESSIONAL"
                onRefresh={fetchReferrals}
              />
            </div>
          </TabsContent>

          {/* ===== Impact ===== */}
          <TabsContent value="impact" className="mt-6 space-y-6">
            {/* Rewards grid */}
            <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
              {/* Certification reward */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
              >
                <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-heading text-lg font-semibold">Certificación profesional</h4>
                        <p className="text-xs opacity-80">{certThreshold} puntos</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm opacity-90">
                      Obtén un certificado que acredita tu compromiso con el desarrollo profesional y el impacto social.
                    </p>
                  </div>
                  <Button
                    className="mt-5 bg-white text-indigo-600 hover:bg-white/90"
                    disabled={impactPoints < certThreshold || redeemingType === "CERTIFICATION"}
                    onClick={() => handleRedeem("CERTIFICATION")}
                  >
                    {redeemingType === "CERTIFICATION" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Gift className="mr-2 h-4 w-4" />
                    )}
                    {impactPoints >= certThreshold
                      ? "Canjear certificación"
                      : `Faltan ${certThreshold - impactPoints} pts`}
                  </Button>
                </div>
              </div>

              {/* Donation reward */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-6"
              >
                <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-heading text-lg font-semibold">Donación solidaria</h4>
                        <p className="text-xs opacity-80">
                          {CREDITS_CONFIG.IMPACT_POINTS_DONATION} puntos
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm opacity-90">
                      Contribuye a programas de orientación profesional para personas en situación de vulnerabilidad.
                    </p>
                  </div>
                  <Button
                    className="mt-5 bg-white text-rose-600 hover:bg-white/90"
                    disabled={
                      impactPoints < CREDITS_CONFIG.IMPACT_POINTS_DONATION ||
                      redeemingType === "DONATION"
                    }
                    onClick={() => handleRedeem("DONATION")}
                  >
                    {redeemingType === "DONATION" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="mr-2 h-4 w-4" />
                    )}
                    {impactPoints >= CREDITS_CONFIG.IMPACT_POINTS_DONATION
                      ? "Realizar donación"
                      : `Faltan ${CREDITS_CONFIG.IMPACT_POINTS_DONATION - impactPoints} pts`}
                  </Button>
                </div>
              </div>
            </div>

            {/* Redemption history */}
            <div data-bento-card className="rounded-3xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Historial de canjes</h3>

              {redemptions.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={Sparkles}
                    title="Sin canjes todavía"
                    description="Cuando canjees tus puntos de impacto, el historial aparecerá aquí."
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {redemptions.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {r.type === "CERTIFICATION" ? (
                          <Award className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Heart className="h-4 w-4 text-pink-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {r.type === "CERTIFICATION"
                              ? "Certificación profesional"
                              : "Donación solidaria"}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        -{r.pointsSpent} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat modal */}
      {chatSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur sm:items-center">
          <div
            className="mx-0 flex w-full max-w-lg flex-col rounded-t-3xl border bg-card shadow-xl sm:mx-4 sm:rounded-3xl"
            style={{ height: "min(600px, 80vh)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-heading text-base font-semibold">Mensajes del cliente</h3>
              <button
                onClick={() => setChatSessionId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SessionChat sessionId={chatSessionId} viewOnly />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
