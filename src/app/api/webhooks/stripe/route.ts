import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendBookingEmails, type EmailSessionData } from "@/lib/emails";
import { createNotifications } from "@/lib/notifications";
import type Stripe from "stripe";
import { log } from "@/lib/logger";

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
    log.error("Stripe webhook firma inválida", { message });
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
          log.error("Stripe webhook: no sessionId in metadata");
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
            client: { select: { id: true, name: true, email: true } },
            professional: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });

        log.info("Sesión confirmada", { sessionId, paymentIntentId: updatedSession.stripePaymentIntentId });

        // Send confirmation emails to both parties (fire-and-forget)
        sendBookingEmails(updatedSession as unknown as EmailSessionData).catch(() => {});

        // In-app notifications for both parties
        void createNotifications([
          {
            userId: updatedSession.clientId,
            type: "SESSION_CONFIRMED",
            title: "Sesión confirmada",
            message: `Tu sesión con ${updatedSession.professional.user.name ?? "tu profesional"} ha sido confirmada.`,
            link: "/dashboard/client",
          },
          {
            userId: updatedSession.professional.userId,
            type: "SESSION_CONFIRMED",
            title: "Nueva sesión confirmada",
            message: `Tienes una nueva sesión con ${updatedSession.client.name ?? "un cliente"}.`,
            link: "/dashboard/professional",
          },
        ]);

        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.professionalProfile.updateMany({
            where: { stripeAccountId: account.id },
            data: { stripeConnected: true },
          });
          log.info("Stripe Connect account fully onboarded", { accountId: account.id });
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
          log.info("Sesión cancelada por checkout expirado", { sessionId });
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
          log.info("stripe.connect_verified", { accountId: account.id });
        }
        break;
      }

      default:
        log.info("Stripe webhook evento no manejado", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error("Stripe webhook error procesando evento", { error: String(error) });
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
