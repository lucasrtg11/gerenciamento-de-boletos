import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { StatusBoleto, NotificacaoTipo } from "@prisma/client";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ NEXT NOVO → params é Promise
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado na rota" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const status = body.status as StatusBoleto | undefined;

    if (!status || !["ABERTO", "PAGO", "CANCELADO"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido", received: body.status },
        { status: 400 }
      );
    }

    const atualizado = await prisma.boleto.update({
      where: { id },
      data: { status },
    });

    if (status === StatusBoleto.PAGO || status === StatusBoleto.CANCELADO) {
      const tipo =
        status === StatusBoleto.PAGO
          ? NotificacaoTipo.PAGO
          : NotificacaoTipo.CANCELADO;

      await prisma.notificacao.create({
        data: {
          boletoId: atualizado.id,
          tipo,
          destino: "sistema",
        },
      });
    }

    return NextResponse.json({
      ...atualizado,
      dataVencimento: atualizado.dataVencimento.toISOString(),
      criadoEm: atualizado.criadoEm.toISOString(),
      atualizadoEm: atualizado.atualizadoEm.toISOString(),
    });
  } catch (err: any) {
    console.error("ERRO PATCH:", err);

    return NextResponse.json(
      {
        error: "Erro ao atualizar boleto",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
