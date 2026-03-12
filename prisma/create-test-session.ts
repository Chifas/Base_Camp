import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the test client
  const client = await prisma.user.findFirst({
    where: { email: "cliente@guidepath.com" },
  });

  if (!client) {
    console.error("❌ No se encontró el cliente (cliente@guidepath.com)");
    console.log("   Ejecuta primero: npm run db:seed");
    process.exit(1);
  }

  // Find Elena (first professional)
  const elena = await prisma.professionalProfile.findFirst({
    where: { user: { email: "elena@guidepath.com" } },
    include: { user: true },
  });

  if (!elena) {
    console.error("❌ No se encontró la profesional (elena@guidepath.com)");
    process.exit(1);
  }

  // Create session 30 minutes from now
  const scheduledAt = new Date();
  scheduledAt.setMinutes(scheduledAt.getMinutes() + 30);

  const session = await prisma.session.create({
    data: {
      clientId: client.id,
      professionalId: elena.id,
      scheduledAt,
      duration: 60,
      status: "CONFIRMED",
      price: 65,
    },
  });

  console.log("\n✅ Sesión de prueba creada:");
  console.log(`   ID: ${session.id}`);
  console.log(`   Cliente: ${client.name} (${client.email})`);
  console.log(`   Profesional: ${elena.user.name} (${elena.user.email})`);
  console.log(`   Hora: ${scheduledAt.toLocaleString("es-ES")}`);
  console.log(`   Estado: CONFIRMED`);
  console.log(`\n🔑 Login: cliente@guidepath.com / guidepath123`);
  console.log(`   O con: elena@guidepath.com / guidepath123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
