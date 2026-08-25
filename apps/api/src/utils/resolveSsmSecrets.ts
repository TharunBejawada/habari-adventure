// apps/api/src/utils/resolveSsmSecrets.ts
// Resolves this Lambda's Amplify-managed secrets (DATABASE_URL, JWT_SECRET,
// etc) from SSM Parameter Store into process.env at cold start.
//
// Amplify's `secret(...)` values (wired onto the function via
// `addEnvironment` in amplify/backend.ts) don't arrive as real environment
// variable values - they arrive as an SSM parameter path, all of them
// packed into process.env.AMPLIFY_SSM_ENV_CONFIG, while the "real" env var
// (e.g. DATABASE_URL) is left as a placeholder string. Amplify's default
// function bundler normally resolves these itself via an esbuild-injected
// banner, but that machinery is tied to its default bundling pipeline,
// which this function doesn't use (see amplify/functions/api/resource.ts
// for why). Do it ourselves instead.
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

type SsmEnvPath = { path: string; sharedPath?: string };

export async function resolveSsmSecrets(): Promise<void> {
  const raw = process.env.AMPLIFY_SSM_ENV_CONFIG;
  if (!raw) return;

  let envPathObject: Record<string, SsmEnvPath>;
  try {
    envPathObject = JSON.parse(raw);
  } catch {
    return;
  }

  const entries = Object.entries(envPathObject);
  if (entries.length === 0) return;

  const client = new SSMClient({});
  const names = entries.map(([, v]) => v.path);

  const { Parameters } = await client.send(
    new GetParametersCommand({ Names: names, WithDecryption: true })
  );

  for (const param of Parameters ?? []) {
    const match = entries.find(([, v]) => v.path === param.Name);
    if (match && param.Value !== undefined) {
      process.env[match[0]] = param.Value;
    }
  }
}
