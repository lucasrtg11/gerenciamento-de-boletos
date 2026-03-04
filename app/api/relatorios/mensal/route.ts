import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function startOfMonthUTC(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
}

function startOfNextMonthUTC(year: number, month: number) {
  return month === 12
    ? new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0))
    : new Date(Date.UTC(year, month, 1, 0, 0, 0));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const ano = Number(searchParams.get("ano"));
    const mes = Number(searchParams.get("mes"));

    if (!ano || !mes || mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: "Parâmetros inválidos. Use ?ano=2026&mes=2" },
        { status: 400 }
      );
    }

    const inicio = startOfMonthUTC(ano, mes);
    const fim = startOfNextMonthUTC(ano, mes);

    // Agrupa por status no mês (usando criadoEm como "mês de emissão")
    const agrupado = await prisma.boleto.groupBy({
      by: ["status"],
      where: {
        criadoEm: { gte: inicio, lt: fim },
      },
      _count: { _all: true },
      _sum: { valorCentavos: true },
    });

    // Lista dos boletos do mês (para tabela)
    const itens = await prisma.boleto.findMany({
      where: { criadoEm: { gte: inicio, lt: fim } },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        pagadorNome: true,
        valorCentavos: true,
        status: true,
        dataVencimento: true,
        criadoEm: true,
      },
    });

    // garante retorno consistente
    const porStatus = {
      ABERTO: { qtd: 0, valorCentavos: 0 },
      PAGO: { qtd: 0, valorCentavos: 0 },
      CANCELADO: { qtd: 0, valorCentavos: 0 },
    } as const;

    for (const row of agrupado) {
      (porStatus as any)[row.status] = {
        qtd: row._count._all,
        valorCentavos: row._sum.valorCentavos ?? 0,
      };
    }

    const total = {
      qtd: itens.length,
      valorCentavos: itens.reduce((acc, b) => acc + b.valorCentavos, 0),
    };

    return NextResponse.json({
      periodo: {
        ano,
        mes,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      },
      porStatus,
      total,
      itens: itens.map((b) => ({
        ...b,
        dataVencimento: b.dataVencimento.toISOString(),
        criadoEm: b.criadoEm.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar relatório mensal" }, { status: 500 });
  }
}