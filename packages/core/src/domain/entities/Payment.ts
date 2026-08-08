import { PaymentFrequency } from "../value-objects/PaymentFrequency";
import { PaymentStatus } from "../value-objects/PaymentStatus";
import { InvoiceStatus } from "../value-objects/InvoiceStatus";

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: Date;
  frequency: PaymentFrequency;
  status: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  notes: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
