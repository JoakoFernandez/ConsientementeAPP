import { Request, Response } from "express";
import {
  ScheduleSession,
  CompleteSession,
  CancelSession,
  GetSessionsByDateRange,
} from "@consientemente/core";
import { PrismaSessionRepository } from "../adapters/PrismaSessionRepository";
import { PrismaClient } from "@prisma/client";

export class SessionController {
  private schedule: ScheduleSession;
  private complete: CompleteSession;
  private cancel: CancelSession;
  private getByRange: GetSessionsByDateRange;

  constructor(prisma: PrismaClient) {
    const repo = new PrismaSessionRepository(prisma);
    this.schedule = new ScheduleSession(repo);
    this.complete = new CompleteSession(repo);
    this.cancel = new CancelSession(repo);
    this.getByRange = new GetSessionsByDateRange(repo);
  }

  listHandler = async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(0);
    const to = req.query.to ? new Date(req.query.to as string) : new Date(Date.now() + 86400000);
    const sessions = await this.getByRange.execute(from, to);
    res.json(sessions);
  };

  createHandler = async (req: Request, res: Response) => {
    const session = await this.schedule.execute({
      patientId: req.body.patientId,
      date: new Date(req.body.date),
      duration: req.body.duration,
      notes: req.body.notes,
    });
    res.status(201).json(session);
  };

  completeHandler = async (req: Request, res: Response) => {
    await this.complete.execute(req.params.id);
    res.status(200).send();
  };

  cancelHandler = async (req: Request, res: Response) => {
    await this.cancel.execute(req.params.id);
    res.status(200).send();
  };
}
