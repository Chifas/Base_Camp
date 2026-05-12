"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Sparkles, Calendar, Loader2, Target, Smile } from "lucide-react";
import { getProfessionalLevel } from "@/lib/professional-level";

interface AnalyticsResponse {
  summary: {
    totalViews30d: number;
    bookings30d: number;
    conversionRate: number;
    completedThisMonth: number;
    totalSessionsCompleted: number;
    impactPoints: number;
    avgRating: number;
    reviewCount: number;
    npsAverage: number | null;
    npsCount: number;
  };
  viewsTimeline: { day: string; count: number }[];
  monthlyTimeline: { month: string; sessions: number }[];
}

const MONTH_LABELS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function formatMonth(ym: string): string {
  const [, m] = ym.split("-");
  const idx = parseInt(m ?? "1", 10) - 1;
  return MONTH_LABELS[idx] ?? ym;
}

export default function AnalyticsTab() {
  const [data, setData]       = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/professional")
      .then((r) => (r.ok ? r.json() : null))
      .then((res: AnalyticsResponse | null) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        No se pudieron cargar las analíticas.
      </div>
    );
  }

  const s = data.summary;
  const level = getProfessionalLevel(s.totalSessionsCompleted);

  const maxViews = Math.max(1, ...data.viewsTimeline.map((v) => v.count));
  const maxMonthly = Math.max(1, ...data.monthlyTimeline.map((m) => m.sessions));

  const cards = [
    {
      label: "Visitas a tu perfil (30d)",
      value: s.totalViews30d.toString(),
      icon: Eye,
      tone: "text-stone-700 dark:text-stone-200",
      bg: "bg-stone-100 dark:bg-stone-800",
    },
    {
      label: "Reservas (30d)",
      value: s.bookings30d.toString(),
      icon: Calendar,
      tone: "text-teal-700 dark:text-teal-300",
      bg: "bg-teal-100 dark:bg-teal-900/30",
    },
    {
      label: "Conversión visita → reserva",
      value: `${(s.conversionRate * 100).toFixed(1)}%`,
      icon: Target,
      tone: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "NPS medio",
      value: s.npsAverage !== null ? s.npsAverage.toFixed(1) : "—",
      sub: s.npsCount > 0 ? `${s.npsCount} respuesta${s.npsCount === 1 ? "" : "s"}` : "Sin respuestas",
      icon: Smile,
      tone: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* Level / progress card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Tu nivel
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${level.current.badgeClass}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                {level.current.label}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {s.totalSessionsCompleted} sesiones completadas
              </span>
            </div>
          </div>
          {level.next && (
            <div className="text-right">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {level.toNext} sesiones para <strong>{level.next.label}</strong>
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${level.progress * 100}%` }}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
              <c.icon className={`h-4 w-4 ${c.tone}`} />
            </div>
            <p className={`mt-2 font-display text-2xl font-bold ${c.tone}`}>{c.value}</p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{c.label}</p>
            {c.sub && <p className="mt-0.5 text-[11px] text-stone-400 dark:text-stone-500">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Views timeline */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-50">
            Visitas diarias a tu perfil — últimos 30 días
          </h3>
        </div>
        <div className="mt-4 flex h-32 items-end gap-1">
          {data.viewsTimeline.map((v) => (
            <div key={v.day} className="group relative flex flex-1 flex-col justify-end" title={`${v.day}: ${v.count} visita${v.count === 1 ? "" : "s"}`}>
              <div
                className="w-full rounded-t bg-teal-500/70 hover:bg-teal-500 transition-colors"
                style={{ height: `${(v.count / maxViews) * 100}%`, minHeight: v.count > 0 ? "2px" : "0" }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-stone-400">
          <span>hace 30d</span>
          <span>hoy</span>
        </div>
      </div>

      {/* Monthly sessions */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-50">
            Sesiones completadas — últimos 6 meses
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            {s.impactPoints} puntos en total
          </span>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3">
          {data.monthlyTimeline.map((m) => (
            <div key={m.month} className="flex flex-col items-center">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t bg-amber-500/80 hover:bg-amber-500 transition-colors"
                  style={{ height: `${(m.sessions / maxMonthly) * 100}%`, minHeight: m.sessions > 0 ? "4px" : "0" }}
                  title={`${m.sessions} sesión${m.sessions === 1 ? "" : "es"}`}
                />
              </div>
              <p className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-400">{formatMonth(m.month)}</p>
              <p className="text-[11px] text-stone-400">{m.sessions}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
