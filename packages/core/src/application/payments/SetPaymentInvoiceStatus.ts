import { InvoiceStatus } from "../../domain/value-objects/InvoiceStatus";
import { PaymentRepository } from "../../domain/ports/PaymentRepository";

export class SetPaymentInvoiceStatus {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(id: string, invoiceStatus: InvoiceStatus): Promise<void> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw new Error("Payment not found");
    payment.invoiceStatus = invoiceStatus;
    payment.updatedAt = new Date();
    await this.paymentRepo.save(payment);
  }
}