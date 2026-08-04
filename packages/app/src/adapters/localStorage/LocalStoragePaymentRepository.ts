import { Payment, PaymentRepository, PaymentFilters } from "@consientemente/core";
import { readRows, writeRows } from "./storage";

const TABLE = "payments";

interface PaymentRow {
  id: string;
  patientId: string;
  amount: number;
  date: string;
  frequency: string;
  status: string;
  notes: string;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class LocalStoragePaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const row = readRows<PaymentRow>(TABLE).find((r) => r.id === id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    let rows = readRows<PaymentRow>(TABLE);
    if (filters?.patientId) rows = rows.filter((r) => r.patientId === filters.patientId);
    if (filters?.status) rows = rows.filter((r) => r.status === filters.status);
    if (filters?.frequency) rows = rows.filter((r) => r.frequency === filters.frequency);
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
    const rows = readRows<PaymentRow>(TABLE);
    const idx = rows.findIndex((r) => r.id === payment.id);
    const row: PaymentRow = {
      id: payment.id,
      patientId: payment.patientId,
      amount: payment.amount,
      date: payment.date.toISOString(),
      frequency: payment.frequency,
      status: payment.status,
      notes: payment.notes,
      periodStart: payment.periodStart ? payment.periodStart.toISOString() : null,
      periodEnd: payment.periodEnd ? payment.periodEnd.toISOString() : null,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    writeRows(TABLE, rows);
  }

  async delete(id: string): Promise<void> {
    writeRows(TABLE, readRows<PaymentRow>(TABLE).filter((r) => r.id !== id));
  }

  private toDomain(row: PaymentRow): Payment {
    return {
      id: row.id,
      patientId: row.patientId,
      amount: row.amount,
      date: new Date(row.date),
      frequency: row.frequency as any,
      status: row.status as any,
      notes: row.notes,
      periodStart: row.periodStart ? new Date(row.periodStart) : null,
      periodEnd: row.periodEnd ? new Date(row.periodEnd) : null,
      paidAt: row.paidAt ? new Date(row.paidAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}