import Link from "next/link";
import BoletosTable from "./BoletosTable";
import LogoutButton from "./LogoutButton";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export type BoletoDTO = {
  id: string;
  clienteNome?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  dataVencimento: string; // ISO string
  criadoEm?: string; // ISO string
  atualizadoEm?: string; // ISO string
  status: Status;
};

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/boletos", {
    cache: "no-store",
  });

  const boletosRaw = await res.json();

  // ✅ normaliza datas (caso alguma venha como Date/qualquer coisa)
  const boletos: BoletoDTO[] = (boletosRaw ?? []).map((b: any) => ({
    ...b,
    dataVencimento:
      b.dataVencimento instanceof Date
        ? b.dataVencimento.toISOString()
        : String(b.dataVencimento),
    criadoEm:
      b.criadoEm instanceof Date ? b.criadoEm.toISOString() : b.criadoEm,
    atualizadoEm:
      b.atualizadoEm instanceof Date
        ? b.atualizadoEm.toISOString()
        : b.atualizadoEm,
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
        {/* VOLTAR -> /boletos/novo */}
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
          {/* RELATÓRIO MENSAL -> /relatorios/mensal */}
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

          {/* SAIR */}
          <LogoutButton />
        </div>
      </div>

      {/* Tabela */}
      <BoletosTable boletos={boletos} />
    </main>
  );
}