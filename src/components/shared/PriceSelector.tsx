"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import type { AvailablePricesResponse, PriceRule } from "@/types";

interface PriceSelectorProps {
  professionalId: string;
  selectedPriceId?: string | null;
  onPriceSelect: (priceId: string, amount: number) => void;
}

export function PriceSelector({
  professionalId,
  selectedPriceId,
  onPriceSelect,
}: PriceSelectorProps) {
  const [data, setData] = useState<AvailablePricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/professional/${professionalId}/available-prices`
        );
        if (!res.ok) throw new Error("Error al cargar los precios");
        const json: AvailablePricesResponse = await res.json();
        setData(json);
      } catch {
        setError("No se pudieron cargar las opciones de precio. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [professionalId]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando precios">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (!data || data.prices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay opciones de precio disponibles actualmente.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.prices.map((rule) => (
        <PriceCard
          key={rule.id}
          rule={rule}
          isSelected={selectedPriceId === rule.id}
          isFirstSession={
            rule.maxPreviousBookings === 0 && data.context.isFirstSession
          }
          onSelect={() => onPriceSelect(rule.id, rule.price)}
        />
      ))}

      {!data.context.isAuthenticated && (
        <p className="pt-1 text-center text-xs text-muted-foreground">
          <a href="/auth/login" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Inicia sesión
          </a>{" "}
          para ver todas las tarifas disponibles para ti.
        </p>
      )}
    </div>
  );
}

// ─── Internal sub-component ──────────────────────────────────────────────────

interface PriceCardProps {
  rule: PriceRule;
  isSelected: boolean;
  isFirstSession: boolean;
  onSelect: () => void;
}

function PriceCard({ rule, isSelected, isFirstSession, onSelect }: PriceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-pressed={isSelected}
    >
      <Card
        className={cn(
          "cursor-pointer border-2 transition-all duration-150",
          isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/40 hover:shadow-sm"
        )}
      >
        <CardContent className="flex items-start justify-between gap-4 p-4">
          {/* Left: name + badges + description */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold leading-tight">
                {rule.name}
              </span>
              {isFirstSession && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  <Sparkles className="h-3 w-3" />
                  ¡Primera sesión!
                </Badge>
              )}
              {rule.requiresStudent && (
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Estudiante
                </Badge>
              )}
            </div>
            {rule.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {rule.description}
              </p>
            )}
          </div>

          {/* Right: price + check */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(rule.price)}
            </span>
            <CheckCircle2
              className={cn(
                "h-5 w-5 transition-opacity",
                isSelected ? "text-primary opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
