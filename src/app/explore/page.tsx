"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  CheckCircle2,
  Loader2,
  X,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { gsap } from "@/lib/gsap-config";
import type { Category, Professional } from "@/types";

const CATEGORY_PILLS = [
  { value: "ALL", label: "Todos" },
  { value: "PSYCHOLOGIST", label: "Psicología Laboral" },
  { value: "COACH", label: "Coaching Ejecutivo" },
  { value: "CAREER_MENTOR", label: "Mentoría de Carrera" },
  { value: "NUTRITIONIST", label: "Especialistas" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Más relevantes" },
  { value: "rating", label: "Mejor valorados" },
  { value: "reviews", label: "Más reseñas" },
];

const LANGUAGES = ["ES", "EN", "FR", "DE"];

function getNextAvailability(availability: Professional["availability"]) {
  if (!availability || availability.length === 0) return null;
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const today = new Date().getDay();
  const sorted = [...availability].sort((a, b) => {
    const da = (a.dayOfWeek - today + 7) % 7;
    const db = (b.dayOfWeek - today + 7) % 7;
    return da - db;
  });
  const next = sorted[0];
  const diff = (next.dayOfWeek - today + 7) % 7;
  const label = diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : days[next.dayOfWeek];
  return `${label} ${next.startTime}`;
}

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery    = searchParams.get("search") || "";
  const selectedCat    = searchParams.get("category") || "ALL";
  const sortBy         = searchParams.get("sort") || "relevance";
  const page           = parseInt(searchParams.get("page") || "1");
  const minRating      = searchParams.get("minRating") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout>();
  const gridRef     = useRef<HTMLDivElement>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "ALL" && value !== "0") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!("page" in updates)) params.delete("page");
      router.push(`/explore?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (localSearch !== searchQuery) updateParams({ search: localSearch });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch, searchQuery, updateParams]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || loading) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-pro-card]"));
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.97, y: 16 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.05,
        clearProps: "transform",
      }
    );
  }, [professionals, loading]);

  useEffect(() => {
    // Animate out
    const grid = gridRef.current;
    if (grid) {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-pro-card]"));
      if (cards.length) {
        gsap.to(cards, { opacity: 0, scale: 0.95, duration: 0.15, ease: "power2.in" });
      }
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCat !== "ALL") params.set("category", selectedCat);
    if (sortBy) params.set("sort", sortBy);
    if (minRating) params.set("minRating", minRating);
    params.set("page", page.toString());
    params.set("limit", "12");

    fetch(`/api/professionals?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        setProfessionals(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCat, sortBy, page, minRating]);

  // Categories fetch kept for potential dynamic use
  useEffect(() => {
    fetch("/api/categories").catch(() => {});
  }, []);

  const hasActiveFilters = !!minRating;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
          Explorar profesionales
        </h1>
        <p className="mt-2 text-lg text-stone-600 dark:text-stone-400">
          Encuentra al profesional perfecto para ti entre nuestros expertos verificados.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mt-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Buscar por nombre o especialidad..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 py-2.5 pl-10 pr-4 text-sm text-stone-900 dark:text-stone-50 shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Category + rating pills row */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => updateParams({ category: pill.value })}
              className={`rounded-full px-4 py-1.5 text-sm font-display font-medium transition-all duration-150 ${
                selectedCat === pill.value
                  ? "bg-teal-700 text-white shadow-sm shadow-teal-700/20"
                  : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-400"
              }`}
            >
              {pill.label}
            </button>
          ))}

          {[4, 5].map((r) => (
            <button
              key={r}
              onClick={() =>
                updateParams({ minRating: minRating === r.toString() ? "" : r.toString() })
              }
              className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                minRating === r.toString()
                  ? "bg-amber-500 text-white"
                  : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              {r}+
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={() => updateParams({ minRating: "" })}
              className="flex items-center gap-1 rounded-full border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Sort pills (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs text-stone-400 mr-1">Ordenar:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParams({ sort: opt.value })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                sortBy === opt.value
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
        {total} profesional{total !== 1 ? "es" : ""} encontrado{total !== 1 ? "s" : ""}
      </p>

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div
          ref={gridRef}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {professionals.map((pro) => {
            const nextSlot = getNextAvailability(pro.availability);
            // Deterministic language assignment from name seed
            const langCount = (pro.name.charCodeAt(0) % 2) + 1;
            const langs = LANGUAGES.slice(0, langCount);

            return (
              <div key={pro.id} data-pro-card style={{ opacity: 0 }}>
                <Link href={`/professional/${pro.id}`} className="group block h-full">
                  <div className="h-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

                    {/* Header: photo + name + rating */}
                    <div className="flex items-start gap-4 p-5 pb-4">
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                        <Image
                          src={
                            pro.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`
                          }
                          alt={pro.name}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="truncate font-display text-base font-semibold text-stone-900 dark:text-stone-50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {pro.name}
                          </h3>
                          {pro.verified && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>

                        <p className="mt-0.5 text-xs font-medium text-teal-600 dark:text-teal-400 truncate">
                          {pro.categoryName}
                        </p>

                        <div className="mt-1.5 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                            {pro.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-stone-400 dark:text-stone-500">
                            ({pro.reviewCount} reseñas)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                      <p className="line-clamp-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                        {pro.bio}
                      </p>
                    </div>

                    {/* Tags from headline */}
                    {pro.headline && (
                      <div className="px-5 py-2 flex flex-wrap gap-1.5">
                        {pro.headline
                          .split("·")
                          .slice(1)
                          .flatMap((s) => s.split("&").map((t) => t.trim()))
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] text-stone-500 dark:text-stone-400"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Meta row: languages + next slot */}
                    <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-2.5 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        {langs.join(", ")}
                      </span>
                      {nextSlot && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                          <span className="text-teal-600 dark:text-teal-400 font-medium">
                            {nextSlot}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Footer: price + CTA */}
                    <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        Gratis · 3/mes
                      </span>
                      <Button
                        size="sm"
                        className="pointer-events-none bg-teal-700 text-white hover:bg-teal-800 font-display text-xs"
                      >
                        Ver perfil →
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && professionals.length === 0 && (
        <div className="mt-16 text-center">
          <Search className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
          <h3 className="mt-4 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
            No se encontraron resultados
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Prueba a cambiar los filtros o el término de búsqueda.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-stone-200 dark:border-stone-700"
            onClick={() => {
              setLocalSearch("");
              router.push("/explore");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: p.toString() })}
          />
        </div>
      )}
    </div>
  );
}
