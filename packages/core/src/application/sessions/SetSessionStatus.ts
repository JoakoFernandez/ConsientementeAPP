import { SessionRepository } from "../../domain/ports/SessionRepository";
import { SessionStatus } from "../../domain/value-objects/SessionStatus";

export class SetSessionStatus {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(id: string, status: SessionStatus): Promise<void> {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new Error("Session not found");
    session.status = status;
    session.updatedAt = new Date();
    await this.sessionRepo.save(session);
  }
}
