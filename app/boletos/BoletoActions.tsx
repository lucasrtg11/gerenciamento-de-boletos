"use client";

import { useRouter } from "next/navigation";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

export default function BoletoActions({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const router = useRouter();

  async function atualizarStatus(novoStatus: Status) {
    try {
      await fetch(`/api/boletos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      router.refresh();
    } catch (e) {
      alert("Erro ao atualizar boleto");
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {status !== "PAGO" && (
        <button
          onClick={() => atualizarStatus("PAGO")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #1f7a3a",
            background: "#28a745",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✔ Pago
        </button>
      )}

      {status !== "CANCELADO" && (
        <button
          onClick={() => atualizarStatus("CANCELADO")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #7a1f1f",
            background: "#dc3545",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✖ Cancelar
        </button>
      )}

      {status === "CANCELADO" && (
        <button
          onClick={() => atualizarStatus("ABERTO")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #1f3f7a",
            background: "#0d6efd",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ↻ Reabrir
        </button>
      )}
    </div>
  );
}