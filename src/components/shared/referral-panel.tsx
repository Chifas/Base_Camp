"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Gift, Check, Users, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

interface Referral {
  id: string;
  code: string;
  type: string;
  status: string;
  creditAmount: number | null;
  referredName: string | null;
  referredImage: string | null;
  completedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
  totalCredits: number;
}

interface ReferralPanelProps {
  referrals: Referral[];
  stats: ReferralStats;
  userRole: "CLIENT" | "PROFESSIONAL";
  onRefresh: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  COMPLETED: { label: "Completado", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  EXPIRED: { label: "Expirado", color: "text-zinc-500 bg-zinc-50 dark:bg-zinc-800" },
};

export function ReferralPanel({ referrals, stats, userRole, onRefresh }: ReferralPanelProps) {
  const [creating, setCreating] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const referralType = userRole === "PROFESSIONAL"
    ? "PROFESSIONAL_TO_PROFESSIONAL"
    : "CLIENT_TO_CLIENT";

  const handleCreateCode = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: referralType }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear código");
        return;
      }
      toast.success(`Código creado: ${data.code}`);
      onRefresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/referrals/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al canjear código");
        return;
      }
      toast.success(data.message);
      setRedeemCode("");
      onRefresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setRedeeming(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const benefitText = userRole === "PROFESSIONAL"
    ? "Invita a otros profesionales y ambos disfrutaréis de comisión reducida durante el primer mes."
    : "Invita amigos y ambos recibiréis 10€ de crédito cuando completen su primera sesión.";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="mx-auto mb-2 h-5 w-5 text-indigo-600" />
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Referidos completados</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Clock className="mx-auto mb-2 h-5 w-5 text-amber-600" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pendientes</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Gift className="mx-auto mb-2 h-5 w-5 text-green-600" />
          <p className="text-2xl font-bold">
            {userRole === "CLIENT" ? `${stats.totalCredits}€` : stats.completed}
          </p>
          <p className="text-sm text-muted-foreground">
            {userRole === "CLIENT" ? "Créditos ganados" : "Meses con descuento"}
          </p>
        </div>
      </div>

      {/* Benefit description + create code */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Invita y gana</h3>
        <p className="mt-1 text-sm text-muted-foreground">{benefitText}</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={handleCreateCode} disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gift className="mr-2 h-4 w-4" />
            )}
            Generar código
          </Button>
        </div>
      </div>

      {/* Redeem code */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Canjear código</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          ¿Tienes un código de un amigo? Introdúcelo aquí.
        </p>
        <div className="mt-4 flex gap-3">
          <Input
            placeholder="GP-XXXXXXXX"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            className="max-w-xs uppercase"
          />
          <Button
            onClick={handleRedeem}
            disabled={redeeming || !redeemCode.trim()}
            variant="outline"
          >
            {redeeming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Canjear
          </Button>
        </div>
      </div>

      {/* Referral list */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Tus códigos</h3>
        {referrals.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="Sin referidos aún"
            description="Genera tu primer código de referido y compártelo con amigos."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {referrals.map((r, i) => {
              const st = statusLabels[r.status] ?? { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" };
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono font-semibold dark:bg-zinc-800">
                      {r.code}
                    </code>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                    {r.referredName && (
                      <span className="text-sm text-muted-foreground">
                        → {r.referredName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Expira: {new Date(r.expiresAt).toLocaleDateString("es-ES")}
                    </span>
                    {r.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(r.code, r.id)}
                      >
                        {copiedId === r.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
