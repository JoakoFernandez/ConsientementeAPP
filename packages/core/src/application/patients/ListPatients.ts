import { Patient } from "../../domain/entities/Patient";
import { PatientFilters, PatientRepository } from "../../domain/ports/PatientRepository";

export class ListPatients {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(filters?: PatientFilters): Promise<Patient[]> {
    return this.patientRepo.findAll(filters);
  }
}
