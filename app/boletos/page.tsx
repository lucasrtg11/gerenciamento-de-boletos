import Link from "next/link";
import BoletosTable from "./BoletosTable";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "../components/ThemeToggle"; // 👈 ADD
import { prisma } from "@/app/lib/prisma";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export type BoletoDTO = {
  id: string;
  numeroBoleto?: string | null;
  clienteNome?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  dataVencimento: string;
  criadoEm?: string;
  atualizadoEm?: string;
  status: Status;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const boletosDB = await prisma.boleto.findMany({
    orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
  });

  const boletos: BoletoDTO[] = boletosDB.map((b) => ({
    id: b.id,
    numeroBoleto: b.numeroBoleto,
    clienteNome: b.clienteNome,
    pagadorNome: b.pagadorNome,
    valorCentavos: b.valorCentavos,
    status: b.status as Status,
    dataVencimento: b.dataVencimento.toISOString(),
    criadoEm: b.criadoEm?.toISOString(),
    atualizadoEm: b.atualizadoEm?.toISOString(),
  }));

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            📄 Boletos
          </h1>

          <div style={{ display: "flex", gap: 10 }}>
            <ThemeToggle /> {/* 👈 ADD AQUI */}

            <Link href="/boletos/novo">
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Novo boleto
              </button>
            </Link>

            <Link href="/relatorios/mensal">
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Relatório
              </button>
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Tabela */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <BoletosTable boletos={boletos} />
        </div>
      </div>
    </main>
  );
}