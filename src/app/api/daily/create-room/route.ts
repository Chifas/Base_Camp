import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAILY_API = "https://api.daily.co/v1";

// POST /api/daily/create-room
// Idempotent: returns an existing room URL if already created for this session,
// otherwise calls the Daily.co API to create a private room and persists the URL.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId es obligatorio" }, { status: 400 });
    }

    const dbSession = await prisma.session.findUnique({
      where:   { id: sessionId },
      include: { professional: true },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    // Only confirmed sessions can start a video call
    if (dbSession.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "La sesión no está confirmada" },
        { status: 403 }
      );
    }

    // Verify the requesting user is a participant
    const isClient       = dbSession.clientId === session.user.id;
    const isProfessional = dbSession.professional.userId === session.user.id;
    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Return existing room URL if already created (idempotent)
    if (dbSession.dailyRoomUrl) {
      return NextResponse.json({ roomUrl: dbSession.dailyRoomUrl });
    }

    const apiKey = process.env.DAILY_API_KEY;
    if (!apiKey || apiKey === "your-daily-api-key") {
      return NextResponse.json(
        { error: "Daily.co API key no configurada" },
        { status: 503 }
      );
    }

    // Room name: "gp-" + first 20 chars of session CUID (Daily name limit: 255 chars)
    const roomName = `gp-${sessionId.slice(0, 20)}`;

    // Expiry: 4 hours after the scheduled start time, but always in the future.
    // Using Math.max ensures rooms can still be created even for sessions whose
    // scheduled time has already passed (e.g. during development/testing).
    const scheduledSec = new Date(dbSession.scheduledAt).getTime() / 1000;
    const exp = Math.floor(Math.max(scheduledSec, Date.now() / 1000) + 4 * 60 * 60);

    // Create room via Daily REST API
    const dailyRes = await fetch(`${DAILY_API}/rooms`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name:       roomName,
        privacy:    "private",
        properties: {
          exp,
          max_participants:    2,
          enable_chat:         true,
          enable_screenshare:  false,
          start_video_off:     false,
          start_audio_off:     false,
          lang:                "es",
        },
      }),
    });

    let roomUrl: string;

    if (dailyRes.ok) {
      const body = await dailyRes.json();
      roomUrl = body.url as string;
    } else {
      const errBody = await dailyRes.json();

      // If the room already exists (race condition), fetch it instead
      if (
        dailyRes.status === 400 &&
        typeof errBody.info === "string" &&
        errBody.info.includes("already exists")
      ) {
        const getRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!getRes.ok) throw new Error("Could not fetch existing Daily room");
        const existing = await getRes.json();
        roomUrl = existing.url as string;
      } else {
        console.error("[daily/create-room] Daily API error:", errBody);
        return NextResponse.json(
          { error: "Error al crear la sala de videollamada" },
          { status: 502 }
        );
      }
    }

    // Persist the room URL so subsequent calls are instant
    await prisma.session.update({
      where: { id: sessionId },
      data:  { dailyRoomUrl: roomUrl },
    });

    return NextResponse.json({ roomUrl });
  } catch (err) {
    console.error("[daily/create-room]", err);
    return NextResponse.json(
      { error: "Error interno al preparar la sala" },
      { status: 500 }
    );
  }
}
