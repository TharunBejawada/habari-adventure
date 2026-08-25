// apps/api/src/lambda.ts
// AWS Lambda entrypoint for the Amplify Gen 2 backend. Wraps the same
// Express app used by the standalone server (src/index.ts) with
// serverless-http so it can run behind a Lambda Function URL.
//
// No dotenv here - Lambda gets its environment from the function's
// configured environment variables (see amplify/backend.ts), not a .env
// file.
import serverlessHttp from "serverless-http";
import { resolveSsmSecrets } from "./utils/resolveSsmSecrets";

let serverlessAppPromise: Promise<ReturnType<typeof serverlessHttp>> | null = null;

function getServerlessApp() {
  if (!serverlessAppPromise) {
    serverlessAppPromise = (async () => {
      // Must resolve secrets (DATABASE_URL, JWT_SECRET, ...) into
      // process.env *before* apps/api's app module loads - @repo/database
      // reads process.env.DATABASE_URL at module-load time to construct
      // the Prisma driver adapter. A static top-level `import { app } from
      // "./app"` here would evaluate before resolveSsmSecrets() ever runs,
      // permanently baking in the unresolved placeholder value.
      await resolveSsmSecrets();
      const { app } = await import("./app.js");
      return serverlessHttp(app);
    })();
  }
  return serverlessAppPromise;
}

export const handler = async (event: unknown, context: unknown) => {
  const serverlessApp = await getServerlessApp();
  return serverlessApp(event as never, context as never);
};
