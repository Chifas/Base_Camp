import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { resetPasswordLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

const IDENTIFIER_PREFIX = "password-reset:";

export async function POST(req: Request) {
  try {
    // Rate limit: max 10 attempts per 15min per IP
    const rl = await checkRateLimit(resetPasswordLimiter(), getClientIp(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const stored = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (
      !stored ||
      !stored.identifier.startsWith(IDENTIFIER_PREFIX) ||
      stored.expires < new Date()
    ) {
      return NextResponse.json(
        { error: "El enlace no es válido o ha caducado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const email = stored.identifier.slice(IDENTIFIER_PREFIX.length);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "El enlace no es válido o ha caducado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Single use: consume the token in the same transaction as the update
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: stored.identifier },
      }),
    ]);

    logger.info("Contraseña restablecida", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error en reset-password", { error: String(error) });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
