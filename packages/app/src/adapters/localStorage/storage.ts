const PREFIX = "consientemente_";

export function readRows<T>(table: string): T[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeRows<T>(table: string, rows: T[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(PREFIX + table, JSON.stringify(rows));
  } catch {}
}
