import { Patient } from "../../domain/entities/Patient";
import { PatientRepository } from "../../domain/ports/PatientRepository";

export class GetPatient {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(id: string): Promise<Patient | null> {
    return this.patientRepo.findById(id);
  }
}
