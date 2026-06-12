import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

/** POST /api/users/me/password — change password (requires current password). */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json(
        { error: "Tu cuenta usa inicio de sesión con Google y no tiene contraseña." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    logger.info("Contraseña cambiada", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error cambiando contraseña", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
