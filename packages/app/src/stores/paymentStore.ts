import { create } from "zustand";
import { Payment } from "@consientemente/core";
import {
  RegisterPayment,
  MarkPaymentAsPaid,
  GetPaymentsByDateRange,
  GetPatientPayments,
} from "@consientemente/core";
import { SqlitePaymentRepository } from "../adapters/sqlite/SqlitePaymentRepository";

const repo = new SqlitePaymentRepository();
const registerUseCase = new RegisterPayment(repo);
const markPaidUseCase = new MarkPaymentAsPaid(repo);

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  loadByDate: (date: Date) => Promise<void>;
  loadByRange: (from: Date, to: Date) => Promise<void>;
  loadByPatient: (patientId: string) => Promise<void>;
  loadPending: () => Promise<void>;
  register: (input: Parameters<typeof registerUseCase.execute>[0]) => Promise<Payment>;
  markPaid: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  loadByDate: async (date: Date) => {
    set({ loading: true });
    const payments = await repo.findByDate(date);
    set({ payments, loading: false });
  },
  loadByRange: async (from: Date, to: Date) => {
    set({ loading: true });
    const payments = await repo.findByDateRange(from, to);
    set({ payments, loading: false });
  },
  loadByPatient: async (patientId: string) => {
    set({ loading: true });
    const payments = await repo.findByPatientId(patientId);
    set({ payments, loading: false });
  },
  loadPending: async () => {
    set({ loading: true });
    const payments = await repo.findPending();
    set({ payments, loading: false });
  },
  register: async (input) => {
    const payment = await registerUseCase.execute(input);
    set((state) => ({ payments: [...state.payments, payment] }));
    return payment;
  },
  markPaid: async (id: string) => {
    await markPaidUseCase.execute(id);
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: "PAID" as any, paidAt: new Date(), updatedAt: new Date() } : p
      ),
    }));
  },
}));
