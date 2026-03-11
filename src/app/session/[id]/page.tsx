"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic, MicOff, VideoIcon, VideoOff, PhoneOff,
  Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyCall } from "@daily-co/daily-js";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionData {
  id:           string;
  status:       string;
  scheduledAt:  string;
  dailyRoomUrl: string | null;
  role:         "client" | "professional";
  professional: {
    user: { id: string; name: string | null; image: string | null };
  };
  client: { id: string; name: string | null; image: string | null };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  const m   = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ── Skeleton shown while loading session data ─────────────────────────────────

function SessionSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <Skeleton className="h-5 w-5 bg-zinc-800" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-48 bg-zinc-800" />
          <Skeleton className="h-3 w-24 bg-zinc-800" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-zinc-900">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-600" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VideoSessionPage() {
  const params    = useParams();
  const router    = useRouter();
  const sessionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef      = useRef<DailyCall | null>(null);

  // State
  const [sessionData, setSessionData]   = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingRoom, setLoadingRoom]   = useState(false);
  const [joined, setJoined]             = useState(false);
  const [error, setError]               = useState("");
  const [isMuted, setIsMuted]           = useState(false);
  const [isVideoOn, setIsVideoOn]       = useState(true);
  const [elapsed, setElapsed]           = useState(0);

  // ── 1. Fetch session data ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar la sesión");
        return r.json();
      })
      .then(setSessionData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingSession(false));
  }, [sessionId]);

  // ── 2. Join Daily room once session is confirmed ───────────────────────────
  useEffect(() => {
    if (!sessionData || sessionData.status !== "CONFIRMED") return;
    if (!containerRef.current) return;

    let destroyed = false;

    async function join() {
      setLoadingRoom(true);
      try {
        // Get or create the Daily room
        const res = await fetch("/api/daily/create-room", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo crear la sala");
        const { roomUrl } = data as { roomUrl: string };

        if (destroyed) return;

        // Dynamically import Daily to keep it out of the initial bundle
        const DailyIframe = (await import("@daily-co/daily-js")).default;

        const call = DailyIframe.createFrame(containerRef.current!, {
          url:                  roomUrl,
          showLeaveButton:      false,
          showFullscreenButton: true,
          iframeStyle: {
            width:        "100%",
            height:       "100%",
            border:       "none",
            borderRadius: "0",
          },
        });

        callRef.current = call;

        call
          .on("joined-meeting", () => {
            setJoined(true);
            setLoadingRoom(false);
          })
          .on("left-meeting", () => setJoined(false))
          .on("error",        () => {
            setError("Error de conexión en la videollamada");
            setLoadingRoom(false);
          });

        await call.join({ url: roomUrl });
      } catch (err: unknown) {
        if (!destroyed) {
          setError((err as Error).message);
          setLoadingRoom(false);
        }
      }
    }

    join();

    // Cleanup: leave and destroy call on unmount
    return () => {
      destroyed = true;
      if (callRef.current) {
        callRef.current
          .leave()
          .catch(() => {/* ignore errors on unmount */})
          .finally(() => {
            callRef.current?.destroy();
            callRef.current = null;
          });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  // ── 3. Elapsed time counter ────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [joined]);

  // ── Controls ───────────────────────────────────────────────────────────────

  function toggleMic() {
    const nowMuted = !isMuted;
    callRef.current?.setLocalAudio(!nowMuted); // true = mic on
    setIsMuted(nowMuted);
  }

  function toggleVideo() {
    const nowOn = !isVideoOn;
    callRef.current?.setLocalVideo(nowOn);
    setIsVideoOn(nowOn);
  }

  async function hangUp() {
    try {
      if (callRef.current) {
        await callRef.current.leave();
        callRef.current.destroy();
        callRef.current = null;
      }
    } catch {
      // ignore errors while leaving
    }
    router.push(
      sessionData?.role === "professional"
        ? "/dashboard/professional"
        : "/dashboard/client"
    );
  }

  // ── Render guards ──────────────────────────────────────────────────────────

  if (loadingSession) return <SessionSkeleton />;

  if (error || !sessionData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-zinc-950">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-zinc-300">{error || "Sesión no encontrada"}</p>
        <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
          <Link href="/dashboard/client">Volver al panel</Link>
        </Button>
      </div>
    );
  }

  if (sessionData.status !== "CONFIRMED") {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-zinc-950">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <p className="text-zinc-300">
          Esta sesión no está disponible para videollamada.
        </p>
        <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
          <Link href={`/dashboard/${sessionData.role}`}>Volver al panel</Link>
        </Button>
      </div>
    );
  }

  const otherName =
    sessionData.role === "client"
      ? sessionData.professional.user.name
      : sessionData.client.name;

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${sessionData.role}`}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Volver al panel"
          >
            ←
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">
              Sesión con {otherName ?? "—"}
            </h1>
            <div className="flex items-center gap-2 text-xs">
              {loadingRoom && (
                <span className="flex items-center gap-1 text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Conectando…
                </span>
              )}
              {joined && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  En curso · {formatElapsed(elapsed)}
                </span>
              )}
              {!loadingRoom && !joined && (
                <span className="text-zinc-600">En espera…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Video area ────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden bg-zinc-900">
        {/* Loading overlay */}
        {loadingRoom && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900">
            <Loader2 className="h-12 w-12 animate-spin text-zinc-600" />
            <p className="mt-4 text-sm text-zinc-500">Preparando la sala…</p>
          </div>
        )}

        {/* Daily.co iframe is mounted here */}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* ── Controls bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 border-t border-zinc-800 bg-zinc-950 px-4 py-4">
        {/* Mic toggle */}
        <Button
          variant="ghost"
          size="icon"
          title={isMuted ? "Activar micrófono" : "Silenciar"}
          className={`h-12 w-12 rounded-full transition-colors ${
            isMuted
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
          onClick={toggleMic}
          disabled={!joined}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* Camera toggle */}
        <Button
          variant="ghost"
          size="icon"
          title={isVideoOn ? "Apagar cámara" : "Activar cámara"}
          className={`h-12 w-12 rounded-full transition-colors ${
            !isVideoOn
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
          onClick={toggleVideo}
          disabled={!joined}
        >
          {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        {/* Hang up */}
        <Button
          variant="ghost"
          size="icon"
          title="Finalizar sesión"
          className="h-12 w-12 rounded-full bg-red-600 text-white hover:bg-red-700"
          onClick={hangUp}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
