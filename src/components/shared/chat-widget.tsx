"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  ChevronLeft,
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
      {/* ── Floating pill bubble ───────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-lg transition-all hover:shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <div className="relative">
              <MessageSquare className="h-4 w-4 text-teal-600" />
              {totalUnread > 0 && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
            <span>Mensajes</span>
            {totalUnread > 0 && (
              <span className="text-xs font-semibold text-teal-600">
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
            className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10 dark:border-stone-700 dark:bg-stone-900 dark:shadow-stone-950/30"
            style={{ height: "min(520px, 75vh)" }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/50">
              {activeConversationId ? (
                <>
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {activeConv?.otherUser.image ? (
                      <Image
                        src={activeConv.otherUser.image}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                        <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                          {(activeConv?.otherUser.name ?? "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
                      {activeConv?.otherUser.name ?? "Chat"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                    Mensajes
                  </span>
                  {totalUnread > 0 && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
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
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {activeConversationId ? (
                /* ── Chat view ───────────────────────────────────────── */
                <ConversationChat
                  conversationId={activeConversationId}
                  canSendFirst={isClient}
                  embedded
                />
              ) : loading ? (
                /* ── Loading ─────────────────────────────────────────── */
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-teal-600" />
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    Cargando...
                  </p>
                </div>
              ) : conversations.length === 0 ? (
                /* ── Empty state ─────────────────────────────────────── */
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800">
                    <MessageSquare className="h-6 w-6 text-stone-400 dark:text-stone-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                      Sin conversaciones
                    </p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                      {isClient
                        ? "Envía un mensaje desde el perfil de un profesional."
                        : "Tus clientes te escribirán aquí."}
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Conversation list ───────────────────────────────── */
                <div className="flex-1 divide-y divide-stone-100 overflow-y-auto dark:divide-stone-800">
                  {conversations.map((conv) => {
                    const hasUnread = conv.unreadCount > 0;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          hasUnread
                            ? "bg-teal-50/50 hover:bg-teal-50 dark:bg-teal-900/10 dark:hover:bg-teal-900/20"
                            : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                        }`}
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                              <span className="text-sm font-medium text-teal-700 dark:text-teal-400">
                                {(conv.otherUser.name ?? "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-teal-500 dark:border-stone-900" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={`truncate text-sm ${
                                hasUnread
                                  ? "font-semibold text-stone-900 dark:text-stone-50"
                                  : "font-medium text-stone-700 dark:text-stone-300"
                              }`}
                            >
                              {conv.otherUser.name ?? "Usuario"}
                            </span>
                            {conv.lastMessage && (
                              <span className="flex-shrink-0 text-[10px] text-stone-400 dark:text-stone-500">
                                {formatRelativeTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {conv.otherUser.headline && (
                            <p className="truncate text-[11px] text-stone-400 dark:text-stone-500">
                              {conv.otherUser.headline}
                            </p>
                          )}
                          {conv.lastMessage ? (
                            <p
                              className={`mt-0.5 truncate text-xs ${
                                hasUnread
                                  ? "font-medium text-stone-700 dark:text-stone-300"
                                  : "text-stone-400 dark:text-stone-500"
                              }`}
                            >
                              {truncate(conv.lastMessage.content)}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs italic text-stone-300 dark:text-stone-600">
                              Sin mensajes aún
                            </p>
                          )}
                        </div>

                        {/* Unread badge */}
                        {hasUnread && (
                          <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
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
