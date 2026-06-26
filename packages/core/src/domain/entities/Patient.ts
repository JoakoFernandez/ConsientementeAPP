import { PaymentFrequency } from "../value-objects/PaymentFrequency";
import { PatientAgeCategory } from "../value-objects/PatientAgeCategory";
import { WeekDay } from "../value-objects/WeekDay";

export interface RegularSchedule {
  weekDay: WeekDay;
  time: string;
}

export interface Patient {
  id: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
