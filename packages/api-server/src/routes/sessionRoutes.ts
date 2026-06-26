import { Router } from "express";
import { SessionController } from "../controllers/SessionController";
import { PrismaClient } from "@prisma/client";

export function createSessionRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const ctrl = new SessionController(prisma);

  router.get("/", ctrl.listHandler);
  router.post("/", ctrl.createHandler);
  router.patch("/:id/complete", ctrl.completeHandler);
  router.patch("/:id/cancel", ctrl.cancelHandler);

  return router;
}
