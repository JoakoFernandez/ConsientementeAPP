import { Router } from "express";
import { SyncController } from "../controllers/SyncController";
import { PrismaClient } from "@prisma/client";

export function createSyncRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const ctrl = new SyncController(prisma);

  router.post("/push", ctrl.pushHandler);
  router.get("/pull", ctrl.pullHandler);

  return router;
}
