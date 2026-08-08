import { Patient, PatientRepository, PatientFilters } from "@consientemente/core";
import { PrismaClient, Prisma } from "@prisma/client";

export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Patient | null> {
    const p = await this.prisma.patient.findUnique({ where: { id } });
    if (!p) return null;
    return this.toDomain(p);
  }

  async findAll(filters?: PatientFilters): Promise<Patient[]> {
    const where: Prisma.PatientWhereInput = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { dni: { contains: filters.search } },
      ];
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    const patients = await this.prisma.patient.findMany({ where, orderBy: { name: "asc" } });
    return patients.map(this.toDomain);
  }

  async save(patient: Patient): Promise<void> {
    await this.prisma.patient.upsert({
      where: { id: patient.id },
      update: this.toPrisma(patient),
      create: this.toPrisma(patient),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patient.update({ where: { id }, data: { isActive: false } });
  }

  private toDomain(p: any): Patient {
    return {
      id: p.id,
      dni: p.dni,
      name: p.name,
      bankAccounts: this.parseBankAccounts(p.bankAccounts),
      ageCategory: p.ageCategory,
      age: p.age,
      parentsNames: p.parentsNames,
      regularSchedules: this.parseSchedules(p.regularSchedules),
      paymentFrequency: p.paymentFrequency,
      paymentAmount: p.paymentAmount,
      notes: p.notes,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private parseSchedules(raw: string | null): Patient["regularSchedules"] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private parseBankAccounts(raw: string | null): Patient["bankAccounts"] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private toPrisma(patient: Patient): any {
    return {
      dni: patient.dni,
      name: patient.name,
      bankAccounts: JSON.stringify(patient.bankAccounts),
      ageCategory: patient.ageCategory,
      age: patient.age,
      parentsNames: patient.parentsNames,
      regularSchedules: JSON.stringify(patient.regularSchedules),
      paymentFrequency: patient.paymentFrequency,
      paymentAmount: patient.paymentAmount,
      notes: patient.notes,
      isActive: patient.isActive,
    };
  }
}
