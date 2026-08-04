import { ClinicProfile, ClinicProfileRepository } from "@consientemente/core";
import { getDatabase } from "./database";

export class SqliteClinicProfileRepository implements ClinicProfileRepository {
  async get(): Promise<ClinicProfile | null> {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync("SELECT * FROM clinic_profile LIMIT 1");
    return row ? this.toDomain(row) : null;
  }

  async save(profile: ClinicProfile): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO clinic_profile (id, clinicName, psychologistName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         clinicName = excluded.clinicName,
         psychologistName = excluded.psychologistName,
         updatedAt = excluded.updatedAt`,
      profile.id,
      profile.clinicName,
      profile.psychologistName,
      profile.createdAt.toISOString(),
      profile.updatedAt.toISOString()
    );
  }

  private toDomain(row: any): ClinicProfile {
    return {
      id: row.id,
      clinicName: row.clinicName,
      psychologistName: row.psychologistName,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}