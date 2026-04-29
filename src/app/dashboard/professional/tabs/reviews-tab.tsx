"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import type { ReviewItem } from "./types";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => {
    fetch("/api/reviews/received")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = useCallback(
    async (reviewId: string) => {
      setSavingResponse(true);
      try {
        const res = await fetch(`/api/reviews/${reviewId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText }),
        });
        if (res.ok) {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId ? { ...r, professionalResponse: responseText } : r
            )
          );
          setRespondingTo(null);
          setResponseText("");
          toast.success("Respuesta publicada");
        } else {
          const data = await res.json();
          toast.error(data.error ?? "Error al responder");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        setSavingResponse(false);
      }
    },
    [responseText]
  );

  return (
    <div className="mt-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Reseñas de clientes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Valoraciones recibidas de tus sesiones completadas.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={MessageSquare}
              title="Sin reseñas todavía"
              description="Cuando los clientes valoren tus sesiones, aparecerán aquí."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {(review.ratingPunctuality ||
                  review.ratingKnowledge ||
                  review.ratingCommunication ||
                  review.ratingValue) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {review.ratingPunctuality && (
                      <span>Puntualidad: {review.ratingPunctuality}/5</span>
                    )}
                    {review.ratingKnowledge && (
                      <span>Conocimiento: {review.ratingKnowledge}/5</span>
                    )}
                    {review.ratingCommunication && (
                      <span>Comunicación: {review.ratingCommunication}/5</span>
                    )}
                    {review.ratingValue && <span>Valor: {review.ratingValue}/5</span>}
                  </div>
                )}

                {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}

                {review.professionalResponse ? (
                  <div className="mt-3 ml-4 rounded-lg border-l-2 border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/50">
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      Tu respuesta
                    </p>
                    <p className="mt-1 text-sm">{review.professionalResponse}</p>
                  </div>
                ) : respondingTo === review.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Escribe tu respuesta..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(review.id)}
                        disabled={savingResponse || !responseText.trim()}
                      >
                        {savingResponse && (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        )}
                        Publicar respuesta
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="mr-1 h-3.5 w-3.5" />
                    Responder
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
