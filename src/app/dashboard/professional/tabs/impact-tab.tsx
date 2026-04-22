"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, TrendingUp, Users, Award, Heart, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import type { ProfileData, RedemptionItem } from "./types";

interface Props {
  profile: ProfileData | null;
  onPointsUpdate: (pts: number) => void;
}

export default function ImpactTab({ profile, onPointsUpdate }: Props) {
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [redeemingType, setRedeemingType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rewards")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.redemptions) setRedemptions(data.redemptions);
      })
      .catch(() => {});
  }, []);

  const handleRedeem = useCallback(
    async (type: "CERTIFICATION" | "DONATION") => {
      setRedeemingType(type);
      try {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (res.ok) {
          const data = await res.json();
          toast.success(type === "CERTIFICATION" ? "Certificación canjeada" : "Donación realizada");
          setRedemptions((prev) => [data.redemption, ...prev]);
          onPointsUpdate(data.impactPointsRemaining);
        } else {
          const data = await res.json();
          toast.error(data.error ?? "Error al canjear");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        setRedeemingType(null);
      }
    },
    [onPointsUpdate]
  );

  const points = profile?.impactPoints ?? 0;

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Tu impacto social</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada sesión completada suma puntos de impacto que puedes canjear por recompensas.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm text-primary">Puntos disponibles</p>
            </div>
            <p className="mt-2 font-heading text-3xl font-bold text-primary">{points}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              +{CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION} pts por sesión completada
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sesiones completadas</p>
            </div>
            <p className="mt-2 font-heading text-3xl font-bold">
              {profile?.totalSessionsCompleted ?? 0}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Puntuación de impacto</p>
            </div>
            <p className="mt-2 font-heading text-3xl font-bold">
              {(profile?.socialImpactScore ?? 0).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Canjear recompensas</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Utiliza tus puntos de impacto para obtener reconocimientos o contribuir a causas sociales.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border p-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Certificación profesional</h4>
                  <p className="text-xs text-muted-foreground">
                    {CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION} puntos
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Obtén un certificado que acredita tu compromiso con el desarrollo profesional y el
                impacto social.
              </p>
            </div>
            <Button
              className="mt-4 w-full"
              variant={points >= CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION ? "default" : "outline"}
              disabled={
                points < CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION ||
                redeemingType === "CERTIFICATION"
              }
              onClick={() => handleRedeem("CERTIFICATION")}
            >
              {redeemingType === "CERTIFICATION" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Gift className="mr-2 h-4 w-4" />
              )}
              {points >= CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION
                ? "Canjear certificación"
                : `Faltan ${CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION - points} pts`}
            </Button>
          </div>

          <div className="flex flex-col justify-between rounded-xl border p-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Donación solidaria</h4>
                  <p className="text-xs text-muted-foreground">
                    {CREDITS_CONFIG.IMPACT_POINTS_DONATION} puntos
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Contribuye a programas de orientación profesional para personas en situación de
                vulnerabilidad.
              </p>
            </div>
            <Button
              className="mt-4 w-full"
              variant={points >= CREDITS_CONFIG.IMPACT_POINTS_DONATION ? "default" : "outline"}
              disabled={
                points < CREDITS_CONFIG.IMPACT_POINTS_DONATION || redeemingType === "DONATION"
              }
              onClick={() => handleRedeem("DONATION")}
            >
              {redeemingType === "DONATION" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Heart className="mr-2 h-4 w-4" />
              )}
              {points >= CREDITS_CONFIG.IMPACT_POINTS_DONATION
                ? "Realizar donación"
                : `Faltan ${CREDITS_CONFIG.IMPACT_POINTS_DONATION - points} pts`}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Historial de canjes</h3>
        {redemptions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Sparkles}
              title="Sin canjes todavía"
              description="Cuando canjees tus puntos de impacto, el historial aparecerá aquí."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {redemptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  {r.type === "CERTIFICATION" ? (
                    <Award className="h-4 w-4 text-indigo-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-pink-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {r.type === "CERTIFICATION" ? "Certificación profesional" : "Donación solidaria"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  -{r.pointsSpent} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
