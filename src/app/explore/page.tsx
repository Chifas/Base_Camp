"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/pagination";
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

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "ALL";
  const sortBy = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");
  const minRating = searchParams.get("minRating") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout>();

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
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "ALL") params.set("category", selectedCategory);
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
  }, [searchQuery, selectedCategory, sortBy, page, minRating]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const hasActiveFilters = !!minRating;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
          Explorar profesionales
        </h1>
        <p className="mt-2 text-lg text-stone-600 dark:text-stone-400">
          Encuentra al profesional perfecto para ti entre nuestros expertos verificados.
        </p>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-8 space-y-4"
      >
        {/* Search + sort row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Buscar por nombre o especialidad..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus-visible:ring-teal-500"
            />
          </div>
          {/* Sort pills (desktop) */}
          <div className="hidden sm:flex items-center gap-1.5">
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

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => updateParams({ category: pill.value })}
              className={`rounded-full px-4 py-1.5 text-sm font-display font-medium transition-all duration-150 ${
                selectedCategory === pill.value
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                  : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-teal-300 hover:text-teal-600 dark:hover:border-teal-700 dark:hover:text-teal-400"
              }`}
            >
              {pill.label}
            </button>
          ))}

          {/* Rating filter pills */}
          {[4, 5].map((r) => (
            <button
              key={r}
              onClick={() => updateParams({ minRating: minRating === r.toString() ? "" : r.toString() })}
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
      </motion.div>

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro, i) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Link href={`/professional/${pro.id}`} className="group block h-full">
                <div className="h-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  {/* Top section with avatar + info */}
                  <div className="flex gap-4 p-5">
                    {/* Avatar */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                      <Image
                        src={pro.image || "/placeholder-avatar.png"}
                        alt={pro.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate font-display text-base font-semibold text-stone-900 dark:text-stone-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {pro.name}
                            </h3>
                            {pro.verified && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
                            {pro.headline}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2.5 flex-wrap">
                        <Badge className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-0 text-xs font-medium">
                          {pro.categoryName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                            {pro.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-stone-400 dark:text-stone-500">
                            ({pro.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio preview */}
                  <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                    <p className="line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                      {pro.bio}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 px-3 py-1 text-sm font-semibold text-teal-700 dark:text-teal-400">
                      Gratuito
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="pointer-events-none text-sm font-display font-medium text-teal-600 dark:text-teal-400 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20"
                    >
                      Ver perfil →
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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
