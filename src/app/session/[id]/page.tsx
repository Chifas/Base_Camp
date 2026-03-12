"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import {
  PhoneOff,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomData {
  url: string;
  session: {
    id: string;
    professionalName: string;
    professionalImage: string;
    clientName: string;
    clientImage: string;
    scheduledAt: string;
    duration: number;
  };
}

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authSession } = useSession();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callJoined, setCallJoined] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);

  const dashboardHref =
    (authSession?.user as { role?: string })?.role === "PROFESSIONAL"
      ? "/dashboard/professional"
      : "/dashboard/client";

  // Fetch room data
  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/sessions/${params.id}/room`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo obtener la sala");
        return r.json();
      })
      .then((data: RoomData) => {
        setRoomData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  // Handle leaving the call
  const handleLeave = useCallback(() => {
    if (callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
    router.push(dashboardHref);
  }, [router, dashboardHref]);

  // Join Daily.co room when URL is available
  useEffect(() => {
    if (!roomData?.url || !containerRef.current || callJoined) return;

    const userName =
      (authSession?.user as { role?: string })?.role === "PROFESSIONAL"
        ? roomData.session.professionalName
        : roomData.session.clientName;

    const call = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "0",
      },
      showLeaveButton: true,
      showFullscreenButton: true,
      showParticipantsBar: true,
    });

    call.join({
      url: roomData.url,
      userName: userName || "Participante",
    });

    call.on("left-meeting", () => {
      handleLeave();
    });

    callRef.current = call;
    setCallJoined(true);

    return () => {
      if (callRef.current) {
        callRef.current.destroy();
        callRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.url]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-zinc-400">
            Conectando a la videollamada...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-4 text-sm text-zinc-400">{error}</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href={dashboardHref}>Volver al dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={dashboardHref}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">
              Sesión con{" "}
              {(authSession?.user as { role?: string })?.role === "PROFESSIONAL"
                ? roomData?.session.clientName
                : roomData?.session.professionalName}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              En curso
              <span className="ml-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {roomData?.session.duration} min
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLeave}
        >
          <PhoneOff className="mr-2 h-4 w-4" />
          Salir
        </Button>
      </div>

      {/* Daily.co video container */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
