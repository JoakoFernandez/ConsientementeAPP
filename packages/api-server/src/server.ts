import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createPatientRoutes } from "./routes/patientRoutes";
import { createSessionRoutes } from "./routes/sessionRoutes";
import { createPaymentRoutes } from "./routes/paymentRoutes";
import { createSyncRoutes } from "./routes/syncRoutes";
import { errorHandler } from "./middleware/errorHandler";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/patients", createPatientRoutes(prisma));
app.use("/api/sessions", createSessionRoutes(prisma));
app.use("/api/payments", createPaymentRoutes(prisma));
app.use("/api/sync", createSyncRoutes(prisma));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

prisma.$connect().then(() => {
  app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
});
