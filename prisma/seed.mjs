import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando base de datos...");

  const clientPassword = await bcrypt.hash("password123", 10);
  const proPassword = await bcrypt.hash("password123", 10);

  // Cliente de prueba
  await prisma.user.upsert({
    where: { email: "cliente@guidepath.dev" },
    update: {},
    create: {
      name: "Carlos Cliente",
      email: "cliente@guidepath.dev",
      password: clientPassword,
      role: "CLIENT",
    },
  });

  // Profesional de prueba
  const pro = await prisma.user.upsert({
    where: { email: "profesional@guidepath.dev" },
    update: {},
    create: {
      name: "Ana García López",
      email: "profesional@guidepath.dev",
      password: proPassword,
      role: "PROFESSIONAL",
    },
  });

  // Perfil profesional
  await prisma.professionalProfile.upsert({
    where: { userId: pro.id },
    update: {},
    create: {
      userId: pro.id,
      category: "CAREER_MENTOR",
      headline: "Mentora de Carrera · Ex-RRHH IBEX 35 & Big Four",
      hourlyRate: 70,
      verified: true,
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "14:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "14:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "14:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
        ],
      },
    },
  });

  console.log("✅ Seed completado");
  console.log("   cliente@guidepath.dev   / password123  (CLIENT)");
  console.log("   profesional@guidepath.dev / password123  (PROFESSIONAL)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
