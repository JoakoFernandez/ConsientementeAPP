import { PaymentRepository } from "../../domain/ports/PaymentRepository";
import { PaymentStatus } from "../../domain/value-objects/PaymentStatus";

export class MarkPaymentAsPaid {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(id: string): Promise<void> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw new Error("Payment not found");
    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.updatedAt = new Date();
    await this.paymentRepo.save(payment);
  }
}
