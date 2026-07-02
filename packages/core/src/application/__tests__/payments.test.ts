import { describe, it, expect, vi } from "vitest";
import { RegisterPayment } from "../payments/RegisterPayment";
import { MarkPaymentAsPaid } from "../payments/MarkPaymentAsPaid";
import { GetPaymentsByDateRange } from "../payments/GetPaymentsByDateRange";
import { GetPatientPayments } from "../payments/GetPatientPayments";
import { ExportToCSV } from "../payments/ExportToCSV";
import { GetDashboardData } from "../payments/GetDashboardData";
import { Payment } from "../../domain/entities/Payment";
import { PaymentRepository } from "../../domain/ports/PaymentRepository";
import { SessionRepository } from "../../domain/ports/SessionRepository";
import { PaymentFrequency } from "../../domain/value-objects/PaymentFrequency";
import { PaymentStatus } from "../../domain/value-objects/PaymentStatus";
import { SessionStatus } from "../../domain/value-objects/SessionStatus";

function createMockPaymentRepo(): PaymentRepository {
  const payments = new Map<string, Payment>();
  return {
    findById: vi.fn(async (id: string) => payments.get(id) ?? null),
    findAll: vi.fn(async () => Array.from(payments.values())),
    findByDateRange: vi.fn(async (from: Date, to: Date) =>
      Array.from(payments.values()).filter((p) => p.date >= from && p.date <= to)
    ),
    findByPatientId: vi.fn(async (patientId: string) =>
      Array.from(payments.values()).filter((p) => p.patientId === patientId)
    ),
    findByDate: vi.fn(async (date: Date) =>
      Array.from(payments.values()).filter(
        (p) => p.date.toDateString() === date.toDateString()
      )
    ),
    findPending: vi.fn(async () =>
      Array.from(payments.values()).filter((p) => p.status === PaymentStatus.PENDING)
    ),
    save: vi.fn(async (p: Payment) => { payments.set(p.id, p); }),
    delete: vi.fn(async (id: string) => { payments.delete(id); }),
  };
}

function createMockSessionRepo(): SessionRepository {
  return {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByDateRange: vi.fn(async () => []),
    findByPatientId: vi.fn(),
    findByDate: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
}

describe("RegisterPayment", () => {
  it("creates a payment with PAID status and sets paidAt", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new RegisterPayment(repo);

    const payment = await useCase.execute({
      patientId: "patient-1",
      amount: 100000,
      date: new Date("2026-07-01"),
      frequency: PaymentFrequency.PER_SESSION,
    });

    expect(payment.id).toBeDefined();
    expect(payment.patientId).toBe("patient-1");
    expect(payment.amount).toBe(100000);
    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(payment.paidAt).toBeInstanceOf(Date);
    expect(payment.notes).toBe("");
  });

  it("creates payment with period dates for monthly frequency", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new RegisterPayment(repo);

    const payment = await useCase.execute({
      patientId: "patient-1",
      amount: 500000,
      date: new Date("2026-07-01"),
      frequency: PaymentFrequency.MONTHLY,
      periodStart: new Date("2026-07-01"),
      periodEnd: new Date("2026-07-31"),
    });

    expect(payment.periodStart).toEqual(new Date("2026-07-01"));
    expect(payment.periodEnd).toEqual(new Date("2026-07-31"));
  });
});

