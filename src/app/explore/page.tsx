"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFESSIONALS } from "@/data/mock";
import { CATEGORY_LABELS, type ProfessionalCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

const categories: { value: string; label: string }[] = [
  { value: "ALL", label: "Todas las categorías" },
  { value: "PSYCHOLOGIST", label: "Psicólogo/a" },
  { value: "COACH", label: "Coach de Vida" },
  { value: "CAREER_MENTOR", label: "Mentor de Carrera" },
  { value: "NUTRITIONIST", label: "Nutricionista" },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("rating");

  const filteredProfessionals = useMemo(() => {
    let result = [...PROFESSIONALS];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.headline.toLowerCase().includes(query) ||
          p.bio.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else if (sortBy === "reviews") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filter */}
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

        {/* Sort */}
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
      <p className="mt-6 text-sm text-muted-foreground">
        {filteredProfessionals.length} profesional
        {filteredProfessionals.length !== 1 ? "es" : ""} encontrado
        {filteredProfessionals.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProfessionals.map((pro, i) => (
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
                      src={pro.image}
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
                        {CATEGORY_LABELS[pro.category]}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {pro.rating}
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

      {/* Empty state */}
      {filteredProfessionals.length === 0 && (
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
