"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/boletos/LogoutButton";

type StatusFiltro = "TODOS" | "ABERTO" | "PAGO" | "CANCELADO" | "ATRASADO";

export default function Page() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState<StatusFiltro>("TODOS");

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

  function gerar() {
    const url = `/api/relatorios/exportar?ano=${ano}&mes=${mes}&status=${status}`;
    window.open(url, "_blank");
  }

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

        <div style={{ display: "flex", gap: 10 }}>
          <LogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 2,
            margin: "20px 0",
          }}
        >
          EXPORTAR RELATÓRIO
        </h1>

        {/* Filtros */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 800 }}>Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 12px",
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

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 800 }}>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 800 }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFiltro)}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
              }}
            >
              <option value="TODOS" style={{ color: "black" }}>TODOS</option>
              <option value="ABERTO" style={{ color: "black" }}>ABERTO</option>
              <option value="ATRASADO" style={{ color: "black" }}>ATRASADO</option>
              <option value="PAGO" style={{ color: "black" }}>PAGO</option>
              <option value="CANCELADO" style={{ color: "black" }}>CANCELADO</option>
            </select>
          </div>
        </div>

        <button
          onClick={gerar}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "transparent",
            color: "white",
            fontWeight: 900,
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          GERAR CSV
        </button>
      </div>
    </main>
  );
}