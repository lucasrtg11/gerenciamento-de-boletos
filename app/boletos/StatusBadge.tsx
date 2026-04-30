type Status = "ABERTO" | "PAGO" | "CANCELADO";

export default function StatusBadge({ status }: { status: Status }) {
  const styles: Record<
    Status,
    { bg: string; border: string; text: string }
  > = {
    ABERTO: {
      bg: "rgba(59,130,246,0.12)", // azul leve
      border: "rgba(59,130,246,0.3)",
      text: "#3b82f6",
    },
    PAGO: {
      bg: "rgba(34,197,94,0.12)", // verde leve
      border: "rgba(34,197,94,0.3)",
      text: "#22c55e",
    },
    CANCELADO: {
      bg: "rgba(239,68,68,0.12)", // vermelho leve
      border: "rgba(239,68,68,0.3)",
      text: "#ef4444",
    },
  };

  const s = styles[status];

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
}