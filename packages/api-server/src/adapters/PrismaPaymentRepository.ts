import { Payment, PaymentRepository, PaymentFilters } from "@consientemente/core";
import { PrismaClient } from "@prisma/client";

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Payment | null> {
    const p = await this.prisma.payment.findUnique({ where: { id } });
    return p ? this.toDomain(p) : null;
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    const where: any = {};
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.frequency) where.frequency = filters.frequency;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }
    const payments = await this.prisma.payment.findMany({ where, orderBy: { date: "desc" } });
    return payments.map(this.toDomain);
  }

  async findByDateRange(from: Date, to: Date): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "desc" },
    });
    return payments.map(this.toDomain);
  }

  async findByPatientId(patientId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
    });
    return payments.map(this.toDomain);
  }

  async findByDate(date: Date): Promise<Payment[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start.getTime() + 86400000);
    return this.findByDateRange(start, end);
  }

  async findPending(): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: "PENDING" },
      orderBy: { date: "asc" },
    });
    return payments.map(this.toDomain);
  }

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.upsert({
      where: { id: payment.id },
      update: this.toPrisma(payment),
      create: this.toPrisma(payment),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({ where: { id } });
  }

  private toDomain(p: any): Payment {
    return { ...p, frequency: p.frequency, status: p.status };
  }

  private toPrisma(payment: Payment): any {
    return {
      patientId: payment.patientId,
      amount: payment.amount,
      date: payment.date,
      frequency: payment.frequency,
      status: payment.status,
      notes: payment.notes,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      paidAt: payment.paidAt,
    };
  }
}
