import { getLanguage } from "../i18n";

export function getLocale(): string {
  const l = getLanguage();
  return l === "it" ? "it-IT" : l === "en" ? "en-US" : "es-AR";
}

export function getMonthNames(): string[] {
  const names = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(getLocale(), { month: "long" }).format(new Date(2000, i, 1))
  );
  return names.map((n) => n.charAt(0).toUpperCase() + n.slice(1));
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(date: Date, month: Date): boolean {
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(getLocale(), { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(getLocale(), { hour: "2-digit", minute: "2-digit" });
}

export function getWeekRange(date: Date): { from: Date; to: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const from = new Date(date.getFullYear(), date.getMonth(), diff);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  return { from, to };
}

export function getMonthRange(date: Date): { from: Date; to: Date } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from, to };
}
