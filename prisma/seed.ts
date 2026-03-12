import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean slate ──────────────────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("guidepath123", 10);

  // ── Test client ──────────────────────────────────────────────────────────
  const clientUser = await prisma.user.create({
    data: {
      name: "Ana López",
      email: "cliente@guidepath.com",
      password: hashedPassword,
      role: "CLIENT",
      bio: "Buscando orientación profesional y personal.",
    },
  });
  console.log("✅ Client user:", clientUser.email);

  // ── Professional users + profiles ────────────────────────────────────────
  const profData = [
    {
      user: {
        name: "Dra. Elena Martínez",
        email: "elena@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
        bio: "Psicóloga clínica con más de 15 años de experiencia en terapia cognitivo-conductual.",
      },
      profile: {
        category: "PSYCHOLOGIST" as const,
        headline: "Psicóloga Clínica · Terapia Cognitivo-Conductual",
        hourlyRate: 65,
        rating: 4.9,
        reviewCount: 127,
        verified: true,
      },
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "14:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "14:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "14:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
      ],
    },
    {
      user: {
        name: "Carlos Ruiz Pérez",
        email: "carlos@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        bio: "Coach de vida certificado por ICF. Ayudo a profesionales a encontrar su propósito y superar bloqueos.",
      },
      profile: {
        category: "COACH" as const,
        headline: "Coach de Vida Certificado ICF · Propósito y Bienestar",
        hourlyRate: 55,
        rating: 4.8,
        reviewCount: 89,
        verified: true,
      },
      availability: [
        { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 5, startTime: "10:00", endTime: "16:00" },
      ],
    },
    {
      user: {
        name: "Ana García López",
        email: "ana.garcia@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        bio: "Mentora de carrera con experiencia en RRHH en empresas del IBEX 35.",
      },
      profile: {
        category: "CAREER_MENTOR" as const,
        headline: "Mentora de Carrera · Ex-RRHH IBEX 35",
        hourlyRate: 70,
        rating: 4.7,
        reviewCount: 64,
        verified: true,
      },
      availability: [
        { dayOfWeek: 2, startTime: "16:00", endTime: "20:00" },
        { dayOfWeek: 4, startTime: "16:00", endTime: "20:00" },
      ],
    },
    {
      user: {
        name: "Dr. Miguel Fernández",
        email: "miguel@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
        bio: "Nutricionista clínico especializado en nutrición basada en evidencia científica.",
      },
      profile: {
        category: "NUTRITIONIST" as const,
        headline: "Nutricionista Clínico · Nutrición Basada en Evidencia",
        hourlyRate: 50,
        rating: 4.9,
        reviewCount: 102,
        verified: true,
      },
      availability: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "14:00" },
        { dayOfWeek: 2, startTime: "08:00", endTime: "14:00" },
        { dayOfWeek: 4, startTime: "08:00", endTime: "14:00" },
        { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" },
      ],
    },
    {
      user: {
        name: "Laura Sánchez Vega",
        email: "laura@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
        bio: "Coach ejecutiva con MBA y 12 años en consultoría estratégica. Especializada en liderazgo y desarrollo directivo.",
      },
      profile: {
        category: "COACH" as const,
        headline: "Coach Ejecutiva · Liderazgo y Desarrollo Directivo",
        hourlyRate: 90,
        rating: 4.8,
        reviewCount: 73,
        verified: true,
      },
      availability: [
        { dayOfWeek: 1, startTime: "07:00", endTime: "09:00" },
        { dayOfWeek: 2, startTime: "07:00", endTime: "09:00" },
        { dayOfWeek: 3, startTime: "07:00", endTime: "09:00" },
        { dayOfWeek: 4, startTime: "07:00", endTime: "09:00" },
        { dayOfWeek: 5, startTime: "07:00", endTime: "09:00" },
      ],
    },
    {
      user: {
        name: "Javier Moreno Torres",
        email: "javier@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        bio: "Psicólogo especializado en ansiedad, trauma y bienestar emocional. Enfoque integrativo.",
      },
      profile: {
        category: "PSYCHOLOGIST" as const,
        headline: "Psicólogo · Ansiedad, Trauma y Bienestar Emocional",
        hourlyRate: 60,
        rating: 4.6,
        reviewCount: 41,
        verified: false,
      },
      availability: [
        { dayOfWeek: 2, startTime: "17:00", endTime: "21:00" },
        { dayOfWeek: 4, startTime: "17:00", endTime: "21:00" },
        { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
      ],
    },
  ];

  for (const { user, profile, availability } of profData) {
    const createdUser = await prisma.user.create({ data: user });
    const createdProfile = await prisma.professionalProfile.create({
      data: { ...profile, userId: createdUser.id },
    });
    await prisma.availability.createMany({
      data: availability.map((a) => ({ ...a, professionalId: createdProfile.id })),
    });
    console.log("✅ Professional:", createdUser.email);
  }

  // ── Sample session (future) ───────────────────────────────────────────────
  const elena = await prisma.professionalProfile.findFirst({
    where: { user: { email: "elena@guidepath.com" } },
  });

  if (elena) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);

    await prisma.session.create({
      data: {
        clientId: clientUser.id,
        professionalId: elena.id,
        scheduledAt: futureDate,
        duration: 60,
        status: "CONFIRMED",
        price: 65,
      },
    });
    console.log("✅ Sample session created");
  }

  console.log("\n🎉 Seed complete!");
  console.log("\n📧 Test accounts (password: guidepath123):");
  console.log("   Client:       cliente@guidepath.com");
  console.log("   Professional: elena@guidepath.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
