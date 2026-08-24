// apps/api/src/app.ts
// The Express app itself, with no listener attached. Shared by:
// - src/index.ts (standalone server: local dev, or a persistent host like EC2)
// - src/lambda.ts (AWS Lambda handler, wrapped with serverless-http)
import path from "path";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import apiRoutes from "./routes";
import { globalLimiter } from "./middleware/rateLimiter";

export const app: Express = express();
app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Apply global limiter
app.use(globalLimiter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1", apiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "API is running securely." });
});

// Global error handler — must be last middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error("[Global Error]", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ status: "error", message: err.message || "Internal server error" });
});
