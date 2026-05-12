"use client";

import { useMemo } from "react";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

type BoletoDTO = {
  id: string;
  valorCentavos: number;
  status: Status;
  dataVencimento: string;
  criadoEm?: string;
};

function formatMoneyBRLFromCents(cents: number) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isAtrasado(b: BoletoDTO) {
  if (b.status !== "ABERTO") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const venc = new Date(b.dataVencimento);
  venc.setHours(0, 0, 0, 0);

  return venc < hoje;
}

export default function DashboardMensal({ boletos }: { boletos: BoletoDTO[] }) {
  const resumo = useMemo(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    let somaAbertos = 0;
    let somaAtrasados = 0;
    let somaPagos = 0;

    let qtdAbertos = 0;
    let qtdAtrasados = 0;
    let qtdPagos = 0;

    for (const b of boletos) {
      // Usa criadoEm para saber se o boleto pertence ao mês atual.
      // Se não existir, usa dataVencimento como fallback.
      const dataBase = new Date(b.criadoEm || b.dataVencimento);

      if (
        dataBase.getMonth() !== mesAtual ||
        dataBase.getFullYear() !== anoAtual
      ) {
        continue;
      }

      const valor = b.valorCentavos || 0;

      if (b.status === "PAGO") {
        qtdPagos++;
        somaPagos += valor;
        continue;
      }

      if (isAtrasado(b)) {
        qtdAtrasados++;
        somaAtrasados += valor;
        continue;
      }

      if (b.status === "ABERTO") {
        qtdAbertos++;
        somaAbertos += valor;
      }
    }

    return {
      qtdAbertos,
      qtdAtrasados,
      qtdPagos,
      somaAbertos,
      somaAtrasados,
      somaPagos,
      total: somaAbertos + somaAtrasados + somaPagos,
    };
  }, [boletos]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 14,
      }}
    >
      <Card
        title="Abertos"
        subtitle={`${resumo.qtdAbertos} boleto(s)`}
        value={formatMoneyBRLFromCents(resumo.somaAbertos)}
      />

      <Card
        title="Atrasados"
        subtitle={`${resumo.qtdAtrasados} boleto(s)`}
        value={formatMoneyBRLFromCents(resumo.somaAtrasados)}
        danger
      />

      <Card
        title="Pagos"
        subtitle={`${resumo.qtdPagos} boleto(s)`}
        value={formatMoneyBRLFromCents(resumo.somaPagos)}
        success
      />

      <Card
        title="Total"
        subtitle="(Abertos + Atrasados + Pagos)"
        value={formatMoneyBRLFromCents(resumo.total)}
      />
    </div>
  );
}

function Card({ title, subtitle, value, danger, success }: any) {
  const border = danger
    ? "1px solid rgba(255, 80, 80, 0.25)"
    : success
    ? "1px solid rgba(80, 255, 160, 0.22)"
    : "1px solid rgba(255,255,255,0.10)";

  const bg = danger
    ? "rgba(255, 80, 80, 0.06)"
    : success
    ? "rgba(80, 255, 160, 0.05)"
    : "rgba(255,255,255,0.03)";

  return (
    <div
      style={{
        border,
        background: bg,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>

      <div
        style={{
          opacity: 0.75,
          marginTop: 4,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}