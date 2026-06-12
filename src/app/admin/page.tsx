"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  CalendarCheck,
  Star,
  Flag,
  Loader2,
  Search,
  Trash2,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { EmptyState } from "@/components/shared/empty-state";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AdminStats {
  users: { clients: number; professionals: number; verifiedProfessionals: number };
  sessions: { total: number; completed: number; last30d: number };
  reviews: { total: number; reported: number; avgRating: number };
  waitlist: number;
}

interface ReportedReview {
  id: string;
  rating: number;
  comment: string | null;
  reportReason: string | null;
  reportedAt: string | null;
  createdAt: string;
  authorName: string;
  authorEmail: string;
  professionalName: string;
  sessionDate: string;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscriptionTier: string;
  sessionCount: number;
  reviewCount: number;
  verified: boolean | null;
  rating: number | null;
}

const ROLE_BADGES: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  PROFESSIONAL: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
  ADMIN: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
};

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Cliente",
  PROFESSIONAL: "Profesional",
  ADMIN: "Admin",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login");
    if (
      status === "authenticated" &&
      (session?.user as { role?: string })?.role !== "ADMIN"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  if (
    status === "loading" ||
    (session?.user as { role?: string })?.role !== "ADMIN"
  ) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="font-heading text-3xl font-bold">Panel de administración</h1>
        <p className="mt-1 text-muted-foreground">
          Métricas de la plataforma, moderación de reseñas y directorio de usuarios.
        </p>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas reportadas</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ReportedReviewsTab />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview tab                                                       */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!stats) {
    return <EmptyState icon={Users} title="Sin datos" description="No se pudieron cargar las métricas." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Clientes"
        value={stats.users.clients}
        sub={`${stats.waitlist} en lista de espera`}
      />
      <StatCard
        icon={ShieldCheck}
        label="Profesionales"
        value={stats.users.professionals}
        sub={`${stats.users.verifiedProfessionals} verificados`}
      />
      <StatCard
        icon={CalendarCheck}
        label="Sesiones"
        value={stats.sessions.total}
        sub={`${stats.sessions.completed} completadas · ${stats.sessions.last30d} últimos 30 días`}
      />
      <StatCard
        icon={Star}
        label="Reseñas"
        value={stats.reviews.total}
        sub={`Media ${stats.reviews.avgRating.toFixed(1)} · ${stats.reviews.reported} reportadas`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reported reviews tab                                               */
/* ------------------------------------------------------------------ */

function ReportedReviewsTab() {
  const [reviews, setReviews] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleAction(id: string, action: "dismiss" | "delete") {
    if (
      action === "delete" &&
      !window.confirm("¿Eliminar esta reseña de forma permanente? Se recalculará la valoración del profesional.")
    ) {
      return;
    }
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: action === "dismiss" ? "PATCH" : "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "No se pudo completar la acción");
        return;
      }
      toast.success(action === "dismiss" ? "Reporte descartado" : "Reseña eliminada");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Error de conexión");
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="Sin reseñas reportadas"
        description="La cola de moderación está vacía. Las reseñas reportadas por los usuarios aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {review.rating}/5
                </span>
                <span className="text-sm text-muted-foreground">
                  de {review.authorName} ({review.authorEmail})
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Sobre <strong>{review.professionalName}</strong> ·{" "}
                {new Date(review.sessionDate).toLocaleDateString("es-ES")}
              </p>
            </div>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <Flag className="mr-1 h-3 w-3" />
              Reportada
            </Badge>
          </div>

          {review.comment && (
            <blockquote className="mt-3 rounded-lg bg-muted/50 p-3 text-sm italic">
              &ldquo;{review.comment}&rdquo;
            </blockquote>
          )}

          <p className="mt-3 text-sm">
            <span className="font-medium text-destructive">Motivo del reporte:</span>{" "}
            {review.reportReason ?? "No especificado"}
          </p>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={actioningId === review.id}
              onClick={() => handleAction(review.id, "dismiss")}
            >
              Descartar reporte
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actioningId === review.id}
              onClick={() => handleAction(review.id, "delete")}
            >
              {actioningId === review.id ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-3.5 w-3.5" />
              )}
              Eliminar reseña
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users tab                                                          */
/* ------------------------------------------------------------------ */

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      fetch(`/api/admin/users?${params}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setUsers(data.users);
            setTotal(data.total);
            setTotalPages(data.totalPages);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, roleFilter, page]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email…"
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          {["", "CLIENT", "PROFESSIONAL", "ADMIN"].map((role) => (
            <Button
              key={role || "ALL"}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRoleFilter(role);
                setPage(1);
              }}
            >
              {role ? ROLE_LABELS[role] : "Todos"}
            </Button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {total} usuario{total !== 1 && "s"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Search} title="Sin resultados" description="Ningún usuario coincide con la búsqueda." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Sesiones</th>
                <th className="px-4 py-3 font-medium">Valoración</th>
                <th className="px-4 py-3 font-medium">Alta</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name ?? "—"}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_BADGES[user.role] ?? ""}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                    {user.verified && (
                      <Badge className="ml-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Verificado
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.sessionCount}</td>
                  <td className="px-4 py-3">
                    {user.rating !== null ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {user.rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
