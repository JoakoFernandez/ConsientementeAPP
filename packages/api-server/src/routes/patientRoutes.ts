import { Router } from "express";
import { PatientController } from "../controllers/PatientController";
import { PrismaClient } from "@prisma/client";

export function createPatientRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const ctrl = new PatientController(prisma);

  router.get("/", ctrl.listHandler);
  router.get("/:id", ctrl.getHandler);
  router.post("/", ctrl.createHandler);
  router.put("/:id", ctrl.updateHandler);
  router.delete("/:id", ctrl.deleteHandler);

  return router;
}
