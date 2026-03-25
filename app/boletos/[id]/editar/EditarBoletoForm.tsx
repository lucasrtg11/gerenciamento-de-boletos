"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  boleto: {
    id: string;
    numeroBoleto: string;
    clienteNome: string;
    pagadorNome: string;
    valorCentavos: number;
    dataVencimento: string;
  };
};

export default function EditarBoletoForm({ boleto }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(boleto);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "valorCentavos" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/boletos/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Erro ao editar boleto");
      setLoading(false);
      return;
    }

    router.push("/boletos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
      <div>
        <label className="mb-1 block font-semibold text-black">Número do boleto</label>
        <input
          name="numeroBoleto"
          value={form.numeroBoleto}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold text-black">Cliente</label>
        <input
          name="clienteNome"
          value={form.clienteNome}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold text-black">Pagador</label>
        <input
          name="pagadorNome"
          value={form.pagadorNome}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold text-black">Valor em centavos</label>
        <input
          type="number"
          name="valorCentavos"
          value={form.valorCentavos}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold text-black">Data de vencimento</label>
        <input
          type="date"
          name="dataVencimento"
          value={form.dataVencimento}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 font-semibold text-white"
      >
        {loading ? "SALVANDO..." : "SALVAR"}
      </button>
    </form>
  );
}