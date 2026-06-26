import { Payment } from "../../domain/entities/Payment";
import { PaymentRepository } from "../../domain/ports/PaymentRepository";

export class GetPatientPayments {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(patientId: string): Promise<Payment[]> {
    return this.paymentRepo.findByPatientId(patientId);
  }
}
