import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendBookingEmails, type EmailSessionData } from "@/lib/emails";
import { createNotifications } from "@/lib/notifications";
import { mapSubscriptionStatusToTier } from "@/lib/billing";
import type Stripe from "stripe";
import { logger } from "@/lib/logger";

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
    logger.error("Stripe webhook firma inválida", { message });
    return NextResponse.json(
      { error: `Firma inválida: ${message}` },
      { status: 400 }
    );
  }

  // Idempotency: Stripe retries deliveries; insert before processing so duplicates short-circuit
  try {
    await prisma.stripeEventLog.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    logger.info("Stripe webhook ya procesado", { eventId: event.id, type: event.type });
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data
          .object as Stripe.Checkout.Session;
        const sessionId = checkoutSession.metadata?.sessionId;

        if (!sessionId) {
          logger.error("Stripe webhook: no sessionId in metadata");
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

        logger.info("Sesión confirmada", { sessionId, paymentIntentId: updatedSession.stripePaymentIntentId });

        // Send confirmation emails to both parties (fire-and-forget)
        const emailData: EmailSessionData = {
          id: updatedSession.id,
          scheduledAt: updatedSession.scheduledAt,
          price: updatedSession.price,
          client: updatedSession.client,
          professional: updatedSession.professional,
        };
        sendBookingEmails(emailData).catch(() => {});

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
            data: { stripeConnected: true, verified: true },
          });
          logger.info("Stripe Connect account fully onboarded", { accountId: account.id });
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
          logger.info("Sesión cancelada por checkout expirado", { sessionId });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true, subscriptionTier: true, name: true, email: true },
        });
        if (!user) {
          logger.warn("Subscription event for unknown customer", { customerId });
          break;
        }

        const newTier = mapSubscriptionStatusToTier(subscription.status);
        const wasFree = user.subscriptionTier === "FREE";
        const interval = subscription.items.data[0]?.price.recurring?.interval ?? null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionTier: newTier,
            subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
            subscriptionInterval: interval,
          },
        });

        // Welcome notification when transitioning into Premium
        if (wasFree && newTier === "PREMIUM") {
          void createNotifications([
            {
              userId: user.id,
              type: "PAYMENT_RECEIVED",
              title: "¡Bienvenido a Premium!",
              message:
                subscription.status === "trialing"
                  ? "Empieza tu prueba gratuita de 7 días. Disfruta de tus beneficios Premium."
                  : "Tu suscripción Premium está activa. Disfruta de tus nuevos beneficios.",
              link: "/dashboard/client?tab=subscription",
            },
          ]);
        }

        logger.info("Subscription synced", {
          userId: user.id,
          status: subscription.status,
          tier: newTier,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: "FREE",
            subscriptionStatus: "canceled",
            subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          },
        });

        void createNotifications([
          {
            userId: user.id,
            type: "PAYMENT_RECEIVED",
            title: "Suscripción cancelada",
            message: "Tu acceso Premium continúa hasta el final del periodo de facturación.",
            link: "/dashboard/client?tab=subscription",
          },
        ]);
        logger.info("Subscription deleted", { userId: user.id });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: "past_due" },
        });

        void createNotifications([
          {
            userId: user.id,
            type: "PAYMENT_RECEIVED",
            title: "Pago fallido",
            message: "No pudimos cobrar tu suscripción. Actualiza tu método de pago para no perder Premium.",
            link: "/dashboard/client?tab=subscription",
          },
        ]);
        logger.warn("Subscription payment failed", { userId: user.id });
        break;
      }

      case "invoice.payment_succeeded": {
        // Stripe sends its own receipt — log only
        const invoice = event.data.object as Stripe.Invoice;
        logger.info("Invoice paid", { invoiceId: invoice.id, amount: invoice.amount_paid });
        break;
      }

      default:
        logger.info("Stripe webhook evento no manejado", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook error procesando evento", { error: String(error) });
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
