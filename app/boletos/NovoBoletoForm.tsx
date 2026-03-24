"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatMoneyBRLFromCents(cents: number) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTimeBR(d: Date) {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NovoBoletoForm() {
  const router = useRouter();

  const [numeroBoleto, setNumeroBoleto] = useState("");
  const [pagadorNome, setPagadorNome] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [emitidoEm, setEmitidoEm] = useState<string | null>(null);
  const [boletoCriadoResumo, setBoletoCriadoResumo] = useState<string | null>(null);

  function parseValorToCentavos(input: string) {
    const normalized = input.trim().replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    if (!Number.isFinite(num)) return NaN;
    return Math.round(num * 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setEmitidoEm(null);
    setBoletoCriadoResumo(null);

    const numero = numeroBoleto.trim();
    const nome = pagadorNome.trim();
    const valorCentavos = parseValorToCentavos(valor);

    if (!numero) return setErro("Informe o número do boleto.");
    if (!nome) return setErro("Informe o nome do pagador.");
    if (!Number.isFinite(valorCentavos) || valorCentavos <= 0) {
      return setErro("Informe um valor válido (ex: 150,00).");
    }
    if (!vencimento) return setErro("Informe a data de vencimento.");

    const dataVenc = new Date(`${vencimento}T12:00:00`);
    if (Number.isNaN(dataVenc.getTime())) {
      return setErro("Data de vencimento inválida.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroBoleto: numero,
          pagadorNome: nome,
          valorCentavos,
          dataVencimento: dataVenc.toISOString(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Erro ao criar boleto.");
        return;
      }

      const criadoEm = data?.criadoEm ? new Date(data.criadoEm) : null;

      setSucesso("✅ Boleto criado com sucesso!");
      if (criadoEm) setEmitidoEm(formatDateTimeBR(criadoEm));

      setBoletoCriadoResumo(
        `Nº ${numero} • ${nome} • ${formatMoneyBRLFromCents(valorCentavos)} • Venc: ${new Date(
          dataVenc.toISOString()
        ).toLocaleDateString("pt-BR")}`
      );

      setNumeroBoleto("");
      setPagadorNome("");
      setValor("");
      setVencimento("");

      router.refresh();
    } catch {
      setErro("Erro ao conectar no servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: 1,
          marginBottom: 18,
        }}
      >
        NOVO BOLETO
      </h1>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr 1fr",
            gap: 16,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Número do boleto
            </label>
            <input
              value={numeroBoleto}
              onChange={(e) => setNumeroBoleto(e.target.value)}
              placeholder="Ex: 123 ou BOL-001"
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Nome do pagador
            </label>
            <input
              value={pagadorNome}
              onChange={(e) => setPagadorNome(e.target.value)}
              placeholder="Ex: Supermercado Silva"
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Valor (R$)
            </label>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              inputMode="decimal"
              placeholder="Ex: 150,00"
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Vencimento
            </label>
            <input
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              type="date"
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "16px 16px",
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
          {loading ? "CRIANDO..." : "CRIAR BOLETO"}
        </button>

        {erro && (
          <div style={{ marginTop: 12, color: "#ff6b6b", fontWeight: 800 }}>
            {erro}
          </div>
        )}

        {sucesso && (
          <div style={{ marginTop: 12, color: "#7CFC98", fontWeight: 800 }}>
            {sucesso}
          </div>
        )}

        {(emitidoEm || boletoCriadoResumo) && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid #333",
              borderRadius: 12,
              padding: 14,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Detalhes</div>
            {boletoCriadoResumo && (
              <div style={{ opacity: 0.95, marginBottom: 6 }}>
                {boletoCriadoResumo}
              </div>
            )}
            {emitidoEm && (
              <div style={{ opacity: 0.85 }}>
                <b>Emitido em:</b> {emitidoEm}
              </div>
            )}
          </div>
        )}
      </form>
    </section>
  );
}