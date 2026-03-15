import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/payments/create-intent
// Creates a DB Session + Stripe PaymentIntent and returns the client secret
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { professionalId, scheduledAt, duration = 60, notes } = await req.json();

    if (!professionalId || !scheduledAt) {
      return NextResponse.json(
        { error: "professionalId y scheduledAt son obligatorios" },
        { status: 400 }
      );
    }

    // Fetch professional profile to get price and verify it exists
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: {
        hourlyRate: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Prevent booking yourself
    if (profile.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes reservar una sesión contigo mismo" },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const conflict = await prisma.session.findFirst({
      where: {
        professionalId,
        scheduledAt: new Date(scheduledAt),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible" },
        { status: 409 }
      );
    }

    const amountCents = Math.round(profile.hourlyRate * 100);

    // Create the session in DB (status PENDING until payment succeeds)
    const dbSession = await prisma.session.create({
      data: {
        clientId: session.user.id,
        professionalId,
        scheduledAt: new Date(scheduledAt),
        duration,
        price: profile.hourlyRate,
        status: "PENDING",
      },
    });

    // Create Stripe PaymentIntent
    if (!stripe) {
      return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      metadata: {
        sessionId: dbSession.id,
        professionalId,
        clientId: session.user.id,
        notes: notes ?? "",
      },
      description: `Sesión con ${profile.user.name ?? "profesional"} — GuidePath`,
    });

    // Persist the PaymentIntent ID on the session
    await prisma.session.update({
      where: { id: dbSession.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      sessionId: dbSession.id,
      amount: profile.hourlyRate,
    });
  } catch (err) {
    console.error("[create-intent]", err);
    return NextResponse.json(
      { error: "Error al crear el pago" },
      { status: 500 }
    );
  }
}
