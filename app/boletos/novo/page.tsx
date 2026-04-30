import NovoBoletoForm from "../NovoBoletoForm";
import DashboardResumo from "../DashboardResumo";
import DashboardMensal from "../DashboardMensal";
import LogoutButton from "../LogoutButton";
import ThemeToggle from "@/app/components/ThemeToggle"; // ✅ CORRETO
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
    <main
      style={{
        padding: 24,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Topo */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle /> {/* ✅ botão funcionando */}

          <Link href="/boletos" style={{ textDecoration: "none" }}>
            <span style={btn}>
              BOLETOS GERADOS
            </span>
          </Link>

          <LogoutButton />
        </div>
      </div>

      {/* FORM */}
      <div style={{ marginBottom: 30 }}>
        <NovoBoletoForm />
      </div>

      {/* DASHBOARD MENSAL */}
      <div style={{ maxWidth: 1400, margin: "0 auto", marginBottom: 30 }}>
        <h2 style={{ fontWeight: 900, marginBottom: 10 }}>
          📅 Mês atual
        </h2>

        <DashboardMensal boletos={boletos} />
      </div>

      {/* DASHBOARD ANUAL */}
      <div style={{ maxWidth: 1400, margin: "0 auto", marginTop: 30 }}>
        <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
          📊 Resumo geral
        </h2>

        <DashboardResumo boletos={boletos} />
      </div>
    </main>
  );
}

const btn = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontWeight: 800,
  cursor: "pointer",
};