"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/boletos/LogoutButton";
import ThemeToggle from "@/app/components/ThemeToggle";

function formatBRLFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type Status = "ABERTO" | "PAGO" | "CANCELADO";

type ItemBoleto = {
  id: string;
  numeroBoleto?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  status: Status;
  dataVencimento: string;
  criadoEm: string;
};

type RelatorioMensalResponse = {
  porStatus: {
    ABERTO: { qtd: number; valorCentavos: number };
    PAGO: { qtd: number; valorCentavos: number };
    CANCELADO: { qtd: number; valorCentavos: number };
  };
  total: { qtd: number; valorCentavos: number };
  itens: ItemBoleto[];
};

export default function Page() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const [data, setData] = useState<RelatorioMensalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meses = useMemo(
    () => [
      { v: 1, n: "Janeiro" },
      { v: 2, n: "Fevereiro" },
      { v: 3, n: "Março" },
      { v: 4, n: "Abril" },
      { v: 5, n: "Maio" },
      { v: 6, n: "Junho" },
      { v: 7, n: "Julho" },
      { v: 8, n: "Agosto" },
      { v: 9, n: "Setembro" },
      { v: 10, n: "Outubro" },
      { v: 11, n: "Novembro" },
      { v: 12, n: "Dezembro" },
    ],
    []
  );

  async function carregar() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/relatorios/mensal?ano=${ano}&mes=${mes}`, {
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao carregar relatório");

      setData(json);
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <main
      style={{
        padding: 24,
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
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
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Link href="/boletos">
          <button style={btn}>← VOLTAR</button>
        </Link>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle />

          <button
            onClick={() =>
              window.open(
                `/api/relatorios/mensal/exportar?ano=${ano}&mes=${mes}`,
                "_blank"
              )
            }
            style={btn}
          >
            EXPORTAR CSV
          </button>

          <LogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 2,
            margin: "20px 0",
          }}
        >
          RELATÓRIO MENSAL
        </h1>

        {/* Filtros */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 160px",
            gap: 10,
            marginBottom: 20,
            alignItems: "end",
          }}
        >
          <div>
            <label style={label}>Mês</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} style={input}>
              {meses.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              style={input}
            />
          </div>

          <button onClick={carregar} style={btn}>
            {loading ? "CARREGANDO..." : "GERAR"}
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {data && (
          <>
            {/* CARDS */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
              <Card titulo="Abertos" qtd={data.porStatus.ABERTO.qtd} valor={formatBRLFromCents(data.porStatus.ABERTO.valorCentavos)} />
              <Card titulo="Pagos" qtd={data.porStatus.PAGO.qtd} valor={formatBRLFromCents(data.porStatus.PAGO.valorCentavos)} />
              <Card titulo="Cancelados" qtd={data.porStatus.CANCELADO.qtd} valor={formatBRLFromCents(data.porStatus.CANCELADO.valorCentavos)} />
              <Card titulo="Total" qtd={data.total.qtd} valor={formatBRLFromCents(data.total.valorCentavos)} />
            </div>

            {/* TABELA */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>N° Boleto</th>
                    <th style={th}>Pagador</th>
                    <th style={th}>Status</th>
                    <th style={th}>Valor</th>
                    <th style={th}>Vencimento</th>
                    <th style={th}>Emissão</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itens.map((b) => (
                    <tr key={b.id}>
                      <td style={td}>{b.numeroBoleto ?? "-"}</td>
                      <td style={td}>{b.pagadorNome || "-"}</td>
                      <td style={td}>{b.status}</td>
                      <td style={td}>{formatBRLFromCents(b.valorCentavos)}</td>
                      <td style={td}>{new Date(b.dataVencimento).toLocaleDateString("pt-BR")}</td>
                      <td style={td}>{new Date(b.criadoEm).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}

                  {data.itens.length === 0 && (
                    <tr>
                      <td style={{ padding: 12 }} colSpan={6}>
                        Nenhum boleto neste mês.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* COMPONENTES */
function Card({ titulo, qtd, valor }: any) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--card)" }}>
      <div style={{ fontWeight: 900 }}>{titulo}</div>
      <div style={{ marginTop: 6 }}>{qtd} boleto(s)</div>
      <div style={{ marginTop: 8, fontWeight: 900, fontSize: 22 }}>{valor}</div>
    </div>
  );
}

/* STYLES */
const btn = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontWeight: 800,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontWeight: 800,
};

const label = {
  display: "block",
  marginBottom: 8,
  fontWeight: 800,
};

const th = {
  padding: 12,
  borderBottom: "1px solid var(--border)",
  textAlign: "left" as const,
};

const td = {
  padding: 12,
  borderBottom: "1px solid var(--border)",
};