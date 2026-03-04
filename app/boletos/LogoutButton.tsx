"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function sair() {
    setLoading(true);
    try {
      await fetch("/api/boletos/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      // se der erro, joga pro login do mesmo jeito
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={sair}
      disabled={loading}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #333",
        background: loading ? "#111" : "transparent",
        color: "white",
        fontWeight: 900,
        letterSpacing: 0.6,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.color = "black";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = loading ? "#111" : "transparent";
        e.currentTarget.style.color = "white";
      }}
    >
      {loading ? "SAINDO..." : "SAIR"}
    </button>
  );
}