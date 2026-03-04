"use client";

import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";
import BoletoActions from "./BoletoActions";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export type BoletoDTO = {
  id: string;
  clienteNome?: string | null;
  pagadorNome?: string | null;
  valorCentavos: number;
  dataVencimento: string; // ISO string
  criadoEm?: string; // ISO string (emissão)
  status: Status;
};

type Filtro = "TODOS" | "ABERTOS" | "PAGOS" | "ATRASADOS";

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

  const counts = useMemo(() => {
    const todos = boletos?.length ?? 0;
    const abertos = (boletos ?? []).filter((b) => b.status === "ABERTO" && !isAtrasado(b)).length;
    const pagos = (boletos ?? []).filter((b) => b.status === "PAGO").length;
    const atrasados = (boletos ?? []).filter((b) => isAtrasado(b)).length;
    return { todos, abertos, pagos, atrasados };
  }, [boletos]);

  const filtrados = useMemo(() => {
    const arr = boletos ?? [];
    if (filtro === "TODOS") return arr;
    if (filtro === "ABERTOS") return arr.filter((b) => b.status === "ABERTO" && !isAtrasado(b));
    if (filtro === "PAGOS") return arr.filter((b) => b.status === "PAGO");
    return arr.filter((b) => isAtrasado(b)); // ATRASADOS
  }, [boletos, filtro]);

  return (
    <section style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setFiltro("TODOS")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background: filtro === "TODOS" ? "rgba(255,255,255,0.08)" : "transparent",
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
            background: filtro === "ABERTOS" ? "rgba(255,255,255,0.08)" : "transparent",
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
            background: filtro === "PAGOS" ? "rgba(255,255,255,0.08)" : "transparent",
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
            background: filtro === "ATRASADOS" ? "rgba(255,255,255,0.08)" : "transparent",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Atrasados ({counts.atrasados})
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "14px 10px" }}>Pagador</th>
              <th style={{ padding: "14px 10px" }}>Valor</th>
              <th style={{ padding: "14px 10px" }}>Vencimento</th>
              <th style={{ padding: "14px 10px" }}>Emissão</th>
              <th style={{ padding: "14px 10px" }}>Status</th>
              <th style={{ padding: "14px 10px" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((b) => {
              const nome = (b.pagadorNome ?? b.clienteNome ?? "-").toString();
              const atraso = isAtrasado(b);

              return (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "16px 10px" }}>{nome}</td>
                  <td style={{ padding: "16px 10px" }}>{formatMoneyBRLFromCents(b.valorCentavos)}</td>
                  <td style={{ padding: "16px 10px" }}>{formatDateBR(b.dataVencimento)}</td>
                  <td style={{ padding: "16px 10px" }}>
                    {b.criadoEm ? formatDateTimeBR(b.criadoEm) : "-"}
                  </td>
                  <td style={{ padding: "16px 10px" }}>
                    {/* se estiver atrasado, mostra badge como ABERTO mesmo (mantém status real) */}
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
                    {/* Ação continua cancelando normal */}
                    <BoletoActions id={b.id} status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div style={{ padding: 18, opacity: 0.75 }}>Nenhum boleto para este filtro.</div>
        )}
      </div>
    </section>
  );
}