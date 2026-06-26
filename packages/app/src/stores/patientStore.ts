import { create } from "zustand";
import { Patient } from "@consientemente/core";
import { RegisterPatient, UpdatePatient, DeletePatient, GetPatient, ListPatients } from "@consientemente/core";
import { SqlitePatientRepository } from "../adapters/sqlite/SqlitePatientRepository";

const repo = new SqlitePatientRepository();
const registerUseCase = new RegisterPatient(repo);
const updateUseCase = new UpdatePatient(repo);
const deleteUseCase = new DeletePatient(repo);
const getUseCase = new GetPatient(repo);
const listUseCase = new ListPatients(repo);

interface PatientState {
  patients: Patient[];
  loading: boolean;
  load: () => Promise<void>;
  search: (query: string) => Promise<void>;
  getById: (id: string) => Promise<Patient | null>;
  create: (input: Parameters<typeof registerUseCase.execute>[0]) => Promise<Patient>;
  update: (input: Parameters<typeof updateUseCase.execute>[0]) => Promise<Patient>;
  remove: (id: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const patients = await listUseCase.execute();
    set({ patients, loading: false });
  },
  search: async (query: string) => {
    const patients = await listUseCase.execute({ search: query });
    set({ patients });
  },
  getById: async (id: string) => getUseCase.execute(id),
  create: async (input) => {
    const patient = await registerUseCase.execute(input);
    set((state) => ({ patients: [...state.patients, patient] }));
    return patient;
  },
  update: async (input) => {
    const patient = await updateUseCase.execute(input);
    set((state) => ({
      patients: state.patients.map((p) => (p.id === input.id ? patient : p)),
    }));
    return patient;
  },
  remove: async (id: string) => {
    await deleteUseCase.execute(id);
    set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
  },
}));
