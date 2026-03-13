import { env } from "./env";

interface DailyRoom {
  url: string;
  name: string;
}

/**
 * Creates a Daily.co room for a GuidePath session.
 * The room auto-expires after the session ends + 30 min buffer.
 */
export async function createDailyRoom(
  sessionId: string,
  expiresAt: Date
): Promise<DailyRoom> {
  const apiKey = env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error("DAILY_API_KEY no está configurada");
  }

  const roomName = `guidepath-${sessionId.slice(-8)}`;
  const exp = Math.floor(expiresAt.getTime() / 1000) + 30 * 60; // +30 min buffer

  const response = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "public", // anyone with the link can join
      properties: {
        exp,
        enable_chat: true,
        enable_screenshare: true,
        enable_knocking: false,
        start_video_off: false,
        start_audio_off: false,
        lang: "es",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Daily.co] Error creating room:", error);

    // If room already exists, return the existing URL
    if (response.status === 400 && error.includes("already exists")) {
      return {
        url: `https://${process.env.DAILY_DOMAIN || "guidepath"}.daily.co/${roomName}`,
        name: roomName,
      };
    }

    throw new Error(`Error al crear sala Daily.co: ${response.status}`);
  }

  const data = await response.json();
  return {
    url: data.url,
    name: data.name,
  };
}
