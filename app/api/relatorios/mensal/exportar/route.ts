import { prisma } from "@/app/lib/prisma";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  const mustQuote = /[;"\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mes = Number(searchParams.get("mes"));
  const ano = Number(searchParams.get("ano"));

  if (!Number.isFinite(mes) || mes < 1 || mes > 12) {
    return Response.json({ error: "Parâmetro 'mes' inválido." }, { status: 400 });
  }
  if (!Number.isFinite(ano) || ano < 2000 || ano > 2100) {
    return Response.json({ error: "Parâmetro 'ano' inválido." }, { status: 400 });
  }

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);

  const boletos = await prisma.boleto.findMany({
    where: {
      criadoEm: { gte: inicio, lt: fim },
    },
    orderBy: { criadoEm: "desc" },
    select: {
      clienteNome: true,
      pagadorNome: true,
      valorCentavos: true,
      dataVencimento: true,
      criadoEm: true,
      status: true,
    },
  });

  const sep = ";";
  const header = ["Cliente", "Pagador", "Valor (R$)", "Vencimento", "Emissão", "Status"];

  const rows = boletos.map((b) => {
    const valor = (b.valorCentavos / 100).toFixed(2).replace(".", ",");
    return [
      csvEscape(b.clienteNome ?? ""),
      csvEscape(b.pagadorNome ?? ""),
      csvEscape(valor),
      csvEscape(new Date(b.dataVencimento).toLocaleDateString("pt-BR")),
      csvEscape(new Date(b.criadoEm).toLocaleDateString("pt-BR")),
      csvEscape(b.status),
    ].join(sep);
  });

  const csv = "\uFEFF" + [header.join(sep), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${mes}-${ano}.csv"`,
    },
  });
}