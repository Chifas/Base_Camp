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
  SlidersHorizontal,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/shared/pagination";
import type { Category, Professional } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read filters from URL
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "ALL";
  const sortBy = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");
  const minRating = searchParams.get("minRating") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Advanced filters panel
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update URL params
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
      // Reset to page 1 when filters change (unless page itself is changing)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/explore?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateParams({ search: localSearch });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch, searchQuery, updateParams]);

  // Fetch professionals from API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "ALL") params.set("category", selectedCategory);
    if (sortBy) params.set("sort", sortBy);
    if (minRating) params.set("minRating", minRating);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", page.toString());
    params.set("limit", "12");

    fetch(`/api/professionals?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        setProfessionals(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch(() => {
        setProfessionals([]);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCategory, sortBy, page, minRating, minPrice, maxPrice]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const hasActiveFilters = minRating || minPrice || maxPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Explorar profesionales
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Encuentra al profesional perfecto para ti entre nuestros expertos
          verificados.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o especialidad..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filter */}
        <Select
          value={selectedCategory}
          onValueChange={(v) => updateParams({ category: v })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Más relevantes</SelectItem>
            <SelectItem value="rating">Mejor valorados</SelectItem>
            <SelectItem value="reviews">Más reseñas</SelectItem>
            <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filters toggle */}
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
              {[minRating, minPrice, maxPrice].filter(Boolean).length}
            </span>
          )}
        </Button>
      </motion.div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Rating mínimo</label>
            <div className="flex h-9 items-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => updateParams({ minRating: minRating === r.toString() ? "" : r.toString() })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-5 w-5 ${
                      r <= parseInt(minRating || "0")
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Precio mín. (€)</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParams({ minPrice: e.target.value })}
              className="h-9 w-24"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Precio máx. (€)</label>
            <Input
              type="number"
              min="0"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => updateParams({ maxPrice: e.target.value })}
              className="h-9 w-24"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-auto"
              onClick={() => updateParams({ minRating: "", minPrice: "", maxPrice: "" })}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
        </motion.div>
      )}

      {/* Results count */}
      <p className="mt-6 text-sm text-muted-foreground">
        {total} profesional
        {total !== 1 ? "es" : ""} encontrado
        {total !== 1 ? "s" : ""}
      </p>

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro, i) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <Link
                href={`/professional/${pro.id}`}
                className="group block"
              >
                <div className="glass overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex gap-4 p-5">
                    {/* Avatar */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
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
                            <h3 className="truncate font-heading text-base font-semibold group-hover:text-primary transition-colors">
                              {pro.name}
                            </h3>
                            {pro.verified && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {pro.headline}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {pro.categoryName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">
                            {pro.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({pro.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio preview */}
                  <div className="border-t px-5 py-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {pro.bio}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t px-5 py-3">
                    <span className="font-heading text-lg font-bold text-primary">
                      {formatCurrency(pro.hourlyRate)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /sesión
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="pointer-events-none"
                    >
                      Ver perfil
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
          <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-heading text-lg font-semibold">
            No se encontraron resultados
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Prueba a cambiar los filtros o el término de búsqueda.
          </p>
          <Button
            variant="outline"
            className="mt-4"
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
