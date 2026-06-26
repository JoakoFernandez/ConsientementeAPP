import { Payment } from "../entities/Payment";
import { PaymentStatus } from "../value-objects/PaymentStatus";

export interface PaymentFilters {
  patientId?: string;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  frequency?: string;
}

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findAll(filters?: PaymentFilters): Promise<Payment[]>;
  findByDateRange(from: Date, to: Date): Promise<Payment[]>;
  findByPatientId(patientId: string): Promise<Payment[]>;
  findByDate(date: Date): Promise<Payment[]>;
  findPending(): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
  delete(id: string): Promise<void>;
}
