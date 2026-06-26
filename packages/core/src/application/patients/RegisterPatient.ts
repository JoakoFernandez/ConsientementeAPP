import { Patient, RegularSchedule } from "../../domain/entities/Patient";
import { PatientRepository } from "../../domain/ports/PatientRepository";
import { PatientAgeCategory } from "../../domain/value-objects/PatientAgeCategory";
import { PaymentFrequency } from "../../domain/value-objects/PaymentFrequency";

export class RegisterPatient {
  constructor(private readonly patientRepo: PatientRepository) {}

  async execute(input: RegisterPatientInput): Promise<Patient> {
    const patient: Patient = {
      id: crypto.randomUUID(),
      dni: input.dni,
      name: input.name,
      bankAccount: input.bankAccount,
      ageCategory: input.ageCategory,
      age: input.age,
      parentsNames: input.parentsNames,
      regularSchedule: input.regularSchedule ?? null,
      paymentFrequency: input.paymentFrequency,
      paymentAmount: input.paymentAmount,
      notes: input.notes,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.patientRepo.save(patient);
    return patient;
  }
}

export interface RegisterPatientInput {
  dni: string;
  name: string;
  bankAccount: string;
  ageCategory: PatientAgeCategory;
  age: number;
  parentsNames: string;
  regularSchedule: RegularSchedule | null;
  paymentFrequency: PaymentFrequency;
  paymentAmount: number;
  notes: string;
}
