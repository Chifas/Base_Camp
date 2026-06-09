"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Copy, Trash2, FileText, Save, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
}

export default function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<{ id: string | null; name: string; content: string } | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res: { data: Template[] }) => setTemplates(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.content.trim()) {
      toast.error("Nombre y contenido son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const res = editing.id
        ? await fetch(`/api/templates/${editing.id}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name: editing.name, content: editing.content }),
          })
        : await fetch(`/api/templates`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name: editing.name, content: editing.content }),
          });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { template: Template };
      setTemplates((rows) =>
        editing.id
          ? rows.map((r) => (r.id === editing.id ? data.template : r))
          : [data.template, ...rows]
      );
      toast.success(editing.id ? "Plantilla actualizada" : "Plantilla creada");
      setEditing(null);
    } catch {
      toast.error("No se pudo guardar la plantilla");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates((rows) => rows.filter((r) => r.id !== id));
      toast.success("Plantilla eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  }

  function copy(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => toast.success("Copiado al portapapeles"))
      .catch(() => toast.error("No se pudo copiar"));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
            Plantillas reutilizables
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mensajes y planes de acción recurrentes — copia y pega en notas o chat.
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing({ id: null, name: "", content: "" })}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nueva plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
          <FileText className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
          <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-50">
            Aún no tienes plantillas
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Empieza creando una para ahorrar tiempo en cada sesión.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-stone-900 dark:text-stone-50 truncate">{t.name}</h4>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    onClick={() => copy(t.content)}
                    className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-teal-600 dark:hover:bg-stone-800"
                    title="Copiar"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditing({ id: t.id, name: t.name, content: t.content })}
                    className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-teal-600 dark:hover:bg-stone-800"
                    title="Editar"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-md p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-stone-600 dark:text-stone-400">
                {t.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="mx-0 w-full max-w-lg rounded-t-xl border bg-card p-5 shadow-xl sm:mx-4 sm:rounded-xl">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-base font-semibold">
                {editing.id ? "Editar plantilla" : "Nueva plantilla"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-3 block text-sm">
              <span className="font-display font-semibold text-stone-700 dark:text-stone-300">Nombre</span>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing((s) => (s ? { ...s, name: e.target.value } : s))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={100}
                placeholder="Plan post-sesión inicial"
              />
            </label>

            <label className="mt-3 block text-sm">
              <span className="font-display font-semibold text-stone-700 dark:text-stone-300">Contenido</span>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing((s) => (s ? { ...s, content: e.target.value } : s))}
                className="mt-1 min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={5000}
                placeholder="Hola {nombre}, tras nuestra sesión te dejo..."
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {editing.content.length}/5000
              </p>
            </label>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
