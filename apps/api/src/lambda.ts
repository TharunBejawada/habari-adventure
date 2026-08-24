// apps/api/src/lambda.ts
// AWS Lambda entrypoint for the Amplify Gen 2 backend. Wraps the same
// Express app used by the standalone server (src/index.ts) with
// serverless-http so it can run behind a Lambda Function URL / API Gateway.
import dotenv from "dotenv";
dotenv.config();

import serverlessHttp from "serverless-http";
import { app } from "./app";

export const handler = serverlessHttp(app);
