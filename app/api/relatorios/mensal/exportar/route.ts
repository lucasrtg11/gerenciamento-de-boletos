import { prisma } from "@/app/lib/prisma";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  // Escapa aspas e envolve em aspas se tiver ; " \n \r
  const mustQuote = /[;"\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

export async function GET() {
  const boletos = await prisma.boleto.findMany({
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

  // Excel pt-BR costuma abrir melhor com ; como separador
  const sep = ";";

  const header = [
    "Cliente",
    "Pagador",
    "Valor (R$)",
    "Vencimento",
    "Emissão",
    "Status",
  ];

  const rows = boletos.map((b) => {
    const valor = (b.valorCentavos / 100).toFixed(2).replace(".", ","); // padrão BR
    return [
      csvEscape(b.clienteNome ?? ""),
      csvEscape(b.pagadorNome ?? ""),
      csvEscape(valor),
      csvEscape(new Date(b.dataVencimento).toLocaleDateString("pt-BR")),
      csvEscape(new Date(b.criadoEm).toLocaleDateString("pt-BR")),
      csvEscape(b.status),
    ].join(sep);
  });

  // BOM ajuda o Excel a reconhecer UTF-8
  const csv = "\uFEFF" + [header.join(sep), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="relatorio-boletos.csv"',
    },
  });
}