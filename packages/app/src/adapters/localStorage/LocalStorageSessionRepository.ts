import { Session, SessionRepository, SessionFilters } from "@consientemente/core";
import { readRows, writeRows } from "./storage";

const TABLE = "sessions";

interface SessionRow {
  id: string;
  patientId: string;
  date: string;
  duration: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class LocalStorageSessionRepository implements SessionRepository {
  async findById(id: string): Promise<Session | null> {
    const row = readRows<SessionRow>(TABLE).find((r) => r.id === id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: SessionFilters): Promise<Session[]> {
    let rows = readRows<SessionRow>(TABLE);
    if (filters?.patientId) rows = rows.filter((r) => r.patientId === filters.patientId);
    if (filters?.status) rows = rows.filter((r) => r.status === filters.status);
    if (filters?.dateFrom) {
      const from = filters.dateFrom.toISOString();
      rows = rows.filter((r) => r.date >= from);
    }
    if (filters?.dateTo) {
      const to = filters.dateTo.toISOString();
      rows = rows.filter((r) => r.date <= to);
    }
    rows.sort((a, b) => b.date.localeCompare(a.date));
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
    const rows = readRows<SessionRow>(TABLE);
    const idx = rows.findIndex((r) => r.id === session.id);
    const row: SessionRow = {
      id: session.id,
      patientId: session.patientId,
      date: session.date.toISOString(),
      duration: session.duration,
      notes: session.notes,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    writeRows(TABLE, rows);
  }

  async delete(id: string): Promise<void> {
    writeRows(TABLE, readRows<SessionRow>(TABLE).filter((r) => r.id !== id));
  }

  private toDomain(row: SessionRow): Session {
    return {
      id: row.id,
      patientId: row.patientId,
      date: new Date(row.date),
      duration: row.duration,
      notes: row.notes,
      status: row.status as any,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}