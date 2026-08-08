import { PaymentFrequency } from "../value-objects/PaymentFrequency";
import { PatientAgeCategory } from "../value-objects/PatientAgeCategory";
import { WeekDay } from "../value-objects/WeekDay";

export interface RegularSchedule {
  weekDay: WeekDay;
  time: string;
}

export interface BankAccount {
  bankName: string;
  alias: string;
  accountNumber: string;
}

export interface Patient {
  id: string;
  dni: string;
  name: string;
  bankAccounts: BankAccount[];
  ageCategory: PatientAgeCategory;
  age: number;
  parentsNames: string;
  regularSchedules: RegularSchedule[];
  paymentFrequency: PaymentFrequency;
  paymentAmount: number;
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
