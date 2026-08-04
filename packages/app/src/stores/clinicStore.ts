import { create } from "zustand";
import { ClinicProfile } from "@consientemente/core";
import { GetClinicProfile, SaveClinicProfile } from "@consientemente/core";
import { createClinicProfileRepository } from "../adapters/repositoryFactory";

const repo = createClinicProfileRepository();
const getUseCase = new GetClinicProfile(repo);
const saveUseCase = new SaveClinicProfile(repo);

interface ClinicState {
  profile: ClinicProfile | null;
  loading: boolean;
  load: () => Promise<void>;
  save: (input: { clinicName: string; psychologistName?: string }) => Promise<ClinicProfile>;
}

export const useClinicStore = create<ClinicState>((set) => ({
  profile: null,
  loading: true,
  load: async () => {
    const profile = await getUseCase.execute();
    set({ profile, loading: false });
  },
  save: async (input) => {
    const profile = await saveUseCase.execute(input);
    set({ profile });
    return profile;
  },
}));