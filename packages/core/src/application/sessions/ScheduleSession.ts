import { Session } from "../../domain/entities/Session";
import { SessionRepository } from "../../domain/ports/SessionRepository";
import { SessionStatus } from "../../domain/value-objects/SessionStatus";

export class ScheduleSession {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(input: ScheduleSessionInput): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      date: input.date,
      duration: input.duration,
      notes: input.notes ?? "",
      status: SessionStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.sessionRepo.save(session);
    return session;
  }
}

export interface ScheduleSessionInput {
  patientId: string;
  date: Date;
  duration: number;
  notes?: string;
}
