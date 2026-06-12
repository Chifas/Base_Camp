import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changeEmailSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

/** POST /api/users/me/email — change email (requires password confirmation).
 *  The client must sign in again afterwards: the JWT still carries the old email. */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changeEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json(
        { error: "Tu cuenta usa inicio de sesión con Google. El email no puede cambiarse aquí." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(parsed.data.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
    }

    const { newEmail } = parsed.data;
    if (newEmail === user.email) {
      return NextResponse.json({ error: "El email nuevo es igual al actual" }, { status: 400 });
    }

    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (taken) {
      // Generic error to prevent user enumeration
      return NextResponse.json(
        { error: "No se pudo actualizar el email. Inténtalo con otro." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, emailVerified: null },
    });

    logger.info("Email cambiado", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error cambiando email", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
