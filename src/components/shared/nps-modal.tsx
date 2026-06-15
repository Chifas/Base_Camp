"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NpsModalProps {
  sessionId: string;
  /** Called after the user submits or skips the survey. */
  onDone: () => void;
}

const NPS_VALUES = Array.from({ length: 11 }, (_, i) => i); // 0..10

export function NpsModal({ sessionId, onDone }: NpsModalProps) {
  const [score, setScore]     = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (score === null) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npsScore: score,
          comment:  comment.trim() || null,
        }),
      });
    } catch {
      // Fail silently — the user is leaving anyway.
    } finally {
      setSubmitting(false);
      onDone();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">¿Qué tal ha ido?</h3>
            <p className="mt-1 text-sm text-zinc-400">
              ¿Recomendarías esta sesión a alguien? Tu valoración nos ayuda a mejorar.
            </p>
          </div>
          <button
            onClick={onDone}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <div className="grid grid-cols-11 gap-1">
            {NPS_VALUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setScore(v)}
                aria-pressed={score === v}
                aria-label={`Puntuación ${v}`}
                className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  score === v
                    ? v >= 9
                      ? "border-teal-500 bg-teal-500 text-white"
                      : v >= 7
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-rose-500 bg-rose-500 text-white"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
            <span>Nada probable</span>
            <span>Muy probable</span>
          </div>
        </div>

        <textarea
          className="mt-4 min-h-[64px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          placeholder="¿Algo que destacar? (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />

        <div className="mt-5 flex justify-between">
          <Button variant="ghost" className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" onClick={onDone}>
            Saltar
          </Button>
          <Button
            onClick={submit}
            disabled={score === null || submitting}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar y salir
          </Button>
        </div>
      </div>
    </div>
  );
}
