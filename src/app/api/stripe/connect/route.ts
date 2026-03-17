import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

// POST /api/stripe/connect — create Stripe Connect account + onboarding link
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    let accountId = profile.stripeAccountId;

    // Create connected account if it doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "ES",
        email: profile.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: profile.user.name ?? undefined,
          product_description: "Sesiones de mentoría y coaching profesional",
        },
      });

      accountId = account.id;

      await prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Generate onboarding link
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard/professional?stripe=refresh`,
      return_url: `${baseUrl}/dashboard/professional?stripe=success`,
      type: "account_onboarding",
    });

    revalidatePath("/dashboard/professional");

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("[/api/stripe/connect]", error);
    return NextResponse.json(
      { error: "Error al configurar cuenta de cobros" },
      { status: 500 }
    );
  }
}

// GET /api/stripe/connect — check onboarding status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.stripeAccountId) {
      return NextResponse.json({ connected: false, onboarded: false });
    }

    const account = await stripe.accounts.retrieve(profile.stripeAccountId);

    return NextResponse.json({
      connected: true,
      onboarded: account.charges_enabled && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (error) {
    console.error("[/api/stripe/connect GET]", error);
    return NextResponse.json(
      { error: "Error al verificar estado de cuenta" },
      { status: 500 }
    );
  }
}
