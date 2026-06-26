import { Request, Response } from "express";
import {
  RegisterPatient,
  UpdatePatient,
  DeletePatient,
  GetPatient,
  ListPatients,
} from "@consientemente/core";
import { PrismaPatientRepository } from "../adapters/PrismaPatientRepository";
import { PrismaClient } from "@prisma/client";

export class PatientController {
  private register: RegisterPatient;
  private update: UpdatePatient;
  private delete: DeletePatient;
  private get: GetPatient;
  private list: ListPatients;

  constructor(prisma: PrismaClient) {
    const repo = new PrismaPatientRepository(prisma);
    this.register = new RegisterPatient(repo);
    this.update = new UpdatePatient(repo);
    this.delete = new DeletePatient(repo);
    this.get = new GetPatient(repo);
    this.list = new ListPatients(repo);
  }

  listHandler = async (req: Request, res: Response) => {
    const patients = await this.list.execute({ search: req.query.search as string });
    res.json(patients);
  };

  getHandler = async (req: Request, res: Response) => {
    const patient = await this.get.execute(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  };

  createHandler = async (req: Request, res: Response) => {
    const patient = await this.register.execute(req.body);
    res.status(201).json(patient);
  };

  updateHandler = async (req: Request, res: Response) => {
    const patient = await this.update.execute({ id: req.params.id, data: req.body });
    res.json(patient);
  };

  deleteHandler = async (req: Request, res: Response) => {
    await this.delete.execute(req.params.id);
    res.status(204).send();
  };
}
