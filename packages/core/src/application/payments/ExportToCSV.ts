import { PaymentRepository } from "../../domain/ports/PaymentRepository";

export class ExportToCSV {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: ExportCSVInput): Promise<string> {
    const from = input.from ?? new Date(0);
    const to = input.to ?? new Date(Date.now() + 86400000);
    const payments = await this.paymentRepo.findByDateRange(from, to);

    const headers = [
      "ID",
      "PatientID",
      "Amount",
      "Date",
      "Frequency",
      "Status",
      "Notes",
      "PeriodStart",
      "PeriodEnd",
      "PaidAt",
    ];

    const rows = payments.map((p) => [
      p.id,
      p.patientId,
      p.amount.toString(),
      p.date.toISOString(),
      p.frequency,
      p.status,
      `"${p.notes.replace(/"/g, '""')}"`,
      p.periodStart ? p.periodStart.toISOString() : "",
      p.periodEnd ? p.periodEnd.toISOString() : "",
      p.paidAt ? p.paidAt.toISOString() : "",
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}

export interface ExportCSVInput {
  from?: Date;
  to?: Date;
}
