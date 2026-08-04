import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import { colors } from "../theme";

export function currencySymbol(): string {
  return useSettingsStore.getState().currency === "USD" ? "$" : "Gs.";
}

export function formatCurrency(amount: number): string {
  return `${currencySymbol()} ${amount.toLocaleString("es-AR")}`;
}

export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    PER_SESSION: "Por Sesión / Per Session",
    WEEKLY: "Semanal / Weekly",
    MONTHLY: "Mensual / Monthly",
  };
  return labels[frequency] || frequency;
}

export function getWeekDayLabel(weekDay: string): string {
  const labels: Record<string, string> = {
    MONDAY: t("weekday.monday"),
    TUESDAY: t("weekday.tuesday"),
    WEDNESDAY: t("weekday.wednesday"),
    THURSDAY: t("weekday.thursday"),
    FRIDAY: t("weekday.friday"),
    SATURDAY: t("weekday.saturday"),
    SUNDAY: t("weekday.sunday"),
  };
  return labels[weekDay] || weekDay;
}

export function getStatusColor(status: string): string {
  const palette: Record<string, string> = {
    PAID: colors.success,
    PENDING: colors.warning,
    OVERDUE: colors.danger,
    COMPLETED: colors.success,
    SCHEDULED: colors.info,
    CANCELLED: colors.textMuted,
    WAITING_CONFIRMATION: colors.warning,
    CONFIRMED: colors.success,
  };
  return palette[status] || colors.textMuted;
}
