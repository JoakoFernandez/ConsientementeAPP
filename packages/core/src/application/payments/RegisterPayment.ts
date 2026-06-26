import { Payment } from "../../domain/entities/Payment";
import { PaymentRepository } from "../../domain/ports/PaymentRepository";
import { PaymentFrequency } from "../../domain/value-objects/PaymentFrequency";
import { PaymentStatus } from "../../domain/value-objects/PaymentStatus";

export class RegisterPayment {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: RegisterPaymentInput): Promise<Payment> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      amount: input.amount,
      date: input.date,
      frequency: input.frequency,
      status: PaymentStatus.PAID,
      notes: input.notes ?? "",
      periodStart: input.periodStart ?? null,
      periodEnd: input.periodEnd ?? null,
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.paymentRepo.save(payment);
    return payment;
  }
}

export interface RegisterPaymentInput {
  patientId: string;
  amount: number;
  date: Date;
  frequency: PaymentFrequency;
  notes?: string;
  periodStart?: Date;
  periodEnd?: Date;
}
