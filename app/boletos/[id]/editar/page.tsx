import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditarBoletoForm from "./EditarBoletoForm";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDateForInput(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const boleto = await prisma.boleto.findUnique({
    where: { id },
  });

  if (!boleto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-black">EDITAR BOLETO</h1>

        <EditarBoletoForm
          boleto={{
            id: boleto.id,
            numeroBoleto: boleto.numeroBoleto ?? "",
            clienteNome: boleto.clienteNome ?? "",
            pagadorNome: boleto.pagadorNome ?? "",
            valorCentavos: boleto.valorCentavos,
            dataVencimento: formatDateForInput(boleto.dataVencimento),
          }}
        />
      </div>
    </main>
  );
}