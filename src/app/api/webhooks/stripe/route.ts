import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingEmails, sendCancellationEmails } from "@/lib/emails";

// Must read raw body — no JSON parsing by Next.js
export const runtime = "nodejs";
export const dynamic  = "force-dynamic";

/** Shared include shape for session + user emails */
const SESSION_WITH_USERS = {
  client: { select: { name: true, email: true } },
  professional: {
    include: {
      user: { select: { name: true, email: true } },
    },
  },
} as const;

export async function POST(req: Request) {
  const body      = await req.text();
  const signature = headers().get("stripe-signature") ?? "";
  const secret    = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  // Verify the event came from Stripe
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[webhook] Invalid Stripe signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Payment succeeded: confirm session + send emails ─────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as { id: string };

        const session = await prisma.session.findFirst({
          where:   { stripePaymentIntentId: pi.id },
          include: SESSION_WITH_USERS,
        });

        if (session) {
          await prisma.session.update({
            where: { id: session.id },
            data:  { status: "CONFIRMED" },
          });
          console.log(`[webhook] Session CONFIRMED: ${session.id}`);

          // Fire-and-forget: errors are logged inside sendBookingEmails
          void sendBookingEmails({
            id:           session.id,
            scheduledAt:  session.scheduledAt,
            price:        session.price,
            client:       session.client as { name: string | null; email: string },
            professional: session.professional as {
              user: { name: string | null; email: string };
            },
          });
        }
        break;
      }

      // ── Payment failed: cancel session + notify client ───────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string };

        const session = await prisma.session.findFirst({
          where:   { stripePaymentIntentId: pi.id },
          include: SESSION_WITH_USERS,
        });

        if (session) {
          await prisma.session.update({
            where: { id: session.id },
            data:  { status: "CANCELLED" },
          });
          console.log(`[webhook] Session CANCELLED (payment failed): ${session.id}`);

          void sendCancellationEmails({
            id:           session.id,
            scheduledAt:  session.scheduledAt,
            price:        session.price,
            client:       session.client as { name: string | null; email: string },
            professional: session.professional as {
              user: { name: string | null; email: string };
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Processing error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
