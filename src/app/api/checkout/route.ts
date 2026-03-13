import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { professionalId, date, time, notes } = body;

    if (!professionalId || !date || !time) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Find professional
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: { user: { select: { name: true } } },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Build scheduled date
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    // Create session in DB
    const dbSession = await prisma.session.create({
      data: {
        clientId: session.user.id,
        professionalId: professional.id,
        scheduledAt,
        duration: 60,
        status: "PENDING",
        price: professional.hourlyRate,
      },
    });

    // Create Stripe Checkout Session
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Sesión con ${professional.user.name}`,
              description: `60 minutos — ${new Date(scheduledAt).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })} a las ${time}`,
            },
            unit_amount: Math.round(professional.hourlyRate * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        sessionId: dbSession.id,
        clientId: session.user.id,
        professionalId: professional.id,
        notes: notes || "",
      },
      success_url: `${baseUrl}/book/confirmed?session_id=${dbSession.id}`,
      cancel_url: `${baseUrl}/explore`,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: dbSession.id,
    });
  } catch (error) {
    console.error("[/api/checkout]", error);
    return NextResponse.json(
      { error: "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}
