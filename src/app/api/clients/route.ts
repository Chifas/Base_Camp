import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/clients
 *
 * Returns all clients who have ever booked a session with the authenticated
 * professional, aggregated with session counts and last session date.
 */
export async function GET() {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const profile = await prisma.professionalProfile.findUnique({
    where:  { userId: auth.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ data: [] });
  }

  const sessions = await prisma.session.findMany({
    where: { professionalId: profile.id, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const byClient = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      image: string;
      totalSessions: number;
      completedSessions: number;
      lastSessionAt: string | null;
      hasUpcoming: boolean;
    }
  >();

  for (const s of sessions) {
    const id = s.client.id;
    const existing = byClient.get(id);
    const isPast =
      s.status === "COMPLETED" ||
      s.scheduledAt.getTime() + s.duration * 60 * 1000 <= Date.now();

    if (existing) {
      existing.totalSessions += 1;
      if (s.status === "COMPLETED") existing.completedSessions += 1;
      if (!existing.hasUpcoming && !isPast && (s.status === "PENDING" || s.status === "CONFIRMED")) {
        existing.hasUpcoming = true;
      }
    } else {
      byClient.set(id, {
        id,
        name:  s.client.name ?? "Cliente",
        email: s.client.email,
        image: s.client.image ?? "",
        totalSessions: 1,
        completedSessions: s.status === "COMPLETED" ? 1 : 0,
        lastSessionAt: s.scheduledAt.toISOString(),
        hasUpcoming: !isPast && (s.status === "PENDING" || s.status === "CONFIRMED"),
      });
    }
  }

  // Fetch client notes for these clients in one query
  const clientIds = Array.from(byClient.keys());
  const notes = await prisma.clientNote.findMany({
    where:  { professionalId: profile.id, clientId: { in: clientIds } },
    select: { clientId: true, content: true, updatedAt: true },
  });
  const noteByClient = new Map(notes.map((n) => [n.clientId, { content: n.content, updatedAt: n.updatedAt.toISOString() }]));

  const data = Array.from(byClient.values())
    .map((c) => ({
      ...c,
      note: noteByClient.get(c.id) ?? null,
    }))
    .sort((a, b) => {
      // Active (with upcoming) first, then by last session desc
      if (a.hasUpcoming !== b.hasUpcoming) return a.hasUpcoming ? -1 : 1;
      return (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? "");
    });

  return NextResponse.json({ data });
}
