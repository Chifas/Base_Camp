import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOnboardingEmail } from "@/lib/emails";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/onboarding-emails
 *
 * Sends progressive onboarding emails to professionals who haven't
 * completed their profile setup. Runs daily.
 *
 * Sequence:
 *   - Day 1: Welcome + complete profile prompt
 *   - Day 3: Configure availability prompt
 *   - Day 7: Share profile + get first client
 *
 * Protected by CRON_SECRET header.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logger.error("CRON_SECRET no configurado");
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    let sent = 0;

    // Find professionals who need onboarding emails
    // onboardingEmailStep tracks which email was last sent (0 = none, 1/3/7)
    const professionals = await prisma.professionalProfile.findMany({
      where: {
        onboardingDone: false,
        onboardingEmailStep: { lt: 7 },
      },
      include: {
        user: { select: { email: true, name: true, createdAt: true } },
      },
    });

    for (const prof of professionals) {
      const daysSinceCreation = Math.floor(
        (now.getTime() - prof.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      let nextStep: 1 | 3 | 7 | null = null;

      if (prof.onboardingEmailStep === 0 && daysSinceCreation >= 1) {
        nextStep = 1;
      } else if (prof.onboardingEmailStep === 1 && daysSinceCreation >= 3) {
        nextStep = 3;
      } else if (prof.onboardingEmailStep === 3 && daysSinceCreation >= 7) {
        nextStep = 7;
      }

      if (!nextStep) continue;

      // Send the email (fire-and-forget style but we track it)
      void sendOnboardingEmail({
        email: prof.user.email,
        name: prof.user.name ?? "Profesional",
        step: nextStep,
        profileId: prof.id,
      });

      // Update the step so we don't re-send
      await prisma.professionalProfile.update({
        where: { id: prof.id },
        data: { onboardingEmailStep: nextStep },
      });

      sent++;
    }

    logger.info("Cron: onboarding emails", { processed: professionals.length, sent });

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    logger.error("Cron: error en onboarding emails", { error: String(error) });
    return NextResponse.json(
      { error: "Error procesando emails de onboarding" },
      { status: 500 }
    );
  }
}
