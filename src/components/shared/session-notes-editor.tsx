"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionItemDraft {
  id?: string;
  content: string;
  completed?: boolean;
}

interface NoteData {
  summary: string;
  nextSteps: string;
  resources: string[];
  actionItems: ActionItemDraft[];
}

interface SessionNotesEditorProps {
  sessionId: string;
  onClose: () => void;
}

const EMPTY: NoteData = { summary: "", nextSteps: "", resources: [], actionItems: [] };

export function SessionNotesEditor({ sessionId, onClose }: SessionNotesEditorProps) {
  const [data, setData]     = useState<NoteData>(EMPTY);
  const [resourceInput, setResourceInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/notes`)
      .then((r) => (r.ok ? r.json() : { note: null }))
      .then((res: { note: { summary: string | null; nextSteps: string | null; resources: string[]; actionItems: { id: string; content: string; completed: boolean }[] } | null }) => {
        if (res.note) {
          setData({
            summary:     res.note.summary ?? "",
            nextSteps:   res.note.nextSteps ?? "",
            resources:   res.note.resources ?? [],
            actionItems: res.note.actionItems.map((a) => ({
              id: a.id,
              content: a.content,
              completed: a.completed,
            })),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  function addActionItem() {
    setData((d) => ({ ...d, actionItems: [...d.actionItems, { content: "", completed: false }] }));
  }
  function updateActionItem(idx: number, content: string) {
    setData((d) => ({
      ...d,
      actionItems: d.actionItems.map((a, i) => (i === idx ? { ...a, content } : a)),
    }));
  }
  function removeActionItem(idx: number) {
    setData((d) => ({ ...d, actionItems: d.actionItems.filter((_, i) => i !== idx) }));
  }

  function addResource() {
    const v = resourceInput.trim();
    if (!v) return;
    try {
      new URL(v);
    } catch {
      toast.error("URL inválida — incluye https://");
      return;
    }
    setData((d) => ({ ...d, resources: [...d.resources, v] }));
    setResourceInput("");
  }
  function removeResource(idx: number) {
    setData((d) => ({ ...d, resources: d.resources.filter((_, i) => i !== idx) }));
  }

  async function save() {
    const cleanItems = data.actionItems
      .map((a) => ({ ...a, content: a.content.trim() }))
      .filter((a) => a.content.length > 0);

    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary:     data.summary.trim() || null,
          nextSteps:   data.nextSteps.trim() || null,
          resources:   data.resources,
          actionItems: cleanItems,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al guardar");
      }
      toast.success("Notas guardadas — el cliente las verá en su panel");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div
        className="mx-0 flex w-full max-w-2xl flex-col rounded-t-xl border bg-card shadow-xl sm:mx-4 sm:rounded-xl"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h3 className="font-display text-base font-semibold">Notas y plan de acción</h3>
            <p className="text-xs text-muted-foreground">
              Visible para el cliente desde su panel y por email a las 48h.
            </p>
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
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Summary */}
            <label className="block">
              <span className="text-sm font-display font-semibold text-stone-700 dark:text-stone-300">
                Resumen de la sesión
              </span>
              <textarea
                className="mt-1.5 min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="¿Qué tratasteis? ¿Qué conclusiones sacasteis?"
                value={data.summary}
                onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
                maxLength={2000}
              />
            </label>

            {/* Next steps */}
            <label className="mt-4 block">
              <span className="text-sm font-display font-semibold text-stone-700 dark:text-stone-300">
                Próximos pasos
              </span>
              <textarea
                className="mt-1.5 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Recomendaciones globales para el cliente."
                value={data.nextSteps}
                onChange={(e) => setData((d) => ({ ...d, nextSteps: e.target.value }))}
                maxLength={2000}
              />
            </label>

            {/* Action items */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-semibold text-stone-700 dark:text-stone-300">
                  Tareas para el cliente
                </span>
                <Button size="sm" variant="outline" onClick={addActionItem}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Añadir tarea
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {data.actionItems.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sin tareas asignadas.</p>
                )}
                {data.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => updateActionItem(idx, e.target.value)}
                      placeholder={`Tarea ${idx + 1}`}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={500}
                    />
                    <button
                      onClick={() => removeActionItem(idx)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      aria-label="Eliminar tarea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="mt-4">
              <span className="text-sm font-display font-semibold text-stone-700 dark:text-stone-300">
                Recursos (URLs)
              </span>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="url"
                  value={resourceInput}
                  onChange={(e) => setResourceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addResource();
                    }
                  }}
                  placeholder="https://..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm" variant="outline" onClick={addResource}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Añadir
                </Button>
              </div>
              {data.resources.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {data.resources.map((url, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-md bg-stone-50 px-3 py-1.5 text-xs dark:bg-stone-800">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-teal-700 hover:underline dark:text-teal-400">
                        {url}
                      </a>
                      <button
                        onClick={() => removeResource(idx)}
                        className="ml-2 shrink-0 text-muted-foreground hover:text-red-600"
                        aria-label="Eliminar recurso"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {!loading && (
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
