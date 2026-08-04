import { describe, it, expect, vi } from "vitest";
import { GetClinicProfile } from "../clinic/GetClinicProfile";
import { SaveClinicProfile } from "../clinic/SaveClinicProfile";
import { ClinicProfile } from "../../domain/entities/ClinicProfile";
import { ClinicProfileRepository } from "../../domain/ports/ClinicProfileRepository";

function createMockRepo(): ClinicProfileRepository & { _get: () => ClinicProfile | null } {
  let profile: ClinicProfile | null = null;
  return {
    get: vi.fn(async () => profile),
    save: vi.fn(async (p: ClinicProfile) => { profile = p; }),
    _get: () => profile,
  };
}

describe("GetClinicProfile", () => {
  it("returns null when no profile exists", async () => {
    const repo = createMockRepo();
    const useCase = new GetClinicProfile(repo);
    await expect(useCase.execute()).resolves.toBeNull();
  });

  it("returns the saved profile", async () => {
    const repo = createMockRepo();
    const save = new SaveClinicProfile(repo);
    const saved = await save.execute({ clinicName: "Centro Paz" });
    const get = new GetClinicProfile(repo);
    await expect(get.execute()).resolves.toEqual(saved);
  });
});

describe("SaveClinicProfile", () => {
  it("creates a profile with clinic and psychologist name", async () => {
    const repo = createMockRepo();
    const useCase = new SaveClinicProfile(repo);
    const profile = await useCase.execute({
      clinicName: "Centro Paz",
      psychologistName: "Lic. Ana",
    });
    expect(profile.clinicName).toBe("Centro Paz");
    expect(profile.psychologistName).toBe("Lic. Ana");
    expect(profile.id).toBe("clinic-1");
  });

  it("trims and defaults psychologist name", async () => {
    const repo = createMockRepo();
    const useCase = new SaveClinicProfile(repo);
    const profile = await useCase.execute({ clinicName: "   Centro   " });
    expect(profile.clinicName).toBe("Centro");
    expect(profile.psychologistName).toBe("");
  });

  it("rejects an empty clinic name", async () => {
    const repo = createMockRepo();
    const useCase = new SaveClinicProfile(repo);
    await expect(useCase.execute({ clinicName: "   " })).rejects.toThrow("required");
  });

  it("keeps the id and createdAt across updates", async () => {
    const repo = createMockRepo();
    const useCase = new SaveClinicProfile(repo);
    const first = await useCase.execute({ clinicName: "Centro A" });
    const second = await useCase.execute({ clinicName: "Centro B" });
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toEqual(first.createdAt);
  });
});