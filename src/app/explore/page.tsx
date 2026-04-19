"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  Filter,
  X,
  Sparkles,
  ArrowUpRight,
  Flame,
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
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import type { Category, Professional } from "@/types";

type ProTone =
  | "glass"
  | "dark"
  | "primary"
  | "emerald"
  | "amber"
  | "violet"
  | "rose";

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

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout>();

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/explore?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateParams({ search: localSearch });
      }
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

  // Header entrance
  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const parts = headerRef.current?.querySelectorAll("[data-enter]");
      if (parts) {
        gsap.fromTo(
          parts,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.08,
          }
        );
      }
    },
    { scope: pageRef }
  );

  // Professional cards batch reveal
  useGSAP(
    () => {
      const root = gridRef.current;
      if (!root) return;
      if (loading) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-pro-card]", root);
      if (!cards.length) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
      const batch = ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "expo.out",
            stagger: { amount: 0.45, from: "start" },
          });
        },
      });
      return () => batch.forEach((st) => st.kill());
    },
    { scope: gridRef, dependencies: [loading, professionals.length] }
  );

  // Compute bento spans + tones in a repeating rhythm.
  // Every 6 cards: 1 wide hero (col-span-8 row-span-2) + 2 compact (col-span-4) +
  // 3 compact (col-span-4) on the next row.
  const bentoLayout = useMemo(() => {
    type Slot = { span: string; tone: ProTone; hero: boolean };
    const pattern: Slot[] = [
      {
        span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 row-span-2 min-h-[480px]",
        tone: "dark",
        hero: true,
      },
      { span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4 min-h-[280px]", tone: "glass", hero: false },
      { span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4 min-h-[280px]", tone: "primary", hero: false },
      { span: "col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4 min-h-[280px]", tone: "emerald", hero: false },
      { span: "col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4 min-h-[280px]", tone: "amber", hero: false },
      { span: "col-span-2 sm:col-span-4 md:col-span-2 lg:col-span-4 min-h-[280px]", tone: "violet", hero: false },
    ];
    return (i: number) => pattern[i % pattern.length];
  }, []);

  return (
    <div ref={pageRef} className="relative">
      {/* Ambient aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/5 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="space-y-4">
          <div data-enter className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{total}</span> profesionales verificados
          </div>
          <h1
            data-enter
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Encuentra a quien te{" "}
            <span className="text-gradient">guíe</span>
          </h1>
          <p data-enter className="max-w-2xl text-lg text-muted-foreground">
            Filtra por especialidad, valoración y disponibilidad. Reserva gratis en 3 clics.
          </p>
        </div>

        {/* Filters bento */}
        <BentoGrid columns={12} gap="tight" className="mt-10">
          {/* Search - wide */}
          <BentoCard
            span="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-7"
            tone="glass"
            className="!p-4"
          >
            <div className="relative flex h-full items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-12 border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
              />
            </div>
          </BentoCard>

          {/* Category */}
          <BentoCard
            span="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3"
            tone="glass"
            className="!p-4"
          >
            <Select
              value={selectedCategory}
              onValueChange={(v) => updateParams({ category: v })}
            >
              <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
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
          </BentoCard>

          {/* Sort */}
          <BentoCard
            span="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2"
            tone="glass"
            className="!p-4"
          >
            <Select value={sortBy} onValueChange={(v) => updateParams({ sort: v })}>
              <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Más relevantes</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="reviews">Más reseñas</SelectItem>
              </SelectContent>
            </Select>
          </BentoCard>
        </BentoGrid>

        {/* Quick category chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-1 rounded-full"
          >
            <Filter className="h-4 w-4" />
            Filtros avanzados
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
                {[minRating].filter(Boolean).length}
              </span>
            )}
          </Button>

          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.slug}
              onClick={() =>
                updateParams({
                  category: selectedCategory === cat.slug ? "ALL" : cat.slug,
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {showAdvanced && (
          <div className="mt-3 flex flex-col gap-4 rounded-3xl border bg-card/60 p-4 backdrop-blur sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rating mínimo</label>
              <div className="flex h-9 items-center gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      updateParams({
                        minRating: minRating === r.toString() ? "" : r.toString(),
                      })
                    }
                    className="transition-transform hover:scale-110"
                    aria-label={`${r} estrellas o más`}
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
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="sm:ml-auto"
                onClick={() => updateParams({ minRating: "" })}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="mt-8 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span> resultado
            {total !== 1 ? "s" : ""}
          </p>
          {total > 0 && (
            <p className="text-xs text-muted-foreground">
              Mostrando {professionals.length} de {total}
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="mt-16 rounded-3xl border bg-card/60 p-12 text-center backdrop-blur">
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
        ) : (
          <div ref={gridRef}>
            <BentoGrid columns={12} gap="normal" className="mt-6">
              {professionals.map((pro, i) => {
                const slot = bentoLayout(i);
                return (
                  <ProfessionalBentoCard
                    key={pro.id}
                    pro={pro}
                    span={slot.span}
                    isHero={slot.hero}
                    tone={slot.tone}
                  />
                );
              })}
            </BentoGrid>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParams({ page: p.toString() })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Professional card in bento style ────────────────────────────────────────

const PRO_SURFACE: Record<ProTone, string> = {
  glass:
    "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-white/40 dark:border-white/10",
  dark: "bg-zinc-950 text-white border-white/10",
  primary:
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border-indigo-400/30",
  emerald:
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/30",
  amber:
    "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300/40",
  violet:
    "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-violet-400/30",
  rose:
    "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-400/30",
};

function ProfessionalBentoCard({
  pro,
  span,
  isHero,
  tone,
}: {
  pro: Professional;
  span: string;
  isHero: boolean;
  tone: ProTone;
}) {
  const isDark = tone !== "glass";

  return (
    <Link
      href={`/professional/${pro.id}`}
      data-pro-card
      data-bento-card
      className={`group relative overflow-hidden rounded-3xl border ${
        PRO_SURFACE[tone]
      } ${span} flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
    >
      {/* Aurora on hero */}
      {isHero && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(50% 50% at 90% 80%, rgba(236,72,153,0.35) 0%, transparent 65%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </>
      )}

      {/* Photo */}
      <div
        className={`relative w-full overflow-hidden ${
          isHero ? "h-[62%]" : "aspect-[5/4]"
        }`}
      >
        <Image
          src={
            pro.image ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`
          }
          alt={pro.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes={
            isHero
              ? "(min-width: 1024px) 700px, 100vw"
              : "(min-width: 1024px) 340px, 50vw"
          }
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isHero
              ? "from-zinc-950 via-zinc-950/30 to-transparent"
              : isDark
              ? "from-black/70 via-black/10 to-transparent"
              : "from-black/55 via-black/5 to-transparent"
          }`}
        />

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            className="bg-white/90 text-[10px] uppercase tracking-wider text-zinc-900 dark:bg-black/70 dark:text-white"
          >
            {pro.categoryName}
          </Badge>
          {pro.verified && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          )}
        </div>

        {isHero && (
          <div className="absolute right-3 top-12 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950">
            <Flame className="h-3 w-3" /> Destacado
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className={`relative z-[1] flex flex-1 flex-col justify-between gap-4 ${
          isHero ? "p-7 sm:p-8" : "p-5 sm:p-6"
        }`}
      >
        <div>
          <h3
            className={`font-heading font-semibold leading-tight ${
              isHero ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl"
            } ${isDark ? "text-white" : ""}`}
          >
            {pro.name}
          </h3>
          <p
            className={`mt-1 line-clamp-2 text-sm ${
              isDark ? "text-white/75" : "text-muted-foreground"
            } ${isHero ? "sm:text-base" : ""}`}
          >
            {pro.headline}
          </p>
        </div>

        <div
          className={`flex items-center justify-between gap-2 border-t pt-4 ${
            isDark ? "border-white/10" : "border-border/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : ""
                }`}
              >
                {pro.rating.toFixed(1)}
              </span>
            </div>
            <span
              className={`text-xs ${
                isDark ? "text-white/60" : "text-muted-foreground"
              }`}
            >
              ({pro.reviewCount})
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              isDark
                ? "bg-white/15 text-white ring-1 ring-white/20"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Sparkles className="h-3 w-3" /> Gratis
          </span>
        </div>
      </div>

      {/* Hover arrow */}
      <div
        className={`pointer-events-none absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 ${
          isDark ? "bg-white text-zinc-900" : "bg-zinc-950 text-white"
        }`}
      >
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
