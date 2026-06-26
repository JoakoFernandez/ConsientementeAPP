import { Session, SessionRepository, SessionFilters } from "@consientemente/core";
import { PrismaClient } from "@prisma/client";

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Session | null> {
    const s = await this.prisma.session.findUnique({ where: { id } });
    return s ? this.toDomain(s) : null;
  }

  async findAll(filters?: SessionFilters): Promise<Session[]> {
    const where: any = {};
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }
    const sessions = await this.prisma.session.findMany({ where, orderBy: { date: "asc" } });
    return sessions.map(this.toDomain);
  }

  async findByDateRange(from: Date, to: Date): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
    return sessions.map(this.toDomain);
  }

  async findByPatientId(patientId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
    });
    return sessions.map(this.toDomain);
  }

  async findByDate(date: Date): Promise<Session[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start.getTime() + 86400000);
    return this.findByDateRange(start, end);
  }

  async save(session: Session): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: session.id },
      update: this.toPrisma(session),
      create: this.toPrisma(session),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  private toDomain(s: any): Session {
    return { ...s, status: s.status };
  }

  private toPrisma(session: Session): any {
    return {
      patientId: session.patientId,
      date: session.date,
      duration: session.duration,
      notes: session.notes,
      status: session.status,
    };
  }
}
