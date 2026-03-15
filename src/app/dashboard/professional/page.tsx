"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  Save,
  Briefcase,
  Tag,
  FileText,
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
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Category } from "@/types";

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
}

interface ProfileData {
  id: string;
  headline: string | null;
  hourlyRate: number;
  categoryId: string;
  categoryName: string;
  name: string | null;
  bio: string | null;
  hasProfile: boolean;
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
  const [categories, setCategories] = useState<Category[]>([]);

  // Availability state
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(EMPTY_AVAILABILITY);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [availabilityMsg, setAvailabilityMsg] = useState("");

  // Profile edit state
  const [editHeadline, setEditHeadline] = useState("");
  const [editHourlyRate, setEditHourlyRate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Load all data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => r.ok ? r.json() : []),
      fetch("/api/professionals/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/availability").then((r) => r.ok ? r.json() : []),
    ])
      .then(([sessData, profData, catsData, availData]) => {
        setSessions(Array.isArray(sessData) ? sessData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);

        // If no profile → redirect to onboarding
        if (!profData.hasProfile) {
          router.replace("/onboarding/professional");
          return;
        }

        setProfile(profData);
        setEditHeadline(profData.headline ?? "");
        setEditHourlyRate(profData.hourlyRate?.toString() ?? "");
        setEditCategoryId(profData.categoryId ?? "");
        setEditBio(profData.bio ?? "");

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
  }, [router]);

  // Save availability handler
  const handleSaveAvailability = useCallback(async () => {
    setSavingAvailability(true);
    setAvailabilityMsg("");
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: availability }),
      });
      if (res.ok) {
        setAvailabilityMsg("Disponibilidad guardada correctamente.");
      } else {
        const data = await res.json();
        setAvailabilityMsg(data.error ?? "Error al guardar.");
      }
    } catch {
      setAvailabilityMsg("Error de conexión.");
    } finally {
      setSavingAvailability(false);
      setTimeout(() => setAvailabilityMsg(""), 3000);
    }
  }, [availability]);

  // Save profile handler
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    setProfileMsg("");
    const rate = parseFloat(editHourlyRate);
    if (isNaN(rate) || rate < 1) {
      setProfileMsg("La tarifa debe ser al menos 1€.");
      setSavingProfile(false);
      return;
    }
    try {
      const res = await fetch("/api/professionals/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: editHeadline || undefined,
          hourlyRate: rate,
          categoryId: editCategoryId || undefined,
          bio: editBio || undefined,
        }),
      });
      if (res.ok) {
        setProfileMsg("Perfil actualizado correctamente.");
      } else {
        const data = await res.json();
        setProfileMsg(data.error ?? "Error al guardar.");
      }
    } catch {
      setProfileMsg("Error de conexión.");
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(""), 3000);
    }
  }, [editHeadline, editHourlyRate, editCategoryId, editBio]);

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

  if (loadingAll) return <DashboardSkeleton />;

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
            { label: "Ingresos totales", value: formatCurrency(totalEarnings), icon: DollarSign },
            { label: "Tarifa/sesión", value: profile ? formatCurrency(profile.hourlyRate) : "—", icon: TrendingUp },
            { label: "Sesiones totales", value: totalSessions.toString(), icon: Users },
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

      {/* Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="sessions" className="mt-8">
          <TabsList>
            <TabsTrigger value="sessions">
              Sesiones ({confirmedSessions.length + pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="earnings">Ingresos</TabsTrigger>
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

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveAvailability} disabled={savingAvailability}>
                  {savingAvailability ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar disponibilidad
                </Button>
                {availabilityMsg && (
                  <span className="text-sm text-muted-foreground">{availabilityMsg}</span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ===== Profile ===== */}
          <TabsContent value="profile" className="mt-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Tu perfil profesional
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta información es visible para los clientes en tu perfil público.
              </p>

              <div className="mt-6 space-y-5">
                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Categoría
                  </label>
                  <Select value={editCategoryId} onValueChange={setEditCategoryId}>
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

                {/* Rate */}
                <div className="space-y-2">
                  <label htmlFor="edit-rate" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Tarifa por sesión (€)
                  </label>
                  <Input
                    id="edit-rate"
                    type="number"
                    min="1"
                    step="0.01"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
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
              </div>

              <Separator className="my-6" />

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
                {profileMsg && (
                  <span className={`text-sm ${profileMsg.includes("Error") ? "text-destructive" : "text-muted-foreground"}`}>
                    {profileMsg}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ===== Earnings ===== */}
          <TabsContent value="earnings" className="mt-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Resumen de ingresos
              </h3>

              <div className="mt-6 space-y-4">
                {totalEarnings === 0 ? (
                  <EmptyState
                    icon={DollarSign}
                    title="Sin ingresos todavía"
                    description="Cuando completes sesiones, verás aquí tu resumen de ingresos."
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Total acumulado</p>
                      <p className="text-sm text-muted-foreground">
                        {totalSessions} sesiones completadas
                      </p>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary">
                      {formatCurrency(totalEarnings)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stripe Connect</p>
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
