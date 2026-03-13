import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendBookingConfirmation } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no configurado" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Falta firma o webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Stripe Webhook] Firma inválida:", message);
    return NextResponse.json(
      { error: `Firma inválida: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data
          .object as Stripe.Checkout.Session;
        const sessionId = checkoutSession.metadata?.sessionId;

        if (!sessionId) {
          console.error("[Stripe Webhook] No sessionId in metadata");
          break;
        }

        // Update session status to CONFIRMED
        const updatedSession = await prisma.session.update({
          where: { id: sessionId },
          data: {
            status: "CONFIRMED",
            stripePaymentIntentId:
              typeof checkoutSession.payment_intent === "string"
                ? checkoutSession.payment_intent
                : checkoutSession.payment_intent?.id ?? null,
          },
          include: {
            client: { select: { name: true, email: true } },
            professional: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        });

        console.log(
          `✅ Sesión ${sessionId} confirmada (payment: ${updatedSession.stripePaymentIntentId})`
        );

        // Send confirmation email
        if (updatedSession.client.email) {
          await sendBookingConfirmation({
            to: updatedSession.client.email,
            clientName: updatedSession.client.name ?? "Cliente",
            professionalName:
              updatedSession.professional.user.name ?? "Profesional",
            date: updatedSession.scheduledAt.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            time: updatedSession.scheduledAt.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            price: updatedSession.price,
          });
        }

        break;
      }

      case "checkout.session.expired": {
        const expiredSession = event.data
          .object as Stripe.Checkout.Session;
        const sessionId = expiredSession.metadata?.sessionId;

        if (sessionId) {
          await prisma.session.update({
            where: { id: sessionId },
            data: { status: "CANCELLED" },
          });
          console.log(`❌ Sesión ${sessionId} cancelada (checkout expirado)`);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.professionalProfile.updateMany({
            where: { stripeAccountId: account.id },
            data: { verified: true },
          });
          console.log(`✅ Cuenta Connect ${account.id} verificada`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error procesando evento:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
