import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
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

    const duration = 60; // minutes
    const sessionEnd = new Date(scheduledAt.getTime() + duration * 60_000);

    // Check if the date is blocked (vacation, personal, etc.)
    const startOfDay = new Date(scheduledAt);
    startOfDay.setHours(0, 0, 0, 0);
    const blocked = await prisma.blockedDate.findUnique({
      where: {
        professionalId_date: {
          professionalId: professional.id,
          date: startOfDay,
        },
      },
    });

    if (blocked) {
      return NextResponse.json(
        { error: "El profesional no está disponible en esta fecha" },
        { status: 409 }
      );
    }

    // Check for overlapping sessions (duration-aware)
    const conflict = await prisma.session.findFirst({
      where: {
        professionalId: professional.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        // Overlap: existing session starts before new one ends
        //          AND existing session ends after new one starts
        scheduledAt: { lt: sessionEnd },
        AND: {
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - duration * 60_000),
          },
        },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible" },
        { status: 409 }
      );
    }

    // Create session in DB
    const dbSession = await prisma.session.create({
      data: {
        clientId: session.user.id,
        professionalId: professional.id,
        scheduledAt,
        duration,
        status: "PENDING",
        price: professional.hourlyRate,
      },
    });

    // Create Stripe Checkout Session
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";

    // Platform commission: 20%
    const PLATFORM_FEE_PERCENT = 20;
    const unitAmount = Math.round(professional.hourlyRate * 100); // cents
    const applicationFee = Math.round(unitAmount * (PLATFORM_FEE_PERCENT / 100));

    // Build checkout options
    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
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
            unit_amount: unitAmount,
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
    };

    // Use Stripe Connect if professional has a connected account
    if (professional.stripeAccountId) {
      checkoutOptions.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: professional.stripeAccountId,
        },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutOptions);

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
