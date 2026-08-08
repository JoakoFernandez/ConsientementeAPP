import { Patient, PatientRepository, PatientFilters, RegularSchedule, BankAccount } from "@consientemente/core";
import * as SQLite from "expo-sqlite";
import { getDatabase } from "./database";

export class SqlitePatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync("SELECT * FROM patients WHERE id = ?", id);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: PatientFilters): Promise<Patient[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM patients WHERE isActive = 1";
    const params: any[] = [];
    if (filters?.search) {
      query += " AND (name LIKE ? OR dni LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    query += " ORDER BY name ASC";
    const rows: any[] = await db.getAllAsync(query, ...params);
    return rows.map((r) => this.toDomain(r));
  }

  async save(patient: Patient): Promise<void> {
    const db = await getDatabase();
    const existing = await this.findById(patient.id);
    const cols = [
      "id", "dni", "name", "bankAccounts", "ageCategory", "age",
      "parentsNames", "regularSchedules", "paymentFrequency",
      "paymentAmount", "notes", "isActive", "createdAt", "updatedAt",
    ];
    const vals = [
      patient.id, patient.dni, patient.name, JSON.stringify(patient.bankAccounts),
      patient.ageCategory, patient.age, patient.parentsNames,
      JSON.stringify(patient.regularSchedules),
      patient.paymentFrequency, patient.paymentAmount, patient.notes,
      patient.isActive ? 1 : 0,
      patient.createdAt.toISOString(), patient.updatedAt.toISOString(),
    ];
    if (existing) {
      const setClauses = cols.slice(1).map((c) => `${c}=?`).join(",");
      await db.runAsync(`UPDATE patients SET ${setClauses} WHERE id=?`, ...vals.slice(1), patient.id);
    } else {
      const placeholders = cols.map(() => "?").join(",");
      await db.runAsync(`INSERT INTO patients (${cols.join(",")}) VALUES (${placeholders})`, ...vals);
    }
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE patients SET isActive=0, updatedAt=? WHERE id=?", new Date().toISOString(), id);
  }

  private parseSchedules(row: any): RegularSchedule[] {
    if (row.regularSchedules) {
      try {
        const parsed = JSON.parse(row.regularSchedules);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* fall through to legacy */
      }
    }
    if (row.regularWeekDay && row.regularTime) {
      return [{ weekDay: row.regularWeekDay, time: row.regularTime }];
    }
    return [];
  }

  private parseBankAccounts(row: any): BankAccount[] {
    if (row.bankAccounts) {
      try {
        const parsed = JSON.parse(row.bankAccounts);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* fall through to legacy */
      }
    }
    if (row.bankAccount) {
      return [{ bankName: "", alias: "", accountNumber: row.bankAccount }];
    }
    return [];
  }

  private toDomain(row: any): Patient {
    return {
      id: row.id,
      dni: row.dni,
      name: row.name,
      bankAccounts: this.parseBankAccounts(row),
      ageCategory: row.ageCategory,
      age: row.age,
      parentsNames: row.parentsNames,
      regularSchedules: this.parseSchedules(row),
      paymentFrequency: row.paymentFrequency,
      paymentAmount: row.paymentAmount,
      notes: row.notes,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
