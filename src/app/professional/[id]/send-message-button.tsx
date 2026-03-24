"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationChat } from "@/components/shared/conversation-chat";
import { toast } from "sonner";

interface SendMessageButtonProps {
  professionalId: string;
  professionalName: string;
}

export function SendMessageButton({ professionalId, professionalName }: SendMessageButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Don't show for professionals or unauthenticated users
  if (status === "loading") return null;
  if (!session?.user || session.user.role === "PROFESSIONAL") return null;

  const handleOpenChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        toast.error(data.error || "Error al abrir conversación");
        return;
      }

      const data = await res.json();
      setConversationId(data.id);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleOpenChat}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="mr-2 h-4 w-4" />
        )}
        Enviar mensaje
      </Button>

      {/* Chat modal */}
      {conversationId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50"
          onClick={() => setConversationId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-0 sm:mx-4 w-full max-w-lg rounded-t-xl sm:rounded-xl border bg-card shadow-xl flex flex-col"
            style={{ height: "min(600px, 80vh)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-heading text-base font-semibold">
                Chat con {professionalName}
              </h3>
              <button
                onClick={() => setConversationId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationChat conversationId={conversationId} canSendFirst />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
