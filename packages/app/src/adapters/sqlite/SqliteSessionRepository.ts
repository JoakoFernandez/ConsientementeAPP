import { Session, SessionRepository, SessionFilters } from "@consientemente/core";
import { getDatabase } from "./database";

export class SqliteSessionRepository implements SessionRepository {
  async findById(id: string): Promise<Session | null> {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync("SELECT * FROM sessions WHERE id = ?", id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: SessionFilters): Promise<Session[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM sessions WHERE 1=1";
    const params: any[] = [];
    if (filters?.patientId) { query += " AND patientId=?"; params.push(filters.patientId); }
    if (filters?.status) { query += " AND status=?"; params.push(filters.status); }
    if (filters?.dateFrom) { query += " AND date>=?"; params.push(filters.dateFrom.toISOString()); }
    if (filters?.dateTo) { query += " AND date<=?"; params.push(filters.dateTo.toISOString()); }
    query += " ORDER BY date ASC";
    const rows: any[] = await db.getAllAsync(query, ...params);
    return rows.map((r) => this.toDomain(r));
  }

  async findByDateRange(from: Date, to: Date): Promise<Session[]> {
    return this.findAll({ dateFrom: from, dateTo: to });
  }

  async findByPatientId(patientId: string): Promise<Session[]> {
    return this.findAll({ patientId });
  }

  async findByDate(date: Date): Promise<Session[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start.getTime() + 86400000);
    return this.findByDateRange(start, end);
  }

  async save(session: Session): Promise<void> {
    const db = await getDatabase();
    const existing = await this.findById(session.id);
    const cols = ["id","patientId","date","duration","notes","status","createdAt","updatedAt"];
    const vals = [session.id, session.patientId, session.date.toISOString(), session.duration,
      session.notes, session.status, session.createdAt.toISOString(), session.updatedAt.toISOString()];
    if (existing) {
      const setClauses = cols.slice(1).map((c) => `${c}=?`).join(",");
      await db.runAsync(`UPDATE sessions SET ${setClauses} WHERE id=?`, ...vals.slice(1), session.id);
    } else {
      const placeholders = cols.map(() => "?").join(",");
      await db.runAsync(`INSERT INTO sessions (${cols.join(",")}) VALUES (${placeholders})`, ...vals);
    }
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sessions WHERE id=?", id);
  }

  private toDomain(row: any): Session {
    return {
      id: row.id,
      patientId: row.patientId,
      date: new Date(row.date),
      duration: row.duration,
      notes: row.notes,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
