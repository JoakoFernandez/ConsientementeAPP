import { Session } from "../../domain/entities/Session";
import { SessionRepository } from "../../domain/ports/SessionRepository";

export class GetSessionsByDateRange {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(from: Date, to: Date): Promise<Session[]> {
    return this.sessionRepo.findByDateRange(from, to);
  }
}
