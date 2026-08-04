import { ClinicProfile } from "../entities/ClinicProfile";

export interface ClinicProfileRepository {
  get(): Promise<ClinicProfile | null>;
  save(profile: ClinicProfile): Promise<void>;
}