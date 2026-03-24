"use client";

import { useEffect, useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";
import BoletoActions from "./BoletoActions";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export type BoletoDTO = {
  id: string;
  numeroBoleto?: string | null;
  clienteNome?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  dataVencimento: string;
  criadoEm?: string;
  status: Status;
};

type Filtro = "TODOS" | "ABERTOS" | "PAGOS" | "ATRASADOS";

const ITENS_POR_PAGINA = 30;

function formatMoneyBRLFromCents(cents: number) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function formatDateTimeBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAtrasado(b: { status: Status; dataVencimento: string }) {
  if (b.status !== "ABERTO") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const venc = new Date(b.dataVencimento);
  venc.setHours(0, 0, 0, 0);

  return venc < hoje;
}

export default function BoletosTable({ boletos }: { boletos: BoletoDTO[] }) {
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const counts = useMemo(() => {
    const todos = boletos?.length ?? 0;
    const abertos = (boletos ?? []).filter(
      (b) => b.status === "ABERTO" && !isAtrasado(b)
    ).length;
    const pagos = (boletos ?? []).filter((b) => b.status === "PAGO").length;
    const atrasados = (boletos ?? []).filter((b) => isAtrasado(b)).length;

    return { todos, abertos, pagos, atrasados };
  }, [boletos]);

  const filtradosPorStatus = useMemo(() => {
    const arr = boletos ?? [];

    if (filtro === "TODOS") return arr;
    if (filtro === "ABERTOS") {
      return arr.filter((b) => b.status === "ABERTO" && !isAtrasado(b));
    }
    if (filtro === "PAGOS") {
      return arr.filter((b) => b.status === "PAGO");
    }

    return arr.filter((b) => isAtrasado(b));
  }, [boletos, filtro]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return filtradosPorStatus;

    return filtradosPorStatus.filter((b) => {
      const nome = (b.pagadorNome ?? b.clienteNome ?? "").toString().toLowerCase();
      const numero = String(b.numeroBoleto ?? "");

      return nome.includes(termo) || numero.includes(termo);
    });
  }, [filtradosPorStatus, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));

  const paginados = useMemo(() => {
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return filtrados.slice(inicio, fim);
  }, [filtrados, pagina]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, busca]);

  useEffect(() => {
    if (pagina > totalPaginas) {
      setPagina(totalPaginas);
    }
  }, [pagina, totalPaginas]);

  return (
    <section style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setFiltro("TODOS")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background:
              filtro === "TODOS" ? "rgba(255,255,255,0.08)" : "transparent",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Todos ({counts.todos})
        </button>

        <button
          onClick={() => setFiltro("ABERTOS")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background:
              filtro === "ABERTOS" ? "rgba(255,255,255,0.08)" : "transparent",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Abertos ({counts.abertos})
        </button>

        <button
          onClick={() => setFiltro("PAGOS")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background:
              filtro === "PAGOS" ? "rgba(255,255,255,0.08)" : "transparent",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Pagos ({counts.pagos})
        </button>

        <button
          onClick={() => setFiltro("ATRASADOS")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background:
              filtro === "ATRASADOS" ? "rgba(255,255,255,0.08)" : "transparent",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Atrasados ({counts.atrasados})
        </button>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por número do boleto ou nome do pagador"
          style={{
            width: "100%",
            maxWidth: 460,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "transparent",
            color: "white",
            outline: "none",
            fontWeight: 600,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <th style={{ padding: "14px 10px" }}>Nº Boleto</th>
              <th style={{ padding: "14px 10px" }}>Pagador</th>
              <th style={{ padding: "14px 10px" }}>Valor</th>
              <th style={{ padding: "14px 10px" }}>Vencimento</th>
              <th style={{ padding: "14px 10px" }}>Emissão</th>
              <th style={{ padding: "14px 10px" }}>Status</th>
              <th style={{ padding: "14px 10px" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginados.map((b) => {
              const nome = (b.pagadorNome ?? b.clienteNome ?? "-").toString();
              const atraso = isAtrasado(b);

              return (
                <tr
                  key={b.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td style={{ padding: "16px 10px", fontWeight: 800 }}>
                    {b.numeroBoleto ?? "-"}
                  </td>

                  <td style={{ padding: "16px 10px" }}>{nome}</td>

                  <td style={{ padding: "16px 10px" }}>
                    {formatMoneyBRLFromCents(b.valorCentavos)}
                  </td>

                  <td style={{ padding: "16px 10px" }}>
                    {formatDateBR(b.dataVencimento)}
                  </td>

                  <td style={{ padding: "16px 10px" }}>
                    {b.criadoEm ? formatDateTimeBR(b.criadoEm) : "-"}
                  </td>

                  <td style={{ padding: "16px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StatusBadge status={b.status} />
                      {atraso && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(255, 80, 80, 0.35)",
                            background: "rgba(255, 80, 80, 0.12)",
                            color: "#ff7a7a",
                          }}
                        >
                          ATRASADO
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "16px 10px" }}>
                    <BoletoActions id={b.id} status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div style={{ padding: 18, opacity: 0.75 }}>
            Nenhum boleto encontrado para este filtro/pesquisa.
          </div>
        )}
      </div>

      {/* Paginação */}
      {filtrados.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginTop: 18,
            flexWrap: "wrap",
          }}
        >
          <div style={{ opacity: 0.8, fontWeight: 700 }}>
            Página {pagina} de {totalPaginas} • {filtrados.length} boleto(s)
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: pagina === 1 ? "#666" : "white",
                fontWeight: 800,
                cursor: pagina === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Anterior
            </button>

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: pagina === totalPaginas ? "#666" : "white",
                fontWeight: 800,
                cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
              }}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}