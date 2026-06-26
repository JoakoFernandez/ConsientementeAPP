import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { PrismaClient } from "@prisma/client";

export function createPaymentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const ctrl = new PaymentController(prisma);

  router.get("/", ctrl.listHandler);
  router.post("/", ctrl.createHandler);
  router.patch("/:id/paid", ctrl.markPaidHandler);
  router.get("/export/csv", ctrl.exportCSVHandler);

  return router;
}
