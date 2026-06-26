const CURRENCY = "Gs.";

export function formatCurrency(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString("es-PY")}`;
}

export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    PER_SESSION: "Por Sesión / Per Session",
    WEEKLY: "Semanal / Weekly",
    MONTHLY: "Mensual / Monthly",
  };
  return labels[frequency] || frequency;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PAID: "#27ae60",
    PENDING: "#f39c12",
    OVERDUE: "#e74c3c",
    COMPLETED: "#27ae60",
    SCHEDULED: "#3498db",
    CANCELLED: "#95a5a6",
  };
  return colors[status] || "#95a5a6";
}
