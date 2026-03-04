import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senha = "admin123"; // senha inicial

  const hash = await bcrypt.hash(senha, 10);

  const user = await prisma.user.upsert({
    where: { nome: "admin" },
    update: {},
    create: {
      nome: "admin",
      email: "admin@cobrancagelo.com",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  console.log("Usuário admin criado:", user.nome);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });