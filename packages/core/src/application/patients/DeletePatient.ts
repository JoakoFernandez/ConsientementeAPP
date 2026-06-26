import { PatientRepository } from "../../domain/ports/PatientRepository";

export class DeletePatient {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(id: string): Promise<void> {
    await this.patientRepo.delete(id);
  }
}
