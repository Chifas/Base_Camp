"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  MessageSquare,
  Star,
  CreditCard,
  Check,
  CheckCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { FadeIn } from "@/components/shared/motion-wrapper";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

interface ApiResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Filter constants                                                   */
/* ------------------------------------------------------------------ */

type TypeFilter = "ALL" | "SESSIONS" | "MESSAGES" | "REVIEWS" | "PAYMENTS";
type ReadFilter = "ALL" | "UNREAD" | "READ";

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Sesiones", value: "SESSIONS" },
  { label: "Mensajes", value: "MESSAGES" },
  { label: "Reseñas", value: "REVIEWS" },
  { label: "Pagos", value: "PAYMENTS" },
];

const READ_FILTERS: { label: string; value: ReadFilter }[] = [
  { label: "Todas", value: "ALL" },
  { label: "No leídas", value: "UNREAD" },
  { label: "Leídas", value: "READ" },
];

const SESSION_TYPES = new Set([
  "SESSION_CONFIRMED",
  "SESSION_CANCELLED",
  "SESSION_REMINDER",
]);
const MESSAGE_TYPES = new Set(["NEW_MESSAGE"]);
const REVIEW_TYPES = new Set(["NEW_REVIEW"]);
const PAYMENT_TYPES = new Set(["PAYMENT_RECEIVED"]);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTypeIcon(type: string) {
  if (SESSION_TYPES.has(type)) return CalendarCheck;
  if (MESSAGE_TYPES.has(type)) return MessageSquare;
  if (REVIEW_TYPES.has(type)) return Star;
  if (PAYMENT_TYPES.has(type)) return CreditCard;
  return Bell;
}

function getTypeDotColor(type: string) {
  if (SESSION_TYPES.has(type)) return "bg-blue-500";
  if (MESSAGE_TYPES.has(type)) return "bg-teal-500";
  if (REVIEW_TYPES.has(type)) return "bg-yellow-500";
  if (PAYMENT_TYPES.has(type)) return "bg-green-500";
  return "bg-primary";
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  return `hace ${months}mes${months > 1 ? "es" : ""}`;
}

function matchesTypeFilter(type: string, filter: TypeFilter) {
  if (filter === "ALL") return true;
  if (filter === "SESSIONS") return SESSION_TYPES.has(type);
  if (filter === "MESSAGES") return MESSAGE_TYPES.has(type);
  if (filter === "REVIEWS") return REVIEW_TYPES.has(type);
  if (filter === "PAYMENTS") return PAYMENT_TYPES.has(type);
  return true;
}

function matchesReadFilter(read: boolean, filter: ReadFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNREAD") return !read;
  if (filter === "READ") return read;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const LIMIT = 20;

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchNotifications = useCallback(async (p: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?limit=${LIMIT}&page=${p}`);
      if (res.ok) {
        const data: ApiResponse = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      // Silently handle network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications(page);
    }
  }, [status, page, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silently handle errors
    }
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.link) router.push(n.link);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side filtering
  const filtered = notifications.filter(
    (n) => matchesTypeFilter(n.type, typeFilter) && matchesReadFilter(n.read, readFilter)
  );

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              Notificaciones
            </h1>
            <p className="mt-1 text-muted-foreground">
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? "es" : ""} sin leer`
                : "Todas las notificaciones leídas"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="self-start sm:self-auto"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    typeFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Read status filter */}
          <div className="flex flex-wrap gap-1">
            {READ_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setReadFilter(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  readFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Notifications list */}
      <FadeIn delay={0.2}>
        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="glass rounded-2xl p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-heading text-lg font-semibold">
                No hay notificaciones
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {typeFilter !== "ALL" || readFilter !== "ALL"
                  ? "No se encontraron notificaciones con los filtros seleccionados."
                  : "Cuando tengas actividad, tus notificaciones aparecerán aquí."}
              </p>
              {(typeFilter !== "ALL" || readFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setTypeFilter("ALL");
                    setReadFilter("ALL");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((n, i) => {
                const Icon = getTypeIcon(n.type);
                const dotColor = getTypeDotColor(n.type);

                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleClickNotification(n)}
                    className={`glass group w-full rounded-2xl p-4 text-left transition-colors hover:bg-muted/50 sm:p-5 ${
                      !n.read ? "ring-1 ring-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          !n.read
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {!n.read && (
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                              />
                            )}
                            <p
                              className={`text-sm ${
                                !n.read ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {n.title}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground/60">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                      </div>

                      {/* Read indicator */}
                      <div className="hidden shrink-0 sm:block">
                        {n.read ? (
                          <CheckCheck className="h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <FadeIn delay={0.3}>
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
