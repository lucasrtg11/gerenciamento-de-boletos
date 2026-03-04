type Status = "ABERTO" | "PAGO" | "CANCELADO";

export default function StatusBadge({ status }: { status: Status }) {
  const colors: Record<Status, { bg: string; text: string }> = {
    ABERTO: {
      bg: "#1e40af",
      text: "#ffffff",
    },
    PAGO: {
      bg: "#166534",
      text: "#ffffff",
    },
    CANCELADO: {
      bg: "#991b1b",
      text: "#ffffff",
    },
  };

  return (
    <span
      style={{
        background: colors[status].bg,
        color: colors[status].text,
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {status}
    </span>
  );
}
