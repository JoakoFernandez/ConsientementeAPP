import { ClinicProfileRepository } from "../../domain/ports/ClinicProfileRepository";
import { ClinicProfile } from "../../domain/entities/ClinicProfile";

export interface SaveClinicProfileInput {
  clinicName: string;
  psychologistName?: string;
}

export class SaveClinicProfile {
  constructor(private readonly repo: ClinicProfileRepository) {}

  async execute(input: SaveClinicProfileInput): Promise<ClinicProfile> {
    const clinicName = input.clinicName.trim();
    if (!clinicName) throw new Error("Clinic name is required");

    const now = new Date();
    const existing = await this.repo.get();
    const profile: ClinicProfile = {
      id: existing?.id ?? "clinic-1",
      clinicName,
      psychologistName: (input.psychologistName ?? "").trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.repo.save(profile);
    return profile;
  }
}