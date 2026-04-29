import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { stripHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";
import { registerLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: max 5 registrations per hour per IP
    const rl = await checkRateLimit(registerLimiter(), getClientIp(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { name: rawName, email, password, role } = parsed.data;
    const name = stripHtml(rawName);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Generic error to prevent user enumeration
      return NextResponse.json(
        { error: "No se pudo crear la cuenta. Inténtalo de nuevo." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role === "PROFESSIONAL" ? "PROFESSIONAL" : "CLIENT",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error en registro", { error: String(error) });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
