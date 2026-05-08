"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, X, Video, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SessionChat } from "@/components/shared/session-chat";
import { SessionNotesEditor } from "@/components/shared/session-notes-editor";
import { formatDate, formatTime } from "@/lib/utils";
import type { SessionItem } from "./types";

interface Props {
  sessions: SessionItem[];
  onSessionsChange: (updater: (prev: SessionItem[]) => SessionItem[]) => void;
}

export default function SessionsTab({ sessions, onSessionsChange }: Props) {
  const router = useRouter();
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [notesSessionId, setNotesSessionId] = useState<string | null>(null);

  const confirmedSessions = sessions.filter((s) => s.status === "CONFIRMED");
  const pendingSessions   = sessions.filter((s) => s.status === "PENDING");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const handleSessionAction = useCallback(
    async (sessionId: string, newStatus: "CONFIRMED" | "CANCELLED") => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          onSessionsChange((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
          );
        }
      } catch {}
    },
    [onSessionsChange]
  );

  return (
    <div className="mt-6 space-y-6">
      {pendingSessions.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
            Pendientes de aprobación
          </h3>
          <div className="mt-3 space-y-3">
            {pendingSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-5 dark:border-yellow-900/30 dark:bg-yellow-900/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{session.clientName}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(session.scheduledAt)}
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(session.scheduledAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(session.messageCount ?? 0) > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setChatSessionId(session.id)}>
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Mensajes ({session.messageCount})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleSessionAction(session.id, "CANCELLED")}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button size="sm" onClick={() => handleSessionAction(session.id, "CONFIRMED")}>
                    <Check className="mr-1 h-4 w-4" />
                    Aceptar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-lg font-semibold">
          Próximas sesiones confirmadas
        </h3>
        {confirmedSessions.length === 0 && pendingSessions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Calendar}
              title="No tienes sesiones programadas"
              description="Cuando un cliente reserve contigo, sus sesiones aparecerán aquí."
            />
          </div>
        ) : confirmedSessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No hay sesiones confirmadas por el momento.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {confirmedSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{session.clientName}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(session.scheduledAt)}
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(session.scheduledAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Gratuita
                  </span>
                  {(session.messageCount ?? 0) > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setChatSessionId(session.id)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Mensajes ({session.messageCount})
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setNotesSessionId(session.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Notas
                  </Button>
                  <Button size="sm" onClick={() => router.push(`/session/${session.id}`)}>
                    <Video className="mr-2 h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {completedSessions.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
            Sesiones completadas
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Añade resumen, próximos pasos y tareas para que el cliente lo vea en su panel.
          </p>
          <div className="mt-3 space-y-3">
            {completedSessions.slice(0, 8).map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{session.clientName}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(session.scheduledAt)}
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(session.scheduledAt)}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setNotesSessionId(session.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Notas y plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {chatSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div
            className="mx-0 flex w-full max-w-lg flex-col rounded-t-xl border bg-card shadow-xl sm:mx-4 sm:rounded-xl"
            style={{ height: "min(600px, 80vh)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-heading text-base font-semibold">Mensajes del cliente</h3>
              <button
                onClick={() => setChatSessionId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SessionChat sessionId={chatSessionId} viewOnly />
            </div>
          </div>
        </div>
      )}

      {notesSessionId && (
        <SessionNotesEditor
          sessionId={notesSessionId}
          onClose={() => setNotesSessionId(null)}
        />
      )}
    </div>
  );
}
