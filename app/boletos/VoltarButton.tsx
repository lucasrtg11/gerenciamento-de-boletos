"use client";

import { useRouter } from "next/navigation";

export default function VoltarButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/boletos/novo")}
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
  );
}