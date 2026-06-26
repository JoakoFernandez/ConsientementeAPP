import { Request, Response } from "express";
import {
  RegisterPayment,
  MarkPaymentAsPaid,
  GetPaymentsByDateRange,
  GetPatientPayments,
  ExportToCSV,
} from "@consientemente/core";
import { PrismaPaymentRepository } from "../adapters/PrismaPaymentRepository";
import { PrismaClient } from "@prisma/client";

export class PaymentController {
  private register: RegisterPayment;
  private markPaid: MarkPaymentAsPaid;
  private getByRange: GetPaymentsByDateRange;
  private getByPatient: GetPatientPayments;
  private exportCSV: ExportToCSV;

  constructor(prisma: PrismaClient) {
    const repo = new PrismaPaymentRepository(prisma);
    this.register = new RegisterPayment(repo);
    this.markPaid = new MarkPaymentAsPaid(repo);
    this.getByRange = new GetPaymentsByDateRange(repo);
    this.getByPatient = new GetPatientPayments(repo);
    this.exportCSV = new ExportToCSV(repo);
  }

  listHandler = async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    if (from || to) {
      const payments = await this.getByRange.execute(from ?? new Date(0), to ?? new Date());
      return res.json(payments);
    }
    if (req.query.patientId) {
      const payments = await this.getByPatient.execute(req.query.patientId as string);
      return res.json(payments);
    }
    res.json([]);
  };

  createHandler = async (req: Request, res: Response) => {
    const payment = await this.register.execute({
      patientId: req.body.patientId,
      amount: req.body.amount,
      date: new Date(req.body.date),
      frequency: req.body.frequency,
      notes: req.body.notes,
      periodStart: req.body.periodStart ? new Date(req.body.periodStart) : undefined,
      periodEnd: req.body.periodEnd ? new Date(req.body.periodEnd) : undefined,
    });
    res.status(201).json(payment);
  };

  markPaidHandler = async (req: Request, res: Response) => {
    await this.markPaid.execute(req.params.id);
    res.status(200).send();
  };

  exportCSVHandler = async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const csv = await this.exportCSV.execute({ from, to });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=payments.csv");
    res.send(csv);
  };
}
