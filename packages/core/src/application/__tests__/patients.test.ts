import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterPatient } from "../patients/RegisterPatient";
import { UpdatePatient } from "../patients/UpdatePatient";
import { DeletePatient } from "../patients/DeletePatient";
import { GetPatient } from "../patients/GetPatient";
import { ListPatients } from "../patients/ListPatients";
import { Patient } from "../../domain/entities/Patient";
import { PatientRepository } from "../../domain/ports/PatientRepository";
import { PatientAgeCategory } from "../../domain/value-objects/PatientAgeCategory";
import { PaymentFrequency } from "../../domain/value-objects/PaymentFrequency";

function createMockRepo(): PatientRepository {
  const patients = new Map<string, Patient>();
  return {
    findById: vi.fn(async (id: string) => patients.get(id) ?? null),
    findAll: vi.fn(async () => Array.from(patients.values())),
    save: vi.fn(async (p: Patient) => { patients.set(p.id, p); }),
    delete: vi.fn(async (id: string) => { patients.delete(id); }),
  };
}

const validInput = {
  dni: "1234567",
  name: "Juan Pérez",
  bankAccount: "123-456-789",
  ageCategory: PatientAgeCategory.ADULT,
  age: 30,
  parentsNames: "María y Pedro",
  regularSchedule: null,
  paymentFrequency: PaymentFrequency.PER_SESSION,
  paymentAmount: 100000,
  notes: "",
};

describe("RegisterPatient", () => {
  it("creates a patient with all fields", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterPatient(repo);

    const patient = await useCase.execute(validInput);

    expect(patient.id).toBeDefined();
    expect(patient.dni).toBe("1234567");
    expect(patient.name).toBe("Juan Pérez");
    expect(patient.bankAccount).toBe("123-456-789");
    expect(patient.ageCategory).toBe(PatientAgeCategory.ADULT);
    expect(patient.age).toBe(30);
    expect(patient.parentsNames).toBe("María y Pedro");
    expect(patient.paymentFrequency).toBe(PaymentFrequency.PER_SESSION);
    expect(patient.paymentAmount).toBe(100000);
    expect(patient.isActive).toBe(true);
    expect(patient.createdAt).toBeInstanceOf(Date);
    expect(patient.updatedAt).toBeInstanceOf(Date);
  });

  it("saves the patient to the repository", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterPatient(repo);

    const patient = await useCase.execute(validInput);

    expect(repo.save).toHaveBeenCalledWith(patient);
    const saved = await repo.findById(patient.id);
    expect(saved).not.toBeNull();
  });

  it("creates patient with regular schedule", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterPatient(repo);

    const patient = await useCase.execute({
      ...validInput,
      regularSchedule: { weekDay: "TUESDAY" as any, time: "09:00" },
    });

    expect(patient.regularSchedule).toEqual({ weekDay: "TUESDAY", time: "09:00" });
  });

  it("creates patient with WEEKLY frequency", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterPatient(repo);

    const patient = await useCase.execute({
      ...validInput,
      paymentFrequency: PaymentFrequency.WEEKLY,
      paymentAmount: 400000,
    });

    expect(patient.paymentFrequency).toBe(PaymentFrequency.WEEKLY);
    expect(patient.paymentAmount).toBe(400000);
  });

  it("creates patient with MONTHLY frequency", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterPatient(repo);

    const patient = await useCase.execute({
      ...validInput,
      paymentFrequency: PaymentFrequency.MONTHLY,
      paymentAmount: 1600000,
    });

    expect(patient.paymentFrequency).toBe(PaymentFrequency.MONTHLY);
    expect(patient.paymentAmount).toBe(1600000);
  });
});

describe("UpdatePatient", () => {
  it("updates existing patient fields", async () => {
    const repo = createMockRepo();
    const register = new RegisterPatient(repo);
    const update = new UpdatePatient(repo);

    const created = await register.execute(validInput);
    const updated = await update.execute({
      id: created.id,
      data: { name: "Carlos López", paymentAmount: 150000 },
    });

    expect(updated.name).toBe("Carlos López");
    expect(updated.paymentAmount).toBe(150000);
    expect(updated.dni).toBe("1234567");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it("throws when patient not found", async () => {
    const repo = createMockRepo();
    const update = new UpdatePatient(repo);

    await expect(update.execute({ id: "nonexistent", data: { name: "X" } })).rejects.toThrow("Patient not found");
  });
});

describe("GetPatient", () => {
  it("returns patient by id", async () => {
    const repo = createMockRepo();
    const register = new RegisterPatient(repo);
    const get = new GetPatient(repo);

    const created = await register.execute(validInput);
    const found = await get.execute(created.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it("returns null for nonexistent id", async () => {
    const repo = createMockRepo();
    const get = new GetPatient(repo);

    const found = await get.execute("nonexistent");
    expect(found).toBeNull();
  });
});

describe("ListPatients", () => {
  it("returns all patients", async () => {
    const repo = createMockRepo();
    const register = new RegisterPatient(repo);
    const list = new ListPatients(repo);

    await register.execute(validInput);
    await register.execute({ ...validInput, dni: "7654321", name: "Ana García" });

    const all = await list.execute();
    expect(all).toHaveLength(2);
  });

  it("returns empty array when no patients", async () => {
    const repo = createMockRepo();
    const list = new ListPatients(repo);

    const all = await list.execute();
    expect(all).toHaveLength(0);
  });
});

describe("DeletePatient", () => {
  it("soft deletes a patient", async () => {
    const repo = createMockRepo();
    const register = new RegisterPatient(repo);
    const del = new DeletePatient(repo);

    const created = await register.execute(validInput);
    await del.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });
});
