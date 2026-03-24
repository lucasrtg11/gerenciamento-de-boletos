const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const boletos = await prisma.boleto.findMany({
    orderBy: [
      { criadoEm: "asc" },
      { id: "asc" },
    ],
    select: {
      id: true,
      numeroBoleto: true,
    },
  });

  let contador = 1;

  for (const boleto of boletos) {
    if (boleto.numeroBoleto == null) {
      await prisma.boleto.update({
        where: { id: boleto.id },
        data: { numeroBoleto: contador },
      });
    }
    contador++;
  }

  console.log("Numeração dos boletos concluída com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro ao preencher número dos boletos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });