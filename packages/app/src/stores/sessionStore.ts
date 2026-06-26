import { create } from "zustand";
import { Session } from "@consientemente/core";
import {
  ScheduleSession,
  CompleteSession,
  CancelSession,
  GetSessionsByDateRange,
} from "@consientemente/core";
import { SqliteSessionRepository } from "../adapters/sqlite/SqliteSessionRepository";

const repo = new SqliteSessionRepository();
const scheduleUseCase = new ScheduleSession(repo);
const completeUseCase = new CompleteSession(repo);
const cancelUseCase = new CancelSession(repo);
const getByRangeUseCase = new GetSessionsByDateRange(repo);

interface SessionState {
  sessions: Session[];
  loading: boolean;
  loadByDate: (date: Date) => Promise<void>;
  loadByRange: (from: Date, to: Date) => Promise<void>;
  loadByPatient: (patientId: string) => Promise<void>;
  schedule: (input: Parameters<typeof scheduleUseCase.execute>[0]) => Promise<Session>;
  complete: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loading: false,
  loadByDate: async (date: Date) => {
    set({ loading: true });
    const sessions = await repo.findByDate(date);
    set({ sessions, loading: false });
  },
  loadByRange: async (from: Date, to: Date) => {
    set({ loading: true });
    const sessions = await getByRangeUseCase.execute(from, to);
    set({ sessions, loading: false });
  },
  loadByPatient: async (patientId: string) => {
    set({ loading: true });
    const sessions = await repo.findByPatientId(patientId);
    set({ sessions, loading: false });
  },
  schedule: async (input) => {
    const session = await scheduleUseCase.execute(input);
    set((state) => ({ sessions: [...state.sessions, session] }));
    return session;
  },
  complete: async (id: string) => {
    await completeUseCase.execute(id);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, status: "COMPLETED" as any, updatedAt: new Date() } : s)),
    }));
  },
  cancel: async (id: string) => {
    await cancelUseCase.execute(id);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, status: "CANCELLED" as any, updatedAt: new Date() } : s)),
    }));
  },
}));
