import { Patient, PatientRepository, PatientFilters } from "@consientemente/core";
import { readRows, writeRows } from "./storage";

const TABLE = "patients";

interface PatientRow {
  id: string;
  dni: string;
  name: string;
  bankAccount: string;
  ageCategory: string;
  age: number;
  parentsNames: string;
  regularWeekDay: string | null;
  regularTime: string | null;
  paymentFrequency: string;
  paymentAmount: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class LocalStoragePatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const row = readRows<PatientRow>(TABLE).find((r) => r.id === id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: PatientFilters): Promise<Patient[]> {
    let rows = readRows<PatientRow>(TABLE).filter((r) => r.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.dni.toLowerCase().includes(q));
    }
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows.map((r) => this.toDomain(r));
  }

  async save(patient: Patient): Promise<void> {
    const rows = readRows<PatientRow>(TABLE);
    const idx = rows.findIndex((r) => r.id === patient.id);
    const row: PatientRow = {
      id: patient.id,
      dni: patient.dni,
      name: patient.name,
      bankAccount: patient.bankAccount,
      ageCategory: patient.ageCategory,
      age: patient.age,
      parentsNames: patient.parentsNames,
      regularWeekDay: patient.regularSchedule?.weekDay ?? null,
      regularTime: patient.regularSchedule?.time ?? null,
      paymentFrequency: patient.paymentFrequency,
      paymentAmount: patient.paymentAmount,
      notes: patient.notes,
      isActive: patient.isActive,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    writeRows(TABLE, rows);
  }

  async delete(id: string): Promise<void> {
    const rows = readRows<PatientRow>(TABLE).map((r) =>
      r.id === id ? { ...r, isActive: false, updatedAt: new Date().toISOString() } : r
    );
    writeRows(TABLE, rows);
  }

  private toDomain(row: PatientRow): Patient {
    return {
      id: row.id,
      dni: row.dni,
      name: row.name,
      bankAccount: row.bankAccount,
      ageCategory: row.ageCategory as any,
      age: row.age,
      parentsNames: row.parentsNames,
      regularSchedule: row.regularWeekDay ? { weekDay: row.regularWeekDay as any, time: row.regularTime ?? "" } : null,
      paymentFrequency: row.paymentFrequency as any,
      paymentAmount: row.paymentAmount,
      notes: row.notes,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}