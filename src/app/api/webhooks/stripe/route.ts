import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Must read raw body — no JSON parsing by Next.js
export const runtime = "nodejs";
export const dynamic  = "force-dynamic";

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
      case "payment_intent.succeeded": {
        const pi = event.data.object as { id: string };
        // Confirm the session once payment succeeds
        await prisma.session.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data:  { status: "CONFIRMED" },
        });
        console.log(`[webhook] Session CONFIRMED for PI ${pi.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string };
        // Cancel the session if payment fails definitively
        await prisma.session.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data:  { status: "CANCELLED" },
        });
        console.log(`[webhook] Session CANCELLED for PI ${pi.id}`);
        break;
      }

      default:
        // Ignore other events
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
