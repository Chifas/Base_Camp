import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/messages/unread — get total unread message count for user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Find all sessions where user is participant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, professionalProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const sessionFilter = user.role === "PROFESSIONAL" && user.professionalProfile
      ? { professionalId: user.professionalProfile.id }
      : { clientId: session.user.id };

    const unreadCount = await prisma.message.count({
      where: {
        session: sessionFilter,
        userId: { not: session.user.id },
        read: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
