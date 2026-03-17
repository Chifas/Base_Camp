import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { betaFeedbackSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = betaFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { sessionId, rating, feedback } = parsed.data;

    const entry = await prisma.betaFeedback.create({
      data: {
        userId: session.user.id,
        sessionId: sessionId ?? null,
        rating,
        feedback,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el feedback" },
      { status: 500 }
    );
  }
}
