"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BetaFeedbackModalProps {
  sessionId?: string;
  onClose: () => void;
}

export function BetaFeedbackModal({ sessionId, onClose }: BetaFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (rating === 0 || !feedback.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          rating,
          feedback: feedback.trim(),
        }),
      });

      if (res.ok) {
        toast.success("¡Gracias por tu feedback!");
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al enviar feedback");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass w-full max-w-md rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Tu opinión nos importa</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Estamos en beta. Cuéntanos cómo ha sido tu experiencia para mejorar
            la plataforma.
          </p>

          {/* Star rating */}
          <div className="mt-4">
            <label className="text-sm font-medium">
              ¿Cómo valoras tu experiencia general?
            </label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback text */}
          <div className="mt-4">
            <label className="text-sm font-medium">
              ¿Qué podemos mejorar?
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Cuéntanos tu experiencia, sugerencias, problemas encontrados..."
              rows={4}
              maxLength={2000}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {feedback.length}/2000
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Ahora no
            </Button>
            <Button
              className="flex-1"
              disabled={rating === 0 || !feedback.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar feedback"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
