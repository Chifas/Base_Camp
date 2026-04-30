"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Flag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Review } from "@/types";
import { formatDate } from "@/lib/utils";

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ReviewsSection({ reviews, rating, reviewCount }: ReviewsSectionProps) {
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  async function handleReport(reviewId: string) {
    if (!reportReason.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        toast.success("Reseña reportada. Revisaremos el contenido.");
        setReportedIds((prev) => { const next = new Set(Array.from(prev)); next.add(reviewId); return next; });
        setReportingId(null);
        setReportReason("");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al reportar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Reseñas</h2>
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-heading text-lg font-bold">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={review.userImage || "/placeholder-avatar.png"}
                alt={review.userName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold">{review.userName}</p>
                <p className="shrink-0 text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Category ratings */}
              {(review.ratingPunctuality || review.ratingKnowledge || review.ratingCommunication || review.ratingValue) && (
                <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-2">
                  {review.ratingPunctuality && <span>Puntualidad: {review.ratingPunctuality}/5</span>}
                  {review.ratingKnowledge && <span>Conocimiento: {review.ratingKnowledge}/5</span>}
                  {review.ratingCommunication && <span>Comunicación: {review.ratingCommunication}/5</span>}
                  {review.ratingValue && <span>Valor: {review.ratingValue}/5</span>}
                </div>
              )}

              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}

              {/* Professional response */}
              {review.professionalResponse && (
                <div className="mt-3 ml-2 rounded-lg border-l-2 border-indigo-500 bg-indigo-50/50 p-3 dark:bg-indigo-950/20">
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <MessageSquare className="mr-1 inline h-3 w-3" />
                    Respuesta del profesional
                  </p>
                  <p className="mt-1 text-sm">{review.professionalResponse}</p>
                </div>
              )}

              {/* Report button */}
              {!reportedIds.has(review.id) && (
                <>
                  {reportingId === review.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        placeholder="Describe el motivo del reporte..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        maxLength={500}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleReport(review.id)}>
                          Enviar reporte
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReportingId(null); setReportReason(""); }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReportingId(review.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Flag className="h-3 w-3" />
                      Reportar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Este profesional aún no tiene reseñas.
          </p>
        )}
      </div>
    </div>
  );
}
