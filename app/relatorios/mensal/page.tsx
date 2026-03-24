"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/boletos/LogoutButton";

function formatBRLFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type Status = "ABERTO" | "PAGO" | "CANCELADO";

type ItemBoleto = {
  id: string;
  numeroBoleto?: number | null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {/* VOLTAR -> /boletos */}
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
            ← VOLTAR
          </button>
        </Link>

        {/* Topo direita: exportar + sair */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() =>
              window.open(
                `/api/relatorios/mensal/exportar?ano=${ano}&mes=${mes}`,
                "_blank"
              )
            }
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #333",
              background: "transparent",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
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

        {/* Filtros (GERAR ao lado do Ano) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 160px",
            gap: 10,
            marginBottom: 20,
            alignItems: "end",
          }}
        >
          {/* Mês */}
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 800 }}
            >
              Mês
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
              }}
            >
              {meses.map((m) => (
                <option key={m.v} value={m.v} style={{ color: "black" }}>
                  {m.n}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 800 }}
            >
              Ano
            </label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
              }}
            />
          </div>

          {/* GERAR */}
          <button
            onClick={carregar}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #333",
              background: "transparent",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              height: 44,
            }}
          >
            {loading ? "CARREGANDO..." : "GERAR"}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid #5a1b1b",
              background: "rgba(120,0,0,0.15)",
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Cards */}
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(4, 1fr)",
                marginBottom: 20,
              }}
            >
              <Card
                titulo="Abertos"
                qtd={data.porStatus.ABERTO.qtd}
                valor={formatBRLFromCents(data.porStatus.ABERTO.valorCentavos)}
              />
              <Card
                titulo="Pagos"
                qtd={data.porStatus.PAGO.qtd}
                valor={formatBRLFromCents(data.porStatus.PAGO.valorCentavos)}
              />
              <Card
                titulo="Cancelados"
                qtd={data.porStatus.CANCELADO.qtd}
                valor={formatBRLFromCents(
                  data.porStatus.CANCELADO.valorCentavos
                )}
              />
              <Card
                titulo="Total"
                qtd={data.total.qtd}
                valor={formatBRLFromCents(data.total.valorCentavos)}
              />
            </div>

            {/* Tabela */}
            <div
              style={{
                border: "1px solid #222",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
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
                      <td style={td}>
                        {new Date(b.dataVencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={td}>
                        {new Date(b.criadoEm).toLocaleDateString("pt-BR")}
                      </td>
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

function Card({
  titulo,
  qtd,
  valor,
}: {
  titulo: string;
  qtd: number;
  valor: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #222",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900 }}>{titulo}</div>
      <div style={{ marginTop: 6 }}>{qtd} boleto(s)</div>
      <div style={{ marginTop: 8, fontWeight: 900, fontSize: 22 }}>
        {valor}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #222",
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #141414",
};