"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { ConversationChat } from "./conversation-chat";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ConversationUser {
  id: string;
  name: string | null;
  image: string | null;
  headline?: string | null;
}

interface Conversation {
  id: string;
  otherUser: ConversationUser;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days === 1) return "ayer";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function truncate(s: string, max = 40) {
  return s.length <= max ? s : s.slice(0, max).trimEnd() + "…";
}

/* ── Widget ───────────────────────────────────────────────────────────────── */

export function ChatWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const isClient = session?.user?.role === "CLIENT";

  /* ── Fetch conversations ─────────────────────────────────────────────── */

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data: Conversation[] = await res.json();
      setConversations(data);
      setTotalUnread(data.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchConversations();
    const iv = setInterval(fetchConversations, 10_000);
    return () => clearInterval(iv);
  }, [status, fetchConversations]);

  /* ── Don't render for unauthenticated users ──────────────────────────── */
  if (status !== "authenticated") return null;

  /* ── Active conversation name ────────────────────────────────────────── */
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <>
      {/* ── Floating bubble ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <MessageSquare className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Popup panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "min(520px, 75vh)" }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-card">
              {activeConversationId ? (
                <>
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {activeConv?.otherUser.image ? (
                      <Image
                        src={activeConv.otherUser.image}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {(activeConv?.otherUser.name ?? "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-semibold truncate">
                      {activeConv?.otherUser.name ?? "Chat"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-semibold">Mensajes</span>
                  {totalUnread > 0 && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                      {totalUnread}
                    </span>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  setActiveConversationId(null);
                }}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeConversationId ? (
                /* ── Chat view ───────────────────────────────────────── */
                <ConversationChat
                  conversationId={activeConversationId}
                  canSendFirst={isClient}
                  embedded
                />
              ) : loading ? (
                /* ── Loading ─────────────────────────────────────────── */
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Cargando...</p>
                </div>
              ) : conversations.length === 0 ? (
                /* ── Empty state ─────────────────────────────────────── */
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-medium">Sin conversaciones</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isClient
                        ? "Envía un mensaje desde el perfil de un profesional."
                        : "Tus clientes te escribirán aquí."}
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Conversation list ───────────────────────────────── */
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv) => {
                    const hasUnread = conv.unreadCount > 0;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0"
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {conv.otherUser.image ? (
                            <Image
                              src={conv.otherUser.image}
                              alt={conv.otherUser.name ?? ""}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {(conv.otherUser.name ?? "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-indigo-600 border-2 border-card" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={`text-sm truncate ${
                                hasUnread ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {conv.otherUser.name ?? "Usuario"}
                            </span>
                            {conv.lastMessage && (
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {formatRelativeTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {conv.otherUser.headline && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {conv.otherUser.headline}
                            </p>
                          )}
                          {conv.lastMessage ? (
                            <p
                              className={`text-xs truncate mt-0.5 ${
                                hasUnread
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {truncate(conv.lastMessage.content)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/50 mt-0.5 italic">
                              Sin mensajes aún
                            </p>
                          )}
                        </div>

                        {/* Unread badge */}
                        {hasUnread && (
                          <span className="flex-shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
