import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waitlistSchema } from "@/lib/validations";
import { sendWaitlistConfirmationEmail } from "@/lib/emails";
import { registerLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: share register limiter (5/hr/IP)
    const rl = await checkRateLimit(registerLimiter(), getClientIp(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { email, name, source } = parsed.data;

    // Upsert: idempotent by email
    await prisma.waitlistEntry.upsert({
      where: { email },
      update: {},
      create: { email, name: name ?? null, source: source ?? null },
    });

    // Fire-and-forget confirmation email
    void sendWaitlistConfirmationEmail({ email, name: name ?? null });

    return NextResponse.json({
      ok: true,
      message: "¡Te has unido a la lista de espera!",
    });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar tu solicitud" },
      { status: 500 }
    );
  }
}
