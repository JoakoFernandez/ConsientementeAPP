import { SessionStatus } from "../value-objects/SessionStatus";

export interface Session {
  id: string;
  patientId: string;
  date: Date;
  duration: number;
  notes: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}
