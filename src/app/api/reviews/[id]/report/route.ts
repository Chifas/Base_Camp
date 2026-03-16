import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportReviewSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    if (review.reported) {
      return NextResponse.json({ error: "Esta reseña ya ha sido reportada" }, { status: 409 });
    }

    await prisma.review.update({
      where: { id: params.id },
      data: {
        reported: true,
        reportReason: parsed.data.reason,
        reportedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/reviews/[id]/report]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
