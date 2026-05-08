"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, X, ExternalLink, CheckCircle2, Circle } from "lucide-react";

interface ActionItemView {
  id: string;
  content: string;
  completed: boolean;
}

interface NoteView {
  summary: string | null;
  nextSteps: string | null;
  resources: string[];
  actionItems: ActionItemView[];
}

interface SessionNotesViewerProps {
  sessionId: string;
  professionalName: string;
  onClose: () => void;
}

export function SessionNotesViewer({ sessionId, professionalName, onClose }: SessionNotesViewerProps) {
  const [note, setNote]       = useState<NoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/notes`)
      .then((r) => (r.ok ? r.json() : { note: null }))
      .then((res: { note: NoteView | null }) => setNote(res.note))
      .finally(() => setLoading(false));
  }, [sessionId]);

  async function toggleItem(id: string, current: boolean) {
    setUpdatingId(id);
    const next = !current;
    setNote((n) =>
      n
        ? {
            ...n,
            actionItems: n.actionItems.map((a) => (a.id === id ? { ...a, completed: next } : a)),
          }
        : n
    );
    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Roll back optimistic update
      setNote((n) =>
        n
          ? {
              ...n,
              actionItems: n.actionItems.map((a) => (a.id === id ? { ...a, completed: current } : a)),
            }
          : n
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const isEmpty =
    !note ||
    (!note.summary && !note.nextSteps && note.resources.length === 0 && note.actionItems.length === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div
        className="mx-0 flex w-full max-w-2xl flex-col rounded-t-xl border bg-card shadow-xl sm:mx-4 sm:rounded-xl"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h3 className="font-display text-base font-semibold">
              Notas de la sesión con {professionalName}
            </h3>
            <p className="text-xs text-muted-foreground">Compartido por tu profesional.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-stone-300 dark:text-stone-700" />
            <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              Aún no hay notas
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Tu profesional puede añadir un resumen y tareas después de la sesión.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {note?.summary && (
              <section className="mb-5">
                <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Resumen
                </h4>
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                  {note.summary}
                </p>
              </section>
            )}

            {note?.nextSteps && (
              <section className="mb-5">
                <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Próximos pasos
                </h4>
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                  {note.nextSteps}
                </p>
              </section>
            )}

            {note && note.actionItems.length > 0 && (
              <section className="mb-5">
                <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Tus tareas
                </h4>
                <ul className="mt-2 space-y-2">
                  {note.actionItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id, item.completed)}
                        disabled={updatingId === item.id}
                        className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60 ${
                          item.completed
                            ? "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20"
                            : "border-stone-200 bg-white hover:border-teal-300 dark:border-stone-700 dark:bg-stone-900"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
                        )}
                        <span className={item.completed ? "text-stone-500 line-through dark:text-stone-400" : "text-stone-800 dark:text-stone-200"}>
                          {item.content}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {note && note.resources.length > 0 && (
              <section>
                <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Recursos
                </h4>
                <ul className="mt-2 space-y-1">
                  {note.resources.map((url, idx) => (
                    <li key={idx}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md bg-stone-50 px-3 py-2 text-xs text-teal-700 hover:bg-stone-100 hover:underline dark:bg-stone-800 dark:text-teal-400 dark:hover:bg-stone-800/80"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{url}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
