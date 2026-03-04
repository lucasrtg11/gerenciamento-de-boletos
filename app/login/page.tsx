"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/boletos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Falha no login");
        return;
      }

      router.push("/boletos/novo");
      router.refresh();
    } catch {
      setErro("Erro ao conectar no servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 60%), #000",
      }}
    >
      <div style={{ width: "min(520px, 100%)" }}>
        {/* LOGO */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 320,
              maxWidth: "100%",
              padding: 12,
              borderRadius: 16,
              border: "1px solid #222",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <Image
              src="/brand/gelotek.jpg"
              alt="Gelotek"
              width={1200}
              height={350}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        <h1 style={{ textAlign: "center", fontSize: 34, fontWeight: 900, letterSpacing: 1, margin: 0 }}>
          LOGIN
        </h1>

        <form onSubmit={handleLogin} style={{ marginTop: 22 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
            Usuário
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: admin ou gelotek"
            autoComplete="username"
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "transparent",
              color: "white",
              outline: "none",
              marginBottom: 14,
            }}
          />

          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
            Senha
          </label>
          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "transparent",
              color: "white",
              outline: "none",
              marginBottom: 18,
            }}
          />

          {erro && (
            <div style={{ marginBottom: 12, color: "#ff6b6b", fontWeight: 700 }}>
              {erro}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #333",
              background: loading ? "#111" : "transparent",
              color: "white",
              fontWeight: 900,
              letterSpacing: 1,
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
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>

          <div style={{ marginTop: 14, textAlign: "center", opacity: 0.7, fontSize: 12 }}>
            Cobrança Gelo • Acesso restrito
          </div>
        </form>
      </div>
    </main>
  );
}