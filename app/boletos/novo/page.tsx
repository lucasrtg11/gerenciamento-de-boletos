import NovoBoletoForm from "../NovoBoletoForm";
import DashboardResumo from "../DashboardResumo";
import LogoutButton from "../LogoutButton";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

type BoletoDTO = {
  id: string;
  valorCentavos: number;
  status: Status;
  dataVencimento: string;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const boletosDB = await prisma.boleto.findMany({
    select: {
      id: true,
      valorCentavos: true,
      status: true,
      dataVencimento: true,
    },
    orderBy: { criadoEm: "desc" },
  });

  const boletos: BoletoDTO[] = boletosDB.map((b) => ({
    id: b.id,
    valorCentavos: b.valorCentavos,
    status: b.status as Status,
    dataVencimento:
      (b.dataVencimento as any)?.toISOString?.() ?? String(b.dataVencimento),
  }));

  return (
    <main style={{ padding: 24 }}>
      {/* Topo */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div />

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/boletos">
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              BOLETOS GERADOS
            </button>
          </Link>

          <LogoutButton />
        </div>
      </div>

      <NovoBoletoForm />

      <DashboardResumo boletos={boletos} />
    </main>
  );
}