import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScheduleSession } from "../sessions/ScheduleSession";
import { CompleteSession } from "../sessions/CompleteSession";
import { CancelSession } from "../sessions/CancelSession";
import { GetSessionsByDateRange } from "../sessions/GetSessionsByDateRange";
import { Session } from "../../domain/entities/Session";
import { SessionRepository } from "../../domain/ports/SessionRepository";
import { SessionStatus } from "../../domain/value-objects/SessionStatus";

function createMockRepo(): SessionRepository {
  const sessions = new Map<string, Session>();
  return {
    findById: vi.fn(async (id: string) => sessions.get(id) ?? null),
    findAll: vi.fn(async () => Array.from(sessions.values())),
    findByDateRange: vi.fn(async (from: Date, to: Date) =>
      Array.from(sessions.values()).filter((s) => s.date >= from && s.date <= to)
    ),
    findByPatientId: vi.fn(async (patientId: string) =>
      Array.from(sessions.values()).filter((s) => s.patientId === patientId)
    ),
    findByDate: vi.fn(async (date: Date) =>
      Array.from(sessions.values()).filter(
        (s) => s.date.toDateString() === date.toDateString()
      )
    ),
    save: vi.fn(async (s: Session) => { sessions.set(s.id, s); }),
    delete: vi.fn(async (id: string) => { sessions.delete(id); }),
  };
}

describe("ScheduleSession", () => {
  it("creates a session with correct fields", async () => {
    const repo = createMockRepo();
    const useCase = new ScheduleSession(repo);

    const session = await useCase.execute({
      patientId: "patient-1",
      date: new Date("2026-07-01T09:00:00"),
      duration: 50,
    });

    expect(session.id).toBeDefined();
    expect(session.patientId).toBe("patient-1");
    expect(session.duration).toBe(50);
    expect(session.status).toBe(SessionStatus.SCHEDULED);
    expect(session.notes).toBe("");
  });

  it("creates a session with optional notes", async () => {
    const repo = createMockRepo();
    const useCase = new ScheduleSession(repo);

    const session = await useCase.execute({
      patientId: "patient-1",
      date: new Date("2026-07-01T10:00:00"),
      duration: 45,
      notes: "Sesión de seguimiento",
    });

    expect(session.notes).toBe("Sesión de seguimiento");
  });
});

describe("CompleteSession", () => {
  it("marks a session as completed", async () => {
    const repo = createMockRepo();
    const schedule = new ScheduleSession(repo);
    const complete = new CompleteSession(repo);

    const created = await schedule.execute({
      patientId: "patient-1",
      date: new Date(),
      duration: 50,
    });

    await complete.execute(created.id);

    const updated = await repo.findById(created.id);
    expect(updated!.status).toBe(SessionStatus.COMPLETED);
  });

  it("throws when session not found", async () => {
    const repo = createMockRepo();
    const complete = new CompleteSession(repo);

    await expect(complete.execute("nonexistent")).rejects.toThrow("Session not found");
  });
});

describe("CancelSession", () => {
  it("marks a session as cancelled", async () => {
    const repo = createMockRepo();
    const schedule = new ScheduleSession(repo);
    const cancel = new CancelSession(repo);

    const created = await schedule.execute({
      patientId: "patient-1",
      date: new Date(),
      duration: 50,
    });

    await cancel.execute(created.id);

    const updated = await repo.findById(created.id);
    expect(updated!.status).toBe(SessionStatus.CANCELLED);
  });

  it("throws when session not found", async () => {
    const repo = createMockRepo();
    const cancel = new CancelSession(repo);

    await expect(cancel.execute("nonexistent")).rejects.toThrow("Session not found");
  });
});

describe("GetSessionsByDateRange", () => {
  it("returns sessions within date range", async () => {
    const repo = createMockRepo();
    const schedule = new ScheduleSession(repo);
    const getByRange = new GetSessionsByDateRange(repo);

    await schedule.execute({ patientId: "p1", date: new Date("2026-07-01"), duration: 50 });
    await schedule.execute({ patientId: "p1", date: new Date("2026-07-15"), duration: 50 });
    await schedule.execute({ patientId: "p2", date: new Date("2026-08-01"), duration: 50 });

    const from = new Date("2026-07-01");
    const to = new Date("2026-07-31");
    const result = await getByRange.execute(from, to);

    expect(result).toHaveLength(2);
  });
});
