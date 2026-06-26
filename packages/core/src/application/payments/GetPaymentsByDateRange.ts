import { Payment } from "../../domain/entities/Payment";
import { PaymentRepository } from "../../domain/ports/PaymentRepository";

export class GetPaymentsByDateRange {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(from: Date, to: Date): Promise<Payment[]> {
    return this.paymentRepo.findByDateRange(from, to);
  }
}
