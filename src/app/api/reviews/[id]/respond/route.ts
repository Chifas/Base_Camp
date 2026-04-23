import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { professionalResponseSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = professionalResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        session: {
          include: {
            professional: { select: { userId: true } },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    if (review.session.professional.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (review.professionalResponse) {
      return NextResponse.json({ error: "Ya has respondido a esta reseña" }, { status: 409 });
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        professionalResponse: parsed.data.response,
        respondedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/professional");

    return NextResponse.json({ id: updated.id, professionalResponse: updated.professionalResponse });
  } catch (error) {
    console.error("[/api/reviews/[id]/respond]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
