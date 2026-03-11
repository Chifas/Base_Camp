"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, type ProfessionalCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

// Shape returned by /api/professionals
interface ApiProfessional {
  id: string;
  category: ProfessionalCategory;
  headline: string | null;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  user: { id: string; name: string | null; image: string | null; bio: string | null };
}

const categories: { value: string; label: string }[] = [
  { value: "ALL", label: "Todas las categorías" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery]       = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy]                 = useState("rating");
  const [professionals, setProfessionals]   = useState<ApiProfessional[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  // Debounce search input 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      params.set("sort", sortBy);

      const res = await fetch(`/api/professionals?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar profesionales");
      const data = await res.json();
      setProfessionals(data);
    } catch {
      setError("No se pudieron cargar los profesionales. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Mejor valorados</SelectItem>
            <SelectItem value="reviews">Más reseñas</SelectItem>
            <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Results count */}
      {!loading && !error && (
        <p className="mt-6 text-sm text-muted-foreground">
          {professionals.length} profesional
          {professionals.length !== 1 ? "es" : ""} encontrado
          {professionals.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="link" className="ml-2 p-0 h-auto text-destructive" onClick={fetchProfessionals}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex gap-4 p-5">
                <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
              <div className="border-t px-5 py-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-2/3" />
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
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
              <Link href={`/professional/${pro.id}`} className="group block">
                <div className="glass overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex gap-4 p-5">
                    {/* Avatar */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {pro.user.image ? (
                        <Image
                          src={pro.user.image}
                          alt={pro.user.name ?? "Profesional"}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                          {pro.user.name?.[0] ?? "?"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-heading text-base font-semibold group-hover:text-primary transition-colors">
                          {pro.user.name}
                        </h3>
                        {pro.verified && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {pro.headline}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[pro.category]}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{pro.rating}</span>
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
                      {pro.user.bio}
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
                    <Button size="sm" variant="secondary" className="pointer-events-none">
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
      {!loading && !error && professionals.length === 0 && (
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
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
