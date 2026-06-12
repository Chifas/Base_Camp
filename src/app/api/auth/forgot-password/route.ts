import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { forgotPasswordLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/emails";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const IDENTIFIER_PREFIX = "password-reset:";

export async function POST(req: Request) {
  try {
    // Rate limit: max 3 requests per 15min per IP (each one sends an email)
    const rl = await checkRateLimit(forgotPasswordLimiter(), getClientIp(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Only credentials accounts have a password to reset (OAuth users don't).
    // The response is identical either way to prevent user enumeration.
    if (user?.password) {
      // Store only the SHA-256 hash — a DB leak must not expose usable reset links
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      await prisma.$transaction([
        prisma.verificationToken.deleteMany({
          where: { identifier: `${IDENTIFIER_PREFIX}${email}` },
        }),
        prisma.verificationToken.create({
          data: {
            identifier: `${IDENTIFIER_PREFIX}${email}`,
            token: hashedToken,
            expires: new Date(Date.now() + TOKEN_TTL_MS),
          },
        }),
      ]);

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXTAUTH_URL ??
        "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      await sendPasswordResetEmail({ email, name: user.name, resetUrl });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error en forgot-password", { error: String(error) });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
