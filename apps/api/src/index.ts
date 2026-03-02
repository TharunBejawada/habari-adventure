// apps/api/src/index.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import apiRoutes from "./routes";
import { globalLimiter } from "./middleware/rateLimiter"; // <-- Import it here

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

app.use(helmet()); 

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Apply global limiter
app.use(globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "API is running securely." });
});

app.listen(PORT, () => {
  console.log(`[server]: API is running securely at http://localhost:${PORT}`);
});