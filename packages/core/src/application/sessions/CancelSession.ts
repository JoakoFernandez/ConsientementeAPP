import { SessionRepository } from "../../domain/ports/SessionRepository";
import { SessionStatus } from "../../domain/value-objects/SessionStatus";

export class CancelSession {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(id: string): Promise<void> {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new Error("Session not found");
    session.status = SessionStatus.CANCELLED;
    session.updatedAt = new Date();
    await this.sessionRepo.save(session);
  }
}
