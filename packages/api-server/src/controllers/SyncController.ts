import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export class SyncController {
  constructor(private readonly prisma: PrismaClient) {}

  pushHandler = async (req: Request, res: Response) => {
    const operations = req.body.operations;
    for (const op of operations) {
      await this.prisma.syncOperation.create({ data: op });
    }
    res.status(200).json({ received: operations.length });
  };

  pullHandler = async (req: Request, res: Response) => {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
    const operations = await this.prisma.syncOperation.findMany({
      where: { timestamp: { gt: since }, synced: true },
      orderBy: { timestamp: "asc" },
    });
    res.json(operations);
  };
}
