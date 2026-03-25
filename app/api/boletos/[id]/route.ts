import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const boletoExistente = await prisma.boleto.findUnique({
      where: { id },
      select: { id: true, numeroBoleto: true },
    });

    if (!boletoExistente) {
      return NextResponse.json(
        { error: "Boleto não encontrado." },
        { status: 404 }
      );
    }

    const numeroBoleto = String(body.numeroBoleto ?? "").trim();
    const pagadorNome = String(body.pagadorNome ?? "").trim();
    const clienteNome = String(body.clienteNome ?? pagadorNome).trim();
    const valorCentavos = Number(body.valorCentavos);
    const dataVencimentoRaw = body.dataVencimento;

    if (
      !numeroBoleto ||
      !pagadorNome ||
      !clienteNome ||
      !Number.isFinite(valorCentavos) ||
      !dataVencimentoRaw
    ) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const dataVencimento = new Date(dataVencimentoRaw);

    if (Number.isNaN(dataVencimento.getTime())) {
      return NextResponse.json(
        { error: "Data de vencimento inválida." },
        { status: 400 }
      );
    }

    const numeroEmUso = await prisma.boleto.findFirst({
      where: {
        numeroBoleto,
        NOT: { id },
      },
      select: { id: true },
    });

    if (numeroEmUso) {
      return NextResponse.json(
        { error: "Já existe outro boleto com esse número." },
        { status: 400 }
      );
    }

    const atualizado = await prisma.boleto.update({
      where: { id },
      data: {
        numeroBoleto,
        clienteNome,
        pagadorNome,
        valorCentavos,
        dataVencimento,
        seuNumero: body.seuNumero ? String(body.seuNumero).trim() : null,
        nossoNumero: body.nossoNumero ? String(body.nossoNumero).trim() : null,
        pagadorDocumento: body.pagadorDocumento
          ? String(body.pagadorDocumento).trim()
          : null,
        pagadorEmail: body.pagadorEmail
          ? String(body.pagadorEmail).trim()
          : null,
        pagadorTelefone: body.pagadorTelefone
          ? String(body.pagadorTelefone).trim()
          : null,
        pagadorEndereco: body.pagadorEndereco
          ? String(body.pagadorEndereco).trim()
          : null,
        pagadorCidade: body.pagadorCidade
          ? String(body.pagadorCidade).trim()
          : null,
        pagadorUF: body.pagadorUF ? String(body.pagadorUF).trim() : null,
        pagadorCEP: body.pagadorCEP ? String(body.pagadorCEP).trim() : null,
        linhaDigitavel: body.linhaDigitavel
          ? String(body.linhaDigitavel).trim()
          : null,
        codigoBarras: body.codigoBarras
          ? String(body.codigoBarras).trim()
          : null,
        pdfUrl: body.pdfUrl ? String(body.pdfUrl).trim() : null,
      },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao editar boleto:", error);

    return NextResponse.json(
      { error: "Erro ao editar boleto." },
      { status: 500 }
    );
  }
}