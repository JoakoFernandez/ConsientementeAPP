import { ClinicProfile, ClinicProfileRepository } from "@consientemente/core";
import { readRows, writeRows } from "./storage";

const TABLE = "clinic_profile";

interface ClinicRow {
  id: string;
  clinicName: string;
  psychologistName: string;
  createdAt: string;
  updatedAt: string;
}

export class LocalStorageClinicProfileRepository implements ClinicProfileRepository {
  async get(): Promise<ClinicProfile | null> {
    const row = readRows<ClinicRow>(TABLE)[0];
    return row ? this.toDomain(row) : null;
  }

  async save(profile: ClinicProfile): Promise<void> {
    const row: ClinicRow = {
      id: profile.id,
      clinicName: profile.clinicName,
      psychologistName: profile.psychologistName,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
    writeRows(TABLE, [row]);
  }

  private toDomain(row: ClinicRow): ClinicProfile {
    return {
      id: row.id,
      clinicName: row.clinicName,
      psychologistName: row.psychologistName,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}