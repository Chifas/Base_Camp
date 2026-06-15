import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/professionals/[id]/track-view
 *
 * Fire-and-forget endpoint hit when a visitor lands on /professional/[id].
 * Stores one row per view with optional viewer ID. Owner views are skipped
 * to avoid skewing the analytics.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);

  // Verify the professional exists and grab the owner so we can ignore
  // self-views without revealing existence in the error case.
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true },
  });
  if (!professional) {
    return NextResponse.json({ ok: true });
  }

  if (auth?.user?.id === professional.userId) {
    return NextResponse.json({ ok: true });
  }

  await prisma.profileView
    .create({
      data: {
        professionalId: professional.id,
        viewerId: auth?.user?.id ?? null,
      },
    })
    .catch(() => {
      // Don't propagate — analytics tracking should never break the page.
    });

  return NextResponse.json({ ok: true });
}
