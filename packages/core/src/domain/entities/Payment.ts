import { PaymentFrequency } from "../value-objects/PaymentFrequency";
import { PaymentStatus } from "../value-objects/PaymentStatus";

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: Date;
  frequency: PaymentFrequency;
  status: PaymentStatus;
  notes: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
