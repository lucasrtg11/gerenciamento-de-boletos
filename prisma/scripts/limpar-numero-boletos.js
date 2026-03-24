const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.boleto.updateMany({
    data: {
      numeroBoleto: null,
    },
  });

  console.log("✅ Números dos boletos apagados com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro ao limpar números dos boletos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });