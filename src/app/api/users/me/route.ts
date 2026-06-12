import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, deleteAccountSchema } from "@/lib/validations";
import { stripHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

/** GET /api/users/me — account data for the settings page. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true, image: true, role: true, password: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    bio: user.bio,
    image: user.image,
    role: user.role,
    // OAuth-only accounts have no password — the UI hides password fields
    hasPassword: !!user.password,
  });
}

/** PUT /api/users/me — update name and bio. */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const name = stripHtml(parsed.data.name);
    const bio = parsed.data.bio !== undefined ? stripHtml(parsed.data.bio) : undefined;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, ...(bio !== undefined ? { bio } : {}) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error actualizando perfil", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/me — delete (anonymize) the current client account.
 *
 * Sessions and reviews reference the user with restrictive FKs and feed
 * professional stats, so instead of a hard delete we anonymize the user
 * and remove all personal data and credentials (GDPR-compliant erasure).
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Las cuentas de profesional no pueden eliminarse desde aquí. Contacta con soporte." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Error de validación" }, { status: 400 });
    }

    // Credentials accounts must confirm with their password
    if (user.password) {
      const password = parsed.data.password ?? "";
      const valid = password && (await bcrypt.compare(password, user.password));
      if (!valid) {
        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
      }
    }

    const now = new Date();
    await prisma.$transaction([
      // Cancel any upcoming sessions so professionals aren't left waiting
      prisma.session.updateMany({
        where: {
          clientId: user.id,
          status: { in: ["PENDING", "CONFIRMED"] },
          scheduledAt: { gt: now },
        },
        data: { status: "CANCELLED", cancelledAt: now, cancelledBy: user.id },
      }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.authSession.deleteMany({ where: { userId: user.id } }),
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.favorite.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.deleteMany({
        where: { identifier: { contains: user.email } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: "Usuario eliminado",
          email: `deleted-${user.id}@guidepath.invalid`,
          password: null,
          image: null,
          bio: null,
          emailVerified: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionStatus: null,
        },
      }),
    ]);

    logger.info("Cuenta de cliente eliminada (anonimizada)", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error eliminando cuenta", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
