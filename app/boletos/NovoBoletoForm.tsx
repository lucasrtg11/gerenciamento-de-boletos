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

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    outline: "none",
    fontWeight: 600,
  };

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 40,
          fontWeight: 900,
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
          }}
        >
          <div>
            <label style={{ fontWeight: 700 }}>Número do boleto</label>
            <input
              value={numeroBoleto}
              onChange={(e) => setNumeroBoleto(e.target.value)}
              placeholder="Ex: 123 ou BOL-001"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Nome do pagador</label>
            <input
              value={pagadorNome}
              onChange={(e) => setPagadorNome(e.target.value)}
              placeholder="Ex: Supermercado Silva"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Valor (R$)</label>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 150,00"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Vencimento</label>
            <input
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              type="date"
              style={{
                ...inputStyle,
                colorScheme: "dark", // 🔥 resolve problema do date picker
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
            padding: "16px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.opacity = "0.85";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {loading ? "CRIANDO..." : "CRIAR BOLETO"}
        </button>

        {erro && (
          <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 800 }}>
            {erro}
          </div>
        )}

        {sucesso && (
          <div style={{ marginTop: 12, color: "#22c55e", fontWeight: 800 }}>
            {sucesso}
          </div>
        )}

        {(emitidoEm || boletoCriadoResumo) && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              background: "var(--card)",
            }}
          >
            <div style={{ fontWeight: 900 }}>Detalhes</div>
            {boletoCriadoResumo && <div>{boletoCriadoResumo}</div>}
            {emitidoEm && (
              <div>
                <b>Emitido em:</b> {emitidoEm}
              </div>
            )}
          </div>
        )}
      </form>

      {/* 🔥 FIX placeholder */}
      <style jsx>{`
        input::placeholder {
          color: var(--text);
          opacity: 0.5;
        }
      `}</style>
    </section>
  );
}