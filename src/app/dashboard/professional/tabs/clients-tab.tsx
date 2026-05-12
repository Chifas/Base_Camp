"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Users, Calendar, Save, X, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  image: string;
  totalSessions: number;
  completedSessions: number;
  lastSessionAt: string | null;
  hasUpcoming: boolean;
  note: { content: string; updatedAt: string } | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ClientsTab() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string; name: string; content: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res: { data: ClientRow[] }) => setClients(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function saveNote() {
    if (!editing) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/clients/${editing.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editing.content }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { note: { content: string; updatedAt: string } | null };
      setClients((rows) =>
        rows.map((r) => (r.id === editing.id ? { ...r, note: data.note } : r))
      );
      toast.success("Nota guardada");
      setEditing(null);
    } catch {
      toast.error("No se pudo guardar la nota");
    } finally {
      setSavingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
        <Users className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
        <h3 className="mt-4 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
          Aún no tienes clientes
        </h3>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Cuando alguien reserve una sesión contigo aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {clients.map((c) => (
        <div
          key={c.id}
          className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
              {c.image ? (
                <Image src={c.image} alt={c.name} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">
                  {getInitials(c.name)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-stone-900 dark:text-stone-50 truncate">{c.name}</p>
                {c.hasUpcoming && (
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{c.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 dark:text-stone-400">
                <span>
                  {c.completedSessions} completada{c.completedSessions === 1 ? "" : "s"}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Última: {formatDate(c.lastSessionAt)}
                </span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing({ id: c.id, name: c.name, content: c.note?.content ?? "" })}
          >
            <NotebookPen className="mr-1.5 h-3.5 w-3.5" />
            {c.note ? "Ver nota" : "Añadir nota"}
          </Button>
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="mx-0 w-full max-w-lg rounded-t-xl border bg-card p-5 shadow-xl sm:mx-4 sm:rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Nota privada — {editing.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Solo tú ves esta nota. Útil para contexto, objetivos, observaciones.
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              className="mt-3 min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Anota objetivos, preferencias, contexto..."
              value={editing.content}
              onChange={(e) => setEditing((s) => (s ? { ...s, content: e.target.value } : s))}
              maxLength={5000}
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {editing.content.length}/5000
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={saveNote} disabled={savingNote}>
                {savingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
