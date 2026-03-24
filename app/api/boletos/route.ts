import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const boletos = await prisma.boleto.findMany({
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(boletos);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar boletos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const pagadorNomeRaw = body.pagadorNome ?? body.clienteNome;
    const pagadorNome = String(pagadorNomeRaw ?? "").trim();

    const valorCentavos = Number(body.valorCentavos);
    const dataVencimentoRaw = body.dataVencimento;

    if (!pagadorNome || !Number.isFinite(valorCentavos) || !dataVencimentoRaw) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const dataVencimento = new Date(dataVencimentoRaw);
    if (Number.isNaN(dataVencimento.getTime())) {
      return NextResponse.json(
        { error: "dataVencimento inválida" },
        { status: 400 }
      );
    }

    const ultimoBoleto = await prisma.boleto.findFirst({
      where: {
        numeroBoleto: {
          not: null,
        },
      },
      orderBy: {
        numeroBoleto: "desc",
      },
      select: {
        numeroBoleto: true,
      },
    });

    const proximoNumero = (ultimoBoleto?.numeroBoleto ?? 0) + 1;

    const novo = await prisma.boleto.create({
      data: {
        numeroBoleto: proximoNumero,
        clienteNome: pagadorNome,
        pagadorNome,
        valorCentavos,
        dataVencimento,
        status: "ABERTO",
      },
    });

    return NextResponse.json(novo);
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar boleto" },
      { status: 500 }
    );
  }
}