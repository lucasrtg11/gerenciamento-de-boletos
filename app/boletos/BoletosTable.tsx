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
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
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
    const todos = boletos.length;
    const abertos = boletos.filter(
      (b) => b.status === "ABERTO" && !isAtrasado(b)
    ).length;
    const pagos = boletos.filter((b) => b.status === "PAGO").length;
    const atrasados = boletos.filter((b) => isAtrasado(b)).length;

    return { todos, abertos, pagos, atrasados };
  }, [boletos]);

  const filtrados = useMemo(() => {
    let lista = boletos;

    if (filtro === "ABERTOS") {
      lista = lista.filter(
        (b) => b.status === "ABERTO" && !isAtrasado(b)
      );
    } else if (filtro === "PAGOS") {
      lista = lista.filter((b) => b.status === "PAGO");
    } else if (filtro === "ATRASADOS") {
      lista = lista.filter((b) => isAtrasado(b));
    }

    if (busca) {
      const termo = busca.toLowerCase();
      lista = lista.filter((b) =>
        (b.pagadorNome ?? b.clienteNome ?? "")
          .toLowerCase()
          .includes(termo) ||
        (b.numeroBoleto ?? "").includes(termo)
      );
    }

    return lista;
  }, [boletos, filtro, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));

  const paginados = filtrados.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  );

  useEffect(() => setPagina(1), [filtro, busca]);

  return (
    <section>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {[
          ["TODOS", counts.todos],
          ["ABERTOS", counts.abertos],
          ["PAGOS", counts.pagos],
          ["ATRASADOS", counts.atrasados],
        ].map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFiltro(key as Filtro)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background:
                filtro === key ? "var(--card)" : "transparent",
              color: "var(--text)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar boleto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--text)",
          marginBottom: 16,
        }}
      />

      {/* Tabela */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th>Nº</th>
              <th>Pagador</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Emissão</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginados.map((b) => (
              <tr
                key={b.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td>{b.numeroBoleto}</td>
                <td>{b.pagadorNome ?? b.clienteNome}</td>
                <td>{formatMoneyBRLFromCents(b.valorCentavos)}</td>
                <td>{formatDateBR(b.dataVencimento)}</td>
                <td>{b.criadoEm && formatDateTimeBR(b.criadoEm)}</td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>
                  <BoletoActions id={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}