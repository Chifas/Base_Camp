import { PrismaClient, ProfessionalCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@guidepath.dev" },
    update: {},
    create: {
      name: "María López",
      email: "cliente@guidepath.dev",
      password: await bcrypt.hash("password123", 12),
      role: "CLIENT",
    },
  });

  const professionalUser = await prisma.user.upsert({
    where: { email: "profesional@guidepath.dev" },
    update: {},
    create: {
      name: "Dra. Elena Martínez",
      email: "profesional@guidepath.dev",
      password: await bcrypt.hash("password123", 12),
      role: "PROFESSIONAL",
      bio: "Psicóloga organizacional con más de 15 años acompañando a profesionales en entornos de alta exigencia. Especializada en burnout, estrés laboral y bienestar en el trabajo.",
    },
  });

  // ── Professional Profile ──────────────────────────────────────────────────
  const profile = await prisma.professionalProfile.upsert({
    where: { userId: professionalUser.id },
    update: {},
    create: {
      userId: professionalUser.id,
      category: ProfessionalCategory.WORK_PSYCHOLOGIST,
      headline: "Psicóloga Organizacional · Burnout y Bienestar Laboral",
      hourlyRate: 65,
      rating: 4.9,
      reviewCount: 127,
      verified: true,
    },
  });

  // ── Availability ──────────────────────────────────────────────────────────
  const availabilityData = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "14:00" }, // Monday
    { dayOfWeek: 2, startTime: "09:00", endTime: "14:00" }, // Tuesday
    { dayOfWeek: 3, startTime: "09:00", endTime: "14:00" }, // Wednesday
    { dayOfWeek: 4, startTime: "09:00", endTime: "14:00" }, // Thursday
    { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" }, // Friday
  ];

  for (const slot of availabilityData) {
    await prisma.availability.upsert({
      where: {
        id: `avail-${profile.id}-${slot.dayOfWeek}`,
      },
      update: {},
      create: {
        id: `avail-${profile.id}-${slot.dayOfWeek}`,
        professionalId: profile.id,
        ...slot,
      },
    });
  }

  console.log("✅ Seed completed:");
  console.log(`   👤 Client:       cliente@guidepath.dev / password123`);
  console.log(`   👤 Professional: profesional@guidepath.dev / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
