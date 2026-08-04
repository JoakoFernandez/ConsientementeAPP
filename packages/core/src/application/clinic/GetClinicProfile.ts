import { ClinicProfileRepository } from "../../domain/ports/ClinicProfileRepository";
import { ClinicProfile } from "../../domain/entities/ClinicProfile";

export class GetClinicProfile {
  constructor(private readonly repo: ClinicProfileRepository) {}

  async execute(): Promise<ClinicProfile | null> {
    return this.repo.get();
  }
}