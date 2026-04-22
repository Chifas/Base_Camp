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
  Monitor,
  MonitorOff,
  Maximize,
  RefreshCw,
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

type ConnectionStatus = "connecting" | "connected" | "error";

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authSession } = useSession();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callJoined, setCallJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Handle leaving the call with confirmation
  const handleLeave = useCallback(() => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres salir de la videollamada? La sesión seguirá activa hasta que ambos participantes se desconecten."
    );
    if (!confirmed) return;

    if (callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
    router.push(dashboardHref);
  }, [router, dashboardHref]);

  // Force leave without confirmation (used by events like "left-meeting")
  const forceLeave = useCallback(() => {
    if (callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
    router.push(dashboardHref);
  }, [router, dashboardHref]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!callRef.current) return;

    try {
      if (isScreenSharing) {
        callRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        callRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch {
      // User may have cancelled the screen share picker
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fullscreen not available
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        // Already exited
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Retry connection after error
  const handleRetry = useCallback(() => {
    if (callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
    setCallJoined(false);
    setShowRetry(false);
    setConnectionStatus("connecting");
    setError(null);
    setIsScreenSharing(false);
  }, []);

  // Join Daily.co room when URL is available
  useEffect(() => {
    if (!roomData?.url || !containerRef.current || callJoined) return;

    const userName =
      (authSession?.user as { role?: string })?.role === "PROFESSIONAL"
        ? roomData.session.professionalName
        : roomData.session.clientName;

    setConnectionStatus("connecting");

    const call = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "0",
      },
      showLeaveButton: false,
      showFullscreenButton: true,
      showParticipantsBar: true,
    });

    call.on("joined-meeting", () => {
      setConnectionStatus("connected");
      setShowRetry(false);
    });

    call.on("left-meeting", () => {
      forceLeave();
    });

    call.on("error", () => {
      setConnectionStatus("error");
      setShowRetry(true);
    });

    call.on("participant-joined", () => {
      // Could be used for notifications in the future
    });

    call.on("participant-left", () => {
      // Could be used for notifications in the future
    });

    call.join({
      url: roomData.url,
      userName: userName || "Participante",
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
  }, [roomData?.url, callJoined]);

  // Connection status indicator component
  const ConnectionIndicator = () => {
    const statusConfig: Record<
      ConnectionStatus,
      { color: string; label: string }
    > = {
      connecting: { color: "bg-yellow-500", label: "Conectando..." },
      connected: { color: "bg-green-500", label: "Conectado" },
      error: { color: "bg-red-500", label: "Error de conexión" },
    };

    const config = statusConfig[connectionStatus];

    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <span
          className={`flex h-2 w-2 rounded-full ${config.color} ${
            connectionStatus === "connecting" ? "animate-pulse" : ""
          }`}
        />
        {config.label}
      </div>
    );
  };

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

  // Error state (initial fetch error)
  if (error && !callJoined) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-4 text-sm text-zinc-400">{error}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              variant="default"
              onClick={() => {
                setLoading(true);
                setError(null);
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
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" asChild>
              <Link href={dashboardHref}>Volver al dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950"
    >
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
            <h1 className="max-w-[160px] truncate text-sm font-semibold text-white sm:max-w-none">
              Sesión con{" "}
              {(authSession?.user as { role?: string })?.role === "PROFESSIONAL"
                ? roomData?.session.clientName
                : roomData?.session.professionalName}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <ConnectionIndicator />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {roomData?.session.duration} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily.co video container */}
      <div ref={containerRef} className="flex-1 relative" />

      {/* Error overlay with retry */}
      {showRetry && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="text-center rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-xl max-w-sm mx-4">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-white">
              Error de conexión
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Se ha perdido la conexión con la videollamada. Comprueba tu
              conexión a internet e inténtalo de nuevo.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="default" onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar conexión
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href={dashboardHref}>Volver al dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="flex items-center justify-center gap-3 border-t border-zinc-800 px-4 py-3">
        {/* Screen share toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={
            isScreenSharing
              ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }
          onClick={toggleScreenShare}
          title={
            isScreenSharing
              ? "Dejar de compartir pantalla"
              : "Compartir pantalla"
          }
        >
          {isScreenSharing ? (
            <MonitorOff className="mr-2 h-4 w-4" />
          ) : (
            <Monitor className="mr-2 h-4 w-4" />
          )}
          {isScreenSharing ? "Dejar de compartir" : "Compartir pantalla"}
        </Button>

        {/* Fullscreen toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={toggleFullscreen}
          title={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          <Maximize className="mr-2 h-4 w-4" />
          {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </Button>

        {/* Leave call button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLeave}
        >
          <PhoneOff className="mr-2 h-4 w-4" />
          Salir de la llamada
        </Button>
      </div>
    </div>
  );
}
