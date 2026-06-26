import { Patient } from "../entities/Patient";

export interface PatientFilters {
  search?: string;
  isActive?: boolean;
}

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findAll(filters?: PatientFilters): Promise<Patient[]>;
  save(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
}
