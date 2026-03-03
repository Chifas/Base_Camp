"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Maximize2,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoSessionPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/client"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">
              Sesión con Dra. Elena Martínez
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              En curso
              <span className="ml-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                45:12
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="relative flex-1">
          {/* Remote video (placeholder) */}
          <div className="flex h-full items-center justify-center bg-zinc-900">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800">
                <span className="font-heading text-3xl font-bold text-zinc-500">
                  EM
                </span>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Dra. Elena Martínez
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                La videollamada se conectará automáticamente con Daily.co
              </p>
            </div>
          </div>

          {/* Local video (picture-in-picture) */}
          <motion.div
            drag
            dragMomentum={false}
            className="absolute bottom-4 right-4 h-36 w-48 cursor-move overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-800 shadow-lg"
          >
            <div className="flex h-full items-center justify-center">
              {isVideoOn ? (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                    <span className="font-heading text-lg font-bold text-zinc-400">
                      TÚ
                    </span>
                  </div>
                </div>
              ) : (
                <VideoOff className="h-8 w-8 text-zinc-600" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Chat sidebar */}
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-zinc-800 bg-zinc-900"
          >
            <div className="border-b border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-white">
                Chat de sesión
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="rounded-lg bg-zinc-800 p-3">
                <p className="text-xs font-medium text-primary">
                  Dra. Elena Martínez
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Bienvenido/a a la sesión. ¿Cómo te encuentras hoy?
                </p>
                <p className="mt-1 text-xs text-zinc-600">10:02</p>
              </div>
              <div className="ml-8 rounded-lg bg-primary/20 p-3">
                <p className="text-xs font-medium text-primary">Tú</p>
                <p className="mt-1 text-sm text-zinc-300">
                  Hola Elena, hoy estoy mejor que la semana pasada. He intentado aplicar lo que hablamos.
                </p>
                <p className="mt-1 text-xs text-zinc-600">10:03</p>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm">Enviar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-4 border-t border-zinc-800 px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          className={`h-12 w-12 rounded-full ${
            isMuted
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-12 w-12 rounded-full ${
            !isVideoOn
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? (
            <VideoIcon className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-red-600 text-white hover:bg-red-700"
          asChild
        >
          <Link href="/dashboard/client">
            <PhoneOff className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
