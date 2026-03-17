import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: max 5 registrations per hour per IP
    const rl = await checkRateLimit(registerLimiter(), getClientIp(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "PROFESSIONAL" ? "PROFESSIONAL" : "CLIENT",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
