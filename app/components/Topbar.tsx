"use client";

import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  return (
    <div
      style={{
        width: "100%",
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ESQUERDA */}
        <div style={{ fontWeight: 900 }}>
          💰 Cobrança Gelo
        </div>

        {/* DIREITA */}
        <ThemeToggle />
      </div>
    </div>
  );
}