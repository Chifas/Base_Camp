"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  CheckCircle2,
  X,
  MessageSquare,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { ExploreSkeleton } from "@/components/shared/explore-skeleton";
import { gsap } from "@/lib/gsap-config";
import { LANGUAGES as LANGUAGE_OPTIONS } from "@/lib/languages";
import type { Professional } from "@/types";

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
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" },
];

const PRICE_RANGES = [
  { value: "", label: "Cualquier precio" },
  { value: "0-40", label: "Hasta 40€" },
  { value: "40-70", label: "40€ - 70€" },
  { value: "70-100", label: "70€ - 100€" },
  { value: "100-", label: "Más de 100€" },
];

const EXPERIENCE_RANGES = [
  { value: "", label: "Cualquier experiencia" },
  { value: "1", label: "1+ años" },
  { value: "3", label: "3+ años" },
  { value: "5", label: "5+ años" },
  { value: "10", label: "10+ años" },
];

const DISPLAY_LANGUAGES = LANGUAGE_OPTIONS.slice(0, 8);

function getCoverColor(name: string): string {
  const colors = [
    "bg-teal-100",
    "bg-amber-100",
    "bg-sky-100",
    "bg-violet-100",
    "bg-rose-100",
    "bg-emerald-100",
    "bg-orange-100",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index] ?? "bg-indigo-100";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
  if (!next) return null;
  const diff = (next.dayOfWeek - today + 7) % 7;
  const label = diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : (days[next.dayOfWeek] ?? "");
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
  const language       = searchParams.get("language") || "";
  const priceRange     = searchParams.get("price") || "";
  const minExperience  = searchParams.get("experience") || "";
  const availableNow   = searchParams.get("available") === "true";

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    if (language) params.set("language", language);
    if (minExperience) params.set("minExperience", minExperience);
    if (availableNow) params.set("available", "true");
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
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
  }, [searchQuery, selectedCat, sortBy, page, minRating, language, priceRange, minExperience, availableNow]);

  // Categories fetch kept for potential dynamic use
  useEffect(() => {
    fetch("/api/categories").catch(() => {});
  }, []);

  const hasActiveFilters =
    !!minRating ||
    !!language ||
    !!priceRange ||
    !!minExperience ||
    availableNow;

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCat !== "ALL") params.set("category", selectedCat);
    if (sortBy && sortBy !== "relevance") params.set("sort", sortBy);
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-stone-900 dark:text-stone-50">
          Explorar profesionales
        </h1>
        <p className="mt-2 text-base sm:text-lg text-stone-600 dark:text-stone-400">
          Encuentra al profesional perfecto para ti entre nuestros expertos verificados.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mt-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <label htmlFor="search-professionals" className="sr-only">
            Buscar profesionales por nombre o especialidad
          </label>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            id="search-professionals"
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
              aria-pressed={selectedCat === pill.value}
              className={`rounded-full px-4 py-1.5 text-sm font-display font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
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
              aria-pressed={minRating === r.toString()}
              aria-label={`Filtrar por valoración ${r} estrellas o más`}
              className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 ${
                minRating === r.toString()
                  ? "bg-amber-500 text-white"
                  : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              {r}+
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
              showAdvanced || hasActiveFilters
                ? "bg-teal-700 text-white shadow-sm shadow-teal-700/20"
                : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-0.5 rounded-full bg-white/25 px-1.5 text-[10px] font-bold">
                {[minRating, language, priceRange, minExperience, availableNow ? "1" : ""].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 rounded-full border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar todo
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div
            id="advanced-filters"
            className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/60 sm:p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Language */}
              <div>
                <label htmlFor="filter-language" className="mb-1.5 block text-xs font-display font-semibold text-stone-700 dark:text-stone-300">
                  Idioma
                </label>
                <select
                  id="filter-language"
                  value={language}
                  onChange={(e) => updateParams({ language: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                >
                  <option value="">Cualquier idioma</option>
                  {DISPLAY_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="filter-price" className="mb-1.5 block text-xs font-display font-semibold text-stone-700 dark:text-stone-300">
                  Tarifa por hora
                </label>
                <select
                  id="filter-price"
                  value={priceRange}
                  onChange={(e) => updateParams({ price: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                >
                  {PRICE_RANGES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="filter-experience" className="mb-1.5 block text-xs font-display font-semibold text-stone-700 dark:text-stone-300">
                  Años de experiencia
                </label>
                <select
                  id="filter-experience"
                  value={minExperience}
                  onChange={(e) => updateParams({ experience: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                >
                  {EXPERIENCE_RANGES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="mb-1.5 block text-xs font-display font-semibold text-stone-700 dark:text-stone-300">
                  Disponibilidad
                </label>
                <label className="flex h-[38px] cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50">
                  <input
                    type="checkbox"
                    checked={availableNow}
                    onChange={(e) => updateParams({ available: e.target.checked ? "true" : "" })}
                    className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                  />
                  Solo con horarios disponibles
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Sort — pills on sm+, native select on mobile */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-400 mr-1 hidden sm:inline">Ordenar:</span>
          {/* Mobile select */}
          <select
            value={sortBy}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="sm:hidden rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-sm text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Ordenar resultados"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Desktop pills */}
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParams({ sort: opt.value })}
              className={`hidden sm:inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
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
      {loading && <ExploreSkeleton />}

      {/* Grid */}
      {!loading && (
        <div
          ref={gridRef}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {professionals.map((pro) => {
            const nextSlot = getNextAvailability(pro.availability);
            const langs =
              pro.languages && pro.languages.length > 0
                ? pro.languages.slice(0, 3)
                : ["Español"];

            const coverColor = getCoverColor(pro.name);
            const initials = getInitials(pro.name);
            const isAvailableToday = nextSlot?.startsWith("Hoy");

            return (
              <div key={pro.id} data-pro-card>
                <Link href={`/professional/${pro.id}`} className="group block h-full">
                  <div className="h-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5">

                    {/* Cover band */}
                    <div className={`relative h-20 ${coverColor} transition-all duration-300 group-hover:brightness-95`}>
                      <svg
                        className="absolute inset-0 h-full w-full opacity-20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id={`dots-${pro.id}`}
                            x="0"
                            y="0"
                            width="16"
                            height="16"
                            patternUnits="userSpaceOnUse"
                          >
                            <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-stone-600" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#dots-${pro.id})`} />
                      </svg>

                      {/* "Disponible hoy" badge */}
                      {isAvailableToday && (
                        <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Disponible hoy
                        </span>
                      )}
                    </div>

                    {/* Circular photo — overlaps cover */}
                    <div className="flex flex-col items-center px-5 pb-4">
                      <div className="relative -mt-11 h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full ring-4 ring-white dark:ring-stone-900 bg-stone-100 dark:bg-stone-800">
                        {pro.image ? (
                          <Image
                            src={pro.image}
                            alt={pro.name}
                            fill
                            className="object-cover"
                            sizes="88px"
                          />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center ${coverColor} text-lg font-bold text-stone-700`}>
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Name + verified */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <h3 className="text-center font-display text-base font-semibold text-stone-900 dark:text-stone-50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {pro.name}
                        </h3>
                        {pro.verified && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>

                      {/* Specialty */}
                      <p className="mt-0.5 text-center text-xs font-medium text-teal-600 dark:text-teal-400">
                        {pro.categoryName}
                      </p>

                      {/* Rating */}
                      <div className="mt-1.5 flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                          {pro.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          ({pro.reviewCount} reseñas)
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                      <p className="line-clamp-2 text-center text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                        {pro.bio}
                      </p>
                    </div>

                    {/* Tags */}
                    {pro.headline && (
                      <div className="px-5 py-2 flex flex-wrap justify-center gap-1.5">
                        {pro.headline
                          .split("·")
                          .slice(1)
                          .flatMap((s) => s.split("&").map((t) => t.trim()))
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[11px] text-stone-500 dark:text-stone-400"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-2.5 flex items-center justify-center gap-4 text-xs text-stone-400 dark:text-stone-500">
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

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                          Gratis · 3/mes
                        </span>
                        {pro.hourlyRate && pro.hourlyRate > 0 && (
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">
                            Después: {pro.hourlyRate}€/h
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="pointer-events-none border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 font-display text-xs"
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
