// apps/api/src/index.ts
// Standalone server entrypoint - used for local dev, or when the API is
// deployed to a persistent host (e.g. the VPS, or an EC2 instance) rather
// than as a Lambda function. See src/lambda.ts for the Lambda entrypoint.
import dotenv from "dotenv";
import path from "path";

// Load .env from the api directory regardless of cwd
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { app } from "./app";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`[server]: API is running securely at http://localhost:${PORT}`);
});
