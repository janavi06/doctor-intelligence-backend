
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import doctorRoutes from "./modules/doctors/doctorRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startPublishScheduler } from "./modules/publishing/publishScheduler.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    env.FRONTEND_URL,
  ].filter(Boolean),
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor Intelligence Platform API is running",
  });
});

app.use("/api/doctors", doctorRoutes);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
  startPublishScheduler();
});
