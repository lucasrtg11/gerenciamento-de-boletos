import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const nome = (process.env.ADMIN_USER ?? "admin").trim().toLowerCase();
  const senha = process.env.ADMIN_PASS ?? "admin123";

  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.user.upsert({
    where: { nome },
    update: {
      passwordHash,
      role: "ADMIN",
      email: process.env.ADMIN_EMAIL ?? null,
    },
    create: {
      nome,
      email: process.env.ADMIN_EMAIL ?? null,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin pronto: ${nome}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });