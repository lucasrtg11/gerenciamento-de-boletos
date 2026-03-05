import { prisma } from "@/app/lib/prisma";

type StatusFiltro = "TODOS" | "ABERTO" | "PAGO" | "CANCELADO" | "ATRASADO";

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
  const status = (searchParams.get("status") || "TODOS") as StatusFiltro;

  if (!Number.isFinite(mes) || mes < 1 || mes > 12) {
    return Response.json({ error: "Parâmetro 'mes' inválido." }, { status: 400 });
  }
  if (!Number.isFinite(ano) || ano < 2000 || ano > 2100) {
    return Response.json({ error: "Parâmetro 'ano' inválido." }, { status: 400 });
  }

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);
  const hoje = new Date();

  // Filtra por mês/ano usando criadoEm (igual seu relatório mensal atual).
  // Se preferir por dataVencimento, eu ajusto.
  const whereBase: any = {
    criadoEm: { gte: inicio, lt: fim },
  };

  // Status normal (ABERTO/PAGO/CANCELADO)
  if (status === "ABERTO" || status === "PAGO" || status === "CANCELADO") {
    whereBase.status = status;
  }

  // ATRASADO = ABERTO com vencimento < hoje
  if (status === "ATRASADO") {
    whereBase.status = "ABERTO";
    whereBase.dataVencimento = { lt: hoje };
  }

  const boletos = await prisma.boleto.findMany({
    where: whereBase,
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
    const statusCsv =
      status === "ATRASADO" && b.status === "ABERTO" ? "ATRASADO" : b.status;

    return [
      csvEscape(b.clienteNome ?? ""),
      csvEscape(b.pagadorNome ?? ""),
      csvEscape(valor),
      csvEscape(new Date(b.dataVencimento).toLocaleDateString("pt-BR")),
      csvEscape(new Date(b.criadoEm).toLocaleDateString("pt-BR")),
      csvEscape(statusCsv),
    ].join(sep);
  });

  const csv = "\uFEFF" + [header.join(sep), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${mes}-${ano}-${status}.csv"`,
    },
  });
}