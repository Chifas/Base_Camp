"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { FadeIn } from "@/components/shared/motion-wrapper";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { ReferralPanel } from "@/components/shared/referral-panel";
import { SessionChat } from "@/components/shared/session-chat";
import { ConversationList } from "@/components/shared/conversation-list";
import { ConversationChat } from "@/components/shared/conversation-chat";
import ProfileCompleteness from "@/components/shared/ProfileCompleteness";
import { formatDate, formatTime } from "@/lib/utils";
import { CREDITS_CONFIG } from "@/lib/credits-config";
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
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Referrals
  const [referrals, setReferrals] = useState<{ referrals: never[]; stats: { total: 0; completed: 0; pending: 0; totalCredits: 0 } }>({ referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } });
  const fetchReferrals = useCallback(() => {
    fetch("/api/referrals")
      .then((r) => r.ok ? r.json() : { referrals: [], stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 } })
      .then(setReferrals)
      .catch(() => {});
  }, []);

  // Load all data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => r.ok ? r.json() : []),
      fetch("/api/professionals/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/availability").then((r) => r.ok ? r.json() : []),
      fetch("/api/certifications").then((r) => r.ok ? r.json() : []),
      fetch("/api/reviews/received").then((r) => r.ok ? r.json() : []),
    ])
      .then(([sessData, profData, catsData, availData, certsData, reviewsData]) => {
        setSessions(Array.isArray(sessData) ? sessData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCertifications(Array.isArray(certsData) ? certsData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // If no profile → redirect to onboarding
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

        // Build availability from DB data
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

    // Load referrals
    fetchReferrals();

    // Load rewards / redemptions
    fetch("/api/rewards")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.redemptions) setRedemptions(data.redemptions);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Redeem rewards handler
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
        // Update local profile points
        setProfile((p) => p ? { ...p, impactPoints: data.remainingPoints } : p);
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

  // Session action handler (accept / reject)
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

  // Save availability handler
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

  // Save profile handler
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

  // Add certification handler
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

  // Delete certification handler
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

  // Respond to review handler
  const handleRespondReview = useCallback(async (reviewId: string) => {
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
  }, [responseText]);

  const confirmedSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONFIRMED"),
    [sessions]
  );
  const pendingSessions = useMemo(
    () => sessions.filter((s) => s.status === "PENDING"),
    [sessions]
  );
  const totalSessions = sessions.filter((s) => s.status === "COMPLETED").length;

  if (loadingAll) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          Panel Profesional
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tus sesiones, disponibilidad e impacto social.
        </p>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Puntos de impacto", value: (profile?.impactPoints ?? 0).toString(), icon: Sparkles },
            { label: "Impacto social", value: (profile?.socialImpactScore ?? 0).toFixed(1), icon: TrendingUp },
            { label: "Sesiones completadas", value: totalSessions.toString(), icon: Users },
            { label: "Próximas sesiones", value: (confirmedSessions.length + pendingSessions.length).toString(), icon: Calendar },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Profile completeness */}
      {profile && (
        <FadeIn delay={0.15}>
          <div className="mt-6">
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

      {/* Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="sessions" className="mt-8">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="sessions">
              Sesiones ({confirmedSessions.length + pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
            <TabsTrigger value="referrals">Referidos</TabsTrigger>
            <TabsTrigger value="impact">Impacto Social</TabsTrigger>
          </TabsList>

          {/* ===== Sessions ===== */}
          <TabsContent value="sessions" className="mt-6 space-y-6">
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
                          className="text-red-600 hover:bg-red-50"
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
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-heading text-lg font-semibold">
                Próximas sesiones confirmadas
              </h3>
              {confirmedSessions.length === 0 && pendingSessions.length === 0 ? (
                <div className="mt-3">
                  <EmptyState
                    icon={Calendar}
                    title="No tienes sesiones programadas"
                    description="Cuando un cliente reserve contigo, sus sesiones aparecerán aquí."
                  />
                </div>
              ) : confirmedSessions.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No hay sesiones confirmadas por el momento.
                </p>
              ) : (
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
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Gratuita
                        </span>
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
                          Iniciar sesión
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== Messages (Direct) ===== */}
          <TabsContent value="messages" className="mt-6">
            <div className="grid gap-4 md:grid-cols-[320px_1fr]">
              <ConversationList
                onSelectConversation={setSelectedConversationId}
                selectedId={selectedConversationId}
              />
              {selectedConversationId ? (
                <ConversationChat
                  conversationId={selectedConversationId}
                  canSendFirst={false}
                />
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Selecciona una conversación para ver los mensajes de tus clientes.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== Availability ===== */}
          <TabsContent value="availability" className="mt-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Horario semanal
              </h3>
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
                      <span className={`text-sm font-medium ${!slot.enabled ? "text-muted-foreground" : ""}`}>
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
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Tu perfil profesional
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta información es visible para los clientes en tu perfil público.
              </p>

              {/* Photo upload */}
              <div className="mt-6">
                <PhotoUpload
                  currentImage={profile?.image || ""}
                  onUpload={(url) => setProfile((p) => p ? { ...p, image: url } : p)}
                />
              </div>

              <div className="mt-6 space-y-5">
                {/* Category */}
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

                {/* Headline */}
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

                {/* Bio */}
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

                {/* Years of experience */}
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

                {/* Languages */}
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

            {/* Certifications section */}
            <div className="rounded-xl border bg-card p-6">
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
                <div className="mt-4 space-y-3 rounded-lg border p-4">
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
                      {savingCert ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
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
                <div className="mt-4 space-y-2">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{cert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.institution}{cert.year ? ` · ${cert.year}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
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
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Reseñas de clientes
              </h3>
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
                    <div key={review.id} className="rounded-lg border p-4">
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

                      {/* Category ratings */}
                      {(review.ratingPunctuality || review.ratingKnowledge || review.ratingCommunication || review.ratingValue) && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {review.ratingPunctuality && <span>Puntualidad: {review.ratingPunctuality}/5</span>}
                          {review.ratingKnowledge && <span>Conocimiento: {review.ratingKnowledge}/5</span>}
                          {review.ratingCommunication && <span>Comunicación: {review.ratingCommunication}/5</span>}
                          {review.ratingValue && <span>Valor: {review.ratingValue}/5</span>}
                        </div>
                      )}

                      {review.comment && (
                        <p className="mt-2 text-sm">{review.comment}</p>
                      )}

                      {/* Professional response */}
                      {review.professionalResponse ? (
                        <div className="mt-3 ml-4 rounded-lg border-l-2 border-indigo-500 bg-indigo-50/50 p-3 dark:bg-indigo-950/20">
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
                            <Button size="sm" variant="ghost" onClick={() => { setRespondingTo(null); setResponseText(""); }}>
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
            <ReferralPanel
              referrals={referrals.referrals}
              stats={referrals.stats}
              userRole="PROFESSIONAL"
              onRefresh={fetchReferrals}
            />
          </TabsContent>

          {/* ===== Impact Social ===== */}
          <TabsContent value="impact" className="mt-6 space-y-6">
            {/* Impact summary */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Tu impacto social
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada sesión completada suma puntos de impacto que puedes canjear por recompensas.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="text-sm text-primary">Puntos disponibles</p>
                  </div>
                  <p className="mt-2 font-heading text-3xl font-bold text-primary">
                    {profile?.impactPoints ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    +{CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION} pts por sesión completada
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Sesiones completadas</p>
                  </div>
                  <p className="mt-2 font-heading text-3xl font-bold">
                    {profile?.totalSessionsCompleted ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Puntuación de impacto</p>
                  </div>
                  <p className="mt-2 font-heading text-3xl font-bold">
                    {(profile?.socialImpactScore ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Redeem rewards */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Canjear recompensas
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Utiliza tus puntos de impacto para obtener reconocimientos o contribuir a causas sociales.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Certification reward */}
                <div className="flex flex-col justify-between rounded-xl border p-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Certificación profesional</h4>
                        <p className="text-xs text-muted-foreground">{CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION} puntos</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Obtén un certificado que acredita tu compromiso con el desarrollo profesional y el impacto social.
                    </p>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant={(profile?.impactPoints ?? 0) >= CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION ? "default" : "outline"}
                    disabled={(profile?.impactPoints ?? 0) < CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION || redeemingType === "CERTIFICATION"}
                    onClick={() => handleRedeem("CERTIFICATION")}
                  >
                    {redeemingType === "CERTIFICATION" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Gift className="mr-2 h-4 w-4" />
                    )}
                    {(profile?.impactPoints ?? 0) >= CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION
                      ? "Canjear certificación"
                      : `Faltan ${CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION - (profile?.impactPoints ?? 0)} pts`}
                  </Button>
                </div>

                {/* Donation reward */}
                <div className="flex flex-col justify-between rounded-xl border p-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                        <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Donación solidaria</h4>
                        <p className="text-xs text-muted-foreground">{CREDITS_CONFIG.IMPACT_POINTS_DONATION} puntos</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Contribuye a programas de orientación profesional para personas en situación de vulnerabilidad.
                    </p>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant={(profile?.impactPoints ?? 0) >= CREDITS_CONFIG.IMPACT_POINTS_DONATION ? "default" : "outline"}
                    disabled={(profile?.impactPoints ?? 0) < CREDITS_CONFIG.IMPACT_POINTS_DONATION || redeemingType === "DONATION"}
                    onClick={() => handleRedeem("DONATION")}
                  >
                    {redeemingType === "DONATION" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="mr-2 h-4 w-4" />
                    )}
                    {(profile?.impactPoints ?? 0) >= CREDITS_CONFIG.IMPACT_POINTS_DONATION
                      ? "Realizar donación"
                      : `Faltan ${CREDITS_CONFIG.IMPACT_POINTS_DONATION - (profile?.impactPoints ?? 0)} pts`}
                  </Button>
                </div>
              </div>
            </div>

            {/* Redemption history */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Historial de canjes
              </h3>

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
                      className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {r.type === "CERTIFICATION" ? (
                          <Award className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Heart className="h-4 w-4 text-pink-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {r.type === "CERTIFICATION" ? "Certificación profesional" : "Donación solidaria"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </p>
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
      </FadeIn>

      {/* Chat modal — professionals can only view/respond, never initiate */}
      {chatSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50">
          <div
            className="mx-0 sm:mx-4 w-full max-w-lg rounded-t-xl sm:rounded-xl border bg-card shadow-xl flex flex-col"
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
