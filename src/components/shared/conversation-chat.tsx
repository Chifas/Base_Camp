"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
}

interface ConversationChatProps {
  conversationId: string;
  canSendFirst?: boolean;
}

export function ConversationChat({
  conversationId,
  canSendFirst = true,
}: ConversationChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUserId = session?.user?.id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?limit=50`
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? data);
    } catch {
      // silently fail polling
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message ?? data]);
        setNewMessage("");
      }
    } catch {
      // handle silently
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine whether the input should be visible
  const showInput = canSendFirst || messages.length > 0;

  // Determine the empty-state message
  const getEmptyStateText = () => {
    if (canSendFirst) {
      return "Env\u00eda el primer mensaje";
    }
    return "El cliente a\u00fan no ha iniciado la conversaci\u00f3n.";
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold">Conversaci&oacute;n</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {getEmptyStateText()}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.senderImage ? (
                    <Image
                      src={msg.senderImage}
                      alt={msg.senderName ?? "Usuario"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {(msg.senderName ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[70%] flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[11px] text-muted-foreground mb-0.5 px-1">
                    {msg.senderName ?? "Usuario"}
                  </span>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-muted/60 text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area — conditionally rendered */}
      {showInput ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-4 py-3 border-t border-border/50"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500/50"
            disabled={sending}
            maxLength={2000}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            El cliente a&uacute;n no ha iniciado la conversaci&oacute;n.
          </p>
        </div>
      )}
    </div>
  );
}
