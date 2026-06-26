import { Payment, PaymentRepository, PaymentFilters } from "@consientemente/core";
import { getDatabase } from "./database";

export class SqlitePaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync("SELECT * FROM payments WHERE id = ?", id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM payments WHERE 1=1";
    const params: any[] = [];
    if (filters?.patientId) { query += " AND patientId=?"; params.push(filters.patientId); }
    if (filters?.status) { query += " AND status=?"; params.push(filters.status); }
    if (filters?.frequency) { query += " AND frequency=?"; params.push(filters.frequency); }
    if (filters?.dateFrom) { query += " AND date>=?"; params.push(filters.dateFrom.toISOString()); }
    if (filters?.dateTo) { query += " AND date<=?"; params.push(filters.dateTo.toISOString()); }
    query += " ORDER BY date DESC";
    const rows: any[] = await db.getAllAsync(query, ...params);
    return rows.map((r) => this.toDomain(r));
  }

  async findByDateRange(from: Date, to: Date): Promise<Payment[]> {
    return this.findAll({ dateFrom: from, dateTo: to });
  }

  async findByPatientId(patientId: string): Promise<Payment[]> {
    return this.findAll({ patientId });
  }

  async findByDate(date: Date): Promise<Payment[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start.getTime() + 86400000);
    return this.findByDateRange(start, end);
  }

  async findPending(): Promise<Payment[]> {
    return this.findAll({ status: "PENDING" as any });
  }

  async save(payment: Payment): Promise<void> {
    const db = await getDatabase();
    const existing = await this.findById(payment.id);
    const cols = ["id","patientId","amount","date","frequency","status","notes",
      "periodStart","periodEnd","paidAt","createdAt","updatedAt"];
    const vals = [payment.id, payment.patientId, payment.amount, payment.date.toISOString(),
      payment.frequency, payment.status, payment.notes,
      payment.periodStart?.toISOString() ?? null,
      payment.periodEnd?.toISOString() ?? null,
      payment.paidAt?.toISOString() ?? null,
      payment.createdAt.toISOString(), payment.updatedAt.toISOString()];
    if (existing) {
      const setClauses = cols.slice(1).map((c) => `${c}=?`).join(",");
      await db.runAsync(`UPDATE payments SET ${setClauses} WHERE id=?`, ...vals.slice(1), payment.id);
    } else {
      const placeholders = cols.map(() => "?").join(",");
      await db.runAsync(`INSERT INTO payments (${cols.join(",")}) VALUES (${placeholders})`, ...vals);
    }
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM payments WHERE id=?", id);
  }

  private toDomain(row: any): Payment {
    return {
      id: row.id,
      patientId: row.patientId,
      amount: row.amount,
      date: new Date(row.date),
      frequency: row.frequency,
      status: row.status,
      notes: row.notes,
      periodStart: row.periodStart ? new Date(row.periodStart) : null,
      periodEnd: row.periodEnd ? new Date(row.periodEnd) : null,
      paidAt: row.paidAt ? new Date(row.paidAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