describe("MarkPaymentAsPaid", () => {
  it("marks pending payment as paid", async () => {
    const repo = createMockPaymentRepo();
    const register = new RegisterPayment(repo);
    const markPaid = new MarkPaymentAsPaid(repo);

    const defaultPayment: Payment = {
      id: "test-id",
      patientId: "p1",
      amount: 100000,
      date: new Date(),
      frequency: PaymentFrequency.PER_SESSION,
      status: PaymentStatus.PENDING,
      notes: "",
      periodStart: null,
      periodEnd: null,
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(defaultPayment);
    await markPaid.execute("test-id");

    const updated = await repo.findById("test-id");
    expect(updated!.status).toBe(PaymentStatus.PAID);
    expect(updated!.paidAt).toBeInstanceOf(Date);
  });

  it("throws when payment not found", async () => {
    const repo = createMockPaymentRepo();
    const markPaid = new MarkPaymentAsPaid(repo);

    await expect(markPaid.execute("nonexistent")).rejects.toThrow("Payment not found");
  });
});

describe("GetPaymentsByDateRange", () => {
  it("filters payments by date range", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new GetPaymentsByDateRange(repo);

    const p1: Payment = { id: "1", patientId: "p1", amount: 50000, date: new Date("2026-07-01"), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    const p2: Payment = { id: "2", patientId: "p1", amount: 50000, date: new Date("2026-07-15"), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    const p3: Payment = { id: "3", patientId: "p2", amount: 50000, date: new Date("2026-08-01"), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    await repo.save(p1);
    await repo.save(p2);
    await repo.save(p3);

    const result = await useCase.execute(new Date("2026-07-01"), new Date("2026-07-31"));
    expect(result).toHaveLength(2);
  });
});

describe("GetPatientPayments", () => {
  it("returns payments for specific patient", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new GetPatientPayments(repo);

    const p1: Payment = { id: "1", patientId: "p1", amount: 50000, date: new Date(), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    const p2: Payment = { id: "2", patientId: "p2", amount: 50000, date: new Date(), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    await repo.save(p1);
    await repo.save(p2);

    const result = await useCase.execute("p1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

describe("ExportToCSV", () => {
  it("generates CSV header row", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new ExportToCSV(repo);

    const csv = await useCase.execute({});
    const lines = csv.trim().split("\n");

    expect(lines[0]).toBe("ID,PatientID,Amount,Date,Frequency,Status,Notes,PeriodStart,PeriodEnd,PaidAt");
  });

  it("includes payment data in CSV", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new ExportToCSV(repo);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);

    const payment: Payment = {
      id: "csv-1",
      patientId: "p1",
      amount: 100000,
      date: yesterday,
      frequency: PaymentFrequency.PER_SESSION,
      status: PaymentStatus.PAID,
      notes: "Pago normal",
      periodStart: null,
      periodEnd: null,
      paidAt: yesterday,
      createdAt: yesterday,
      updatedAt: yesterday,
    };
    await repo.save(payment);

    const csv = await useCase.execute({});
    const lines = csv.trim().split("\n");

    expect(lines[1]).toContain("csv-1");
    expect(lines[1]).toContain("100000");
    expect(lines[1]).toContain("PER_SESSION");
    expect(lines[1]).toContain("PAID");
    expect(lines[1]).toContain('"Pago normal"');
  });

  it("filters by date range for CSV export", async () => {
    const repo = createMockPaymentRepo();
    const useCase = new ExportToCSV(repo);

    const p1: Payment = { id: "1", patientId: "p1", amount: 50000, date: new Date("2026-07-01"), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    const p2: Payment = { id: "2", patientId: "p1", amount: 50000, date: new Date("2026-08-01"), frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    await repo.save(p1);
    await repo.save(p2);

    const csv = await useCase.execute({ from: new Date("2026-07-01"), to: new Date("2026-07-31") });
    const lines = csv.trim().split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("1");
  });
});

describe("GetDashboardData", () => {
  it("returns today sessions count and pending payments", async () => {
    const paymentRepo = createMockPaymentRepo();
    const sessionRepo = createMockSessionRepo();

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    vi.mocked(sessionRepo.findByDateRange).mockResolvedValue([
      { id: "s1", patientId: "p1", date: today, duration: 50, notes: "", status: SessionStatus.SCHEDULED, createdAt: new Date(), updatedAt: new Date() },
    ]);

    vi.mocked(paymentRepo.findPending).mockResolvedValue([
      { id: "pay1", patientId: "p1", amount: 100000, date: today, frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PENDING, notes: "", periodStart: null, periodEnd: null, paidAt: null, createdAt: new Date(), updatedAt: new Date() },
    ]);

    vi.mocked(paymentRepo.findByDateRange).mockResolvedValue([
      { id: "pay2", patientId: "p1", amount: 50000, date: today, frequency: PaymentFrequency.PER_SESSION, status: PaymentStatus.PAID, notes: "", periodStart: null, periodEnd: null, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    ]);

    const useCase = new GetDashboardData(paymentRepo, sessionRepo);
    const data = await useCase.execute();

    expect(data.todaySessionsCount).toBe(1);
    expect(data.pendingPaymentsCount).toBe(1);
    expect(data.totalCollectedToday).toBe(50000);
  });
});
