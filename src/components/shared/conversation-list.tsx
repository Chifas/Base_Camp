"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, MessageSquare } from "lucide-react";

interface ConversationUser {
  id: string;
  name: string | null;
  image: string | null;
  headline: string | null;
}

interface Conversation {
  id: string;
  otherUser: ConversationUser;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface ConversationListProps {
  onSelectConversation: (_id: string) => void;
  selectedId?: string | null;
}

export function ConversationList({
  onSelectConversation,
  selectedId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? data);
    } catch {
      // silently fail polling
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "ahora";
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return "ayer";
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const truncateMessage = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "...";
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Cargando conversaciones...
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 h-[600px]">
        <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          No tienes conversaciones todav&iacute;a
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold">Mensajes</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {conversations.length} conversaci&oacute;n
          {conversations.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const isSelected = selectedId === conv.id;
          const hasUnread = conv.unreadCount > 0;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                isSelected
                  ? "bg-indigo-50 dark:bg-indigo-950/30 border-l-2 border-indigo-500"
                  : "border-l-2 border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                {conv.otherUser.image ? (
                  <Image
                    src={conv.otherUser.image}
                    alt={conv.otherUser.name ?? "Usuario"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {(conv.otherUser.name ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Unread indicator dot */}
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white dark:border-zinc-900" />
                )}
              </div>

              {/* Content */}
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
                    {truncateMessage(conv.lastMessage.content)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 mt-0.5 italic">
                    Sin mensajes a&uacute;n
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
