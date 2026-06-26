import { PaymentRepository } from "../../domain/ports/PaymentRepository";
import { SessionRepository } from "../../domain/ports/SessionRepository";
import { PaymentStatus } from "../../domain/value-objects/PaymentStatus";

export class GetDashboardData {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(): Promise<DashboardData> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const todaySessions = await this.sessionRepo.findByDateRange(todayStart, todayEnd);
    const pendingPayments = await this.paymentRepo.findPending();

    const todayPayments = await this.paymentRepo.findByDateRange(todayStart, todayEnd);
    const totalCollectedToday = todayPayments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      todaySessionsCount: todaySessions.length,
      pendingPaymentsCount: pendingPayments.length,
      totalCollectedToday,
      todaySessions,
      pendingPayments,
    };
  }
}

export interface DashboardData {
  todaySessionsCount: number;
  pendingPaymentsCount: number;
  totalCollectedToday: number;
  todaySessions: any[];
  pendingPayments: any[];
}
