import Link from "next/link";
import BoletosTable from "./BoletosTable";
import LogoutButton from "./LogoutButton";
import { prisma } from "@/app/lib/prisma";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export type BoletoDTO = {
  id: string;
  clienteNome?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  dataVencimento: string; // ISO
  criadoEm?: string; // ISO
  atualizadoEm?: string; // ISO
  status: Status;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const boletosDB = await prisma.boleto.findMany({
    orderBy: { criadoEm: "desc" },
  });

  const boletos: BoletoDTO[] = boletosDB.map((b: any) => ({
    ...b,
    dataVencimento: b.dataVencimento?.toISOString?.() ?? String(b.dataVencimento),
    criadoEm: b.criadoEm?.toISOString?.() ?? b.criadoEm,
    atualizadoEm: b.atualizadoEm?.toISOString?.() ?? b.atualizadoEm,
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
        <Link href="/boletos/novo">
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
            ← VOLTAR
          </button>
        </Link>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/relatorios/mensal">
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
              RELATÓRIO MENSAL
            </button>
          </Link>

          <LogoutButton />
        </div>
      </div>

      {/* Tabela */}
      <BoletosTable boletos={boletos} />
    </main>
  );
}