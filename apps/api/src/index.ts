// apps/api/src/index.ts
import path from "path";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import apiRoutes from "./routes";
import { globalLimiter } from "./middleware/rateLimiter";

// Load .env from the api directory regardless of cwd
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app: Express = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 8000;

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

app.listen(PORT, () => {
  console.log(`[server]: API is running securely at http://localhost:${PORT}`);
});