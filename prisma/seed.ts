/// <reference types="node" />
import { PrismaClient, ProfessionalCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean slate ──────────────────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.notification.deleteMany();
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
        bio: "Psicóloga organizacional con más de 15 años acompañando a profesionales en entornos de alta exigencia. Especializada en burnout, estrés laboral y bienestar en el trabajo.",
      },
      profile: {
        category: ProfessionalCategory.PSYCHOLOGIST,
        headline: "Psicóloga Organizacional · Burnout y Bienestar Laboral",
        hourlyRate: 65,
        rating: 4.9,
        reviewCount: 127,
        verified: true,
        languages: ["Español", "Inglés"],
        yearsExperience: 15,
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
        bio: "Coach ejecutivo certificado por ICF con más de 500 sesiones. Trabajo con profesionales que quieren acelerar su carrera y dar el salto a puestos de liderazgo.",
      },
      profile: {
        category: ProfessionalCategory.COACH,
        headline: "Coach Ejecutivo Certificado ICF · Liderazgo y Potencial Directivo",
        hourlyRate: 80,
        rating: 4.8,
        reviewCount: 89,
        verified: true,
        languages: ["Español", "Inglés", "Francés"],
        yearsExperience: 12,
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
        bio: "Mentora de carrera con experiencia en RRHH en empresas del IBEX 35. Te ayudo a preparar entrevistas, negociar salarios y planificar tu transición profesional.",
      },
      profile: {
        category: ProfessionalCategory.CAREER_MENTOR,
        headline: "Mentora de Carrera · Ex-RRHH IBEX 35",
        hourlyRate: 70,
        rating: 4.7,
        reviewCount: 64,
        verified: true,
        languages: ["Español"],
        yearsExperience: 10,
      },
      availability: [
        { dayOfWeek: 2, startTime: "16:00", endTime: "20:00" },
        { dayOfWeek: 4, startTime: "16:00", endTime: "20:00" },
      ],
    },
    {
      user: {
        name: "Miguel Fernández Torres",
        email: "miguel@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
        bio: "Ex-Head of Product en tres startups fintech. Experto en Product Management, estrategia de producto y metodologías ágiles.",
      },
      profile: {
        category: ProfessionalCategory.CAREER_MENTOR,
        headline: "Experto en Product Management · Startups y Fintech",
        hourlyRate: 95,
        rating: 4.9,
        reviewCount: 102,
        verified: true,
        languages: ["Español", "Inglés"],
        yearsExperience: 8,
      },
      availability: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "13:00" },
        { dayOfWeek: 2, startTime: "08:00", endTime: "13:00" },
        { dayOfWeek: 4, startTime: "08:00", endTime: "13:00" },
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
        bio: "Psicóloga laboral especializada en dinámicas de equipo, gestión de conflictos en el trabajo y acompañamiento en procesos de cambio organizacional.",
      },
      profile: {
        category: ProfessionalCategory.PSYCHOLOGIST,
        headline: "Psicóloga Laboral · Equipos y Gestión del Cambio",
        hourlyRate: 60,
        rating: 4.8,
        reviewCount: 78,
        verified: true,
        languages: ["Español", "Portugués"],
        yearsExperience: 9,
      },
      availability: [
        { dayOfWeek: 1, startTime: "15:00", endTime: "20:00" },
        { dayOfWeek: 3, startTime: "15:00", endTime: "20:00" },
        { dayOfWeek: 5, startTime: "15:00", endTime: "20:00" },
      ],
    },
    {
      user: {
        name: "Pablo Moreno Díaz",
        email: "pablo@guidepath.com",
        password: hashedPassword,
        role: "PROFESSIONAL" as const,
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        bio: "Coach ejecutivo y de liderazgo con más de 200 directivos acompañados. Trabajo con managers y C-level que quieren mejorar su estilo de liderazgo.",
      },
      profile: {
        category: ProfessionalCategory.COACH,
        headline: "Coach Ejecutivo · Directivos y Alta Dirección",
        hourlyRate: 110,
        rating: 4.6,
        reviewCount: 53,
        verified: true,
        languages: ["Español", "Inglés"],
        yearsExperience: 20,
      },
      availability: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "13:00" },
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
