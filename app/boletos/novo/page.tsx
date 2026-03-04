import NovoBoletoForm from "../NovoBoletoForm";
import DashboardResumo from "../DashboardResumo";
import LogoutButton from "../LogoutButton";
import Link from "next/link";

type Status = "ABERTO" | "PAGO" | "CANCELADO";

type BoletoDTO = {
  id: string;
  valorCentavos: number;
  status: Status;
  dataVencimento: string;
};

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/boletos", {
    cache: "no-store",
  });

  const boletos: BoletoDTO[] = await res.json();

  return (
    <main style={{ padding: 24 }}>
      
      {/* Topo */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        {/* vazio para manter alinhamento */}
        <div />

        <div style={{ display: "flex", gap: 10 }}>
          
          <Link href="/boletos">
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "transparent",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              BOLETOS GERADOS
            </button>
          </Link>

          <LogoutButton />
        </div>
      </div>

      <NovoBoletoForm />

      <DashboardResumo boletos={boletos} />
    </main>
  );
}