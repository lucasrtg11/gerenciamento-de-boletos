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

    const numeroBoleto = String(body.numeroBoleto ?? "").trim();
    const pagadorNomeRaw = body.pagadorNome ?? body.clienteNome;
    const pagadorNome = String(pagadorNomeRaw ?? "").trim();

    const valorCentavos = Number(body.valorCentavos);
    const dataVencimentoRaw = body.dataVencimento;

    if (
      !numeroBoleto ||
      !pagadorNome ||
      !Number.isFinite(valorCentavos) ||
      !dataVencimentoRaw
    ) {
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

    const existeNumero = await prisma.boleto.findUnique({
      where: { numeroBoleto },
      select: { id: true },
    });

    if (existeNumero) {
      return NextResponse.json(
        { error: "Já existe um boleto com esse número." },
        { status: 400 }
      );
    }

    const novo = await prisma.boleto.create({
      data: {
        numeroBoleto,
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