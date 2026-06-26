import { Session } from "../entities/Session";
import { SessionStatus } from "../value-objects/SessionStatus";

export interface SessionFilters {
  patientId?: string;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  findAll(filters?: SessionFilters): Promise<Session[]>;
  findByDateRange(from: Date, to: Date): Promise<Session[]>;
  findByPatientId(patientId: string): Promise<Session[]>;
  findByDate(date: Date): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
