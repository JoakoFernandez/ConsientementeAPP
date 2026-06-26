import { Patient } from "../../domain/entities/Patient";
import { PatientRepository } from "../../domain/ports/PatientRepository";

export class UpdatePatient {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(input: UpdatePatientInput): Promise<Patient> {
    const existing = await this.patientRepo.findById(input.id);
    if (!existing) {
      throw new Error("Patient not found");
    }
    const updated: Patient = {
      ...existing,
      ...input.data,
      updatedAt: new Date(),
    };
    await this.patientRepo.save(updated);
    return updated;
  }
}

export interface UpdatePatientInput {
  id: string;
  data: Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>;
}
