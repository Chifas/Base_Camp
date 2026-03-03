import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AvailablePricesResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const professionalId = params.id;

  // Verify the professional exists
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { id: true },
  });

  if (!professional) {
    return NextResponse.json(
      { error: "Profesional no encontrado" },
      { status: 404 }
    );
  }

  // Resolve authenticated user context
  const session = await getServerSession(authOptions);

  let completedBookingsCount = 0;
  let isStudent = false;
  let userId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isStudent: true },
    });

    if (user) {
      userId = user.id;
      isStudent = user.isStudent;

      completedBookingsCount = await prisma.session.count({
        where: {
          clientId: user.id,
          professionalId,
          status: "COMPLETED",
        },
      });
    }
  }

  // Fetch all active price rules for this professional
  const allRules = await prisma.priceRule.findMany({
    where: { professionalId, active: true },
    orderBy: { price: "asc" },
  });

  // Filter rules to those applicable to this user
  const applicableRules = allRules.filter((rule) => {
    // Student-only rules require verified student status
    if (rule.requiresStudent && !isStudent) return false;

    // maxPreviousBookings=null means no restriction
    // maxPreviousBookings=0  means "only if 0 previous sessions" (first-session rule)
    // maxPreviousBookings=N  means "only if ≤ N previous sessions"
    if (rule.maxPreviousBookings !== null) {
      if (completedBookingsCount > rule.maxPreviousBookings) return false;
    }

    return true;
  });

  const response: AvailablePricesResponse = {
    prices: applicableRules.map((r) => ({
      id: r.id,
      professionalId: r.professionalId,
      name: r.name,
      description: r.description,
      price: r.price,
      maxPreviousBookings: r.maxPreviousBookings,
      requiresStudent: r.requiresStudent,
      active: r.active,
    })),
    context: {
      isAuthenticated: !!userId,
      isStudent,
      completedBookingsCount,
      isFirstSession: completedBookingsCount === 0,
    },
  };

  return NextResponse.json(response);
}
