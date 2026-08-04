import { Platform } from "react-native";
import {
  PatientRepository,
  SessionRepository,
  PaymentRepository,
  ClinicProfileRepository,
} from "@consientemente/core";
import { SqlitePatientRepository } from "./sqlite/SqlitePatientRepository";
import { SqliteSessionRepository } from "./sqlite/SqliteSessionRepository";
import { SqlitePaymentRepository } from "./sqlite/SqlitePaymentRepository";
import { SqliteClinicProfileRepository } from "./sqlite/SqliteClinicProfileRepository";
import { LocalStoragePatientRepository } from "./localStorage/LocalStoragePatientRepository";
import { LocalStorageSessionRepository } from "./localStorage/LocalStorageSessionRepository";
import { LocalStoragePaymentRepository } from "./localStorage/LocalStoragePaymentRepository";
import { LocalStorageClinicProfileRepository } from "./localStorage/LocalStorageClinicProfileRepository";

export const isWeb = Platform.OS === "web";

export function createPatientRepository(): PatientRepository {
  return isWeb ? new LocalStoragePatientRepository() : new SqlitePatientRepository();
}

export function createSessionRepository(): SessionRepository {
  return isWeb ? new LocalStorageSessionRepository() : new SqliteSessionRepository();
}

export function createPaymentRepository(): PaymentRepository {
  return isWeb ? new LocalStoragePaymentRepository() : new SqlitePaymentRepository();
}

export function createClinicProfileRepository(): ClinicProfileRepository {
  return isWeb ? new LocalStorageClinicProfileRepository() : new SqliteClinicProfileRepository();
}