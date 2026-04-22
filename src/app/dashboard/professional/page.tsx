"use client";

import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, TrendingUp, Users, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { OnboardingTour, type TourStep } from "@/components/shared/onboarding-tour";
import ProfileCompleteness from "@/components/shared/ProfileCompleteness";
import type { SessionItem, ProfileData, CategoryOption, AvailabilitySlot, CertificationItem } from "./tabs/types";

const SessionsTab    = lazy(() => import("./tabs/sessions-tab"));
const AvailabilityTab = lazy(() => import("./tabs/availability-tab"));
const ProfileTab     = lazy(() => import("./tabs/profile-tab"));
const ReviewsTab     = lazy(() => import("./tabs/reviews-tab"));
const ReferralsTab   = lazy(() => import("./tabs/referrals-tab"));
const ImpactTab      = lazy(() => import("./tabs/impact-tab"));

const TOUR_STEPS: TourStep[] = [
  { target: null, title: "¡Bienvenido/a a tu panel de profesional!", description: "Te guiamos por los 5 puntos clave de tu espacio. Puedes omitir la guía cuando quieras." },
  { target: '[data-tour="prof-completeness"]', title: "Completa tu perfil", description: "Cuanto más completo esté tu perfil, más alto aparecerás en los resultados. Añade bio, foto, idiomas y experiencia." },
  { target: '[data-tour="prof-sessions"]', title: "Gestiona tus sesiones", description: "Aquí recibirás las solicitudes de clientes. Acéptalas o recházalas, y únete a la videollamada cuando llegue el momento." },
  { target: '[data-tour="prof-availability"]', title: "Configura tu disponibilidad", description: "Define qué días y horarios estás disponible. Sin disponibilidad configurada no apareces en los resultados de búsqueda." },
  { target: '[data-tour="prof-impact"]', title: "Tu impacto social", description: "Ganas +10 puntos por cada sesión completada. Con 100 puntos obtienes una certificación; con 50, haces una donación solidaria." },
];

const VALID_TABS = ["sessions", "availability", "profile", "reviews", "referrals", "impact"] as const;
type Tab = typeof VALID_TABS[number];

export default function ProfessionalDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (VALID_TABS.includes(searchParams.get("tab") as Tab) ? searchParams.get("tab") : "sessions") as Tab;
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions?status=PENDING,CONFIRMED&limit=50").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/professionals/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/availability").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/certifications").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([sessData, profData, catsData, availData, certsData]) => {
        if (!profData.hasProfile) { router.replace("/onboarding/professional"); return; }
        setSessions(Array.isArray(sessData) ? sessData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setAvailability(Array.isArray(availData) ? availData : []);
        setCertifications(Array.isArray(certsData) ? certsData : []);
        setProfile(profData);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoadingAll(false));
  }, [router]);

  const confirmedCount = useMemo(() => sessions.filter((s) => s.status === "CONFIRMED").length, [sessions]);
  const pendingCount   = useMemo(() => sessions.filter((s) => s.status === "PENDING").length, [sessions]);
  // totalSessionsCompleted comes from the profile (tracks lifetime completions, not just loaded sessions)
  const completedCount = profile?.totalSessionsCompleted ?? 0;

  if (loadingAll) return <DashboardSkeleton />;

  const STATS = [
    { label: "Puntos de impacto",    value: String(profile?.impactPoints ?? 0),                  icon: Sparkles,   accent: "text-amber-600 dark:text-amber-400",    iconBg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Impacto social",       value: (profile?.socialImpactScore ?? 0).toFixed(1),         icon: TrendingUp, accent: "text-teal-600 dark:text-teal-400",      iconBg: "bg-teal-100 dark:bg-teal-900/30" },
    { label: "Sesiones completadas", value: String(completedCount),                               icon: Users,      accent: "text-stone-700 dark:text-stone-300",    iconBg: "bg-stone-100 dark:bg-stone-800" },
    { label: "Próximas sesiones",    value: String(confirmedCount + pendingCount),                icon: Calendar,   accent: "text-stone-700 dark:text-stone-300",    iconBg: "bg-stone-100 dark:bg-stone-800" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <OnboardingTour storageKey="guidepath_tour_professional_v1" steps={TOUR_STEPS} />

      <FadeIn>
        <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
          Panel Profesional
        </h1>
        <p className="mt-1 text-stone-500 dark:text-stone-400">
          Gestiona tus sesiones, disponibilidad e impacto social.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.accent}`} />
              </div>
              <p className={`mt-2 font-display text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {profile && (
        <FadeIn delay={0.15}>
          <div className="mt-6" data-tour="prof-completeness">
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
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <Tabs
          value={activeTab}
          onValueChange={(v) => router.replace(`?tab=${v}`, { scroll: false })}
          className="mt-8"
        >
          <div className="overflow-x-auto">
            <TabsList className="w-max">
              <TabsTrigger value="sessions" data-tour="prof-sessions">
                Sesiones ({confirmedCount + pendingCount})
              </TabsTrigger>
              <TabsTrigger value="availability" data-tour="prof-availability">Disponibilidad</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              <TabsTrigger value="referrals">Referidos</TabsTrigger>
              <TabsTrigger value="impact" data-tour="prof-impact">Impacto Social</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sessions">
            <Suspense fallback={<DashboardSkeleton />}>
              <SessionsTab sessions={sessions} onSessionsChange={setSessions} />
            </Suspense>
          </TabsContent>

          <TabsContent value="availability">
            <Suspense fallback={<DashboardSkeleton />}>
              <AvailabilityTab
                initialAvailability={availability}
                onSaved={setAvailability}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="profile">
            <Suspense fallback={<DashboardSkeleton />}>
              <ProfileTab
                profile={profile}
                categories={categories}
                certifications={certifications}
                onUpdate={(u) => setProfile((p) => (p ? { ...p, ...u } : p))}
                onCertificationsChange={setCertifications}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="reviews">
            <Suspense fallback={<DashboardSkeleton />}>
              <ReviewsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="referrals">
            <Suspense fallback={<DashboardSkeleton />}>
              <ReferralsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="impact">
            <Suspense fallback={<DashboardSkeleton />}>
              <ImpactTab
                profile={profile}
                onPointsUpdate={(pts) => setProfile((p) => (p ? { ...p, impactPoints: pts } : p))}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
