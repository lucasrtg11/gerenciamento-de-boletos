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
        borderRadius: 10,
        border: "1px solid rgba(239,68,68,0.3)",
        background: loading
          ? "rgba(239,68,68,0.08)"
          : "rgba(239,68,68,0.12)",
        color: "#ef4444",
        fontWeight: 800,
        letterSpacing: 0.5,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "rgba(239,68,68,0.2)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = loading
          ? "rgba(239,68,68,0.08)"
          : "rgba(239,68,68,0.12)";
      }}
    >
      {loading ? "SAINDO..." : "SAIR"}
    </button>
  );
}