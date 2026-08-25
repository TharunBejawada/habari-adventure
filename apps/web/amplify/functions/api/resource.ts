// apps/web/amplify/functions/api/resource.ts
// Defines the Lambda function that runs the Express API (apps/api), wrapped
// with serverless-http (see apps/api/src/lambda.ts).
//
// This is built as a raw CDK NodejsFunction via defineFunction's "provided
// function" form instead of Amplify's default bundling. Reason: the
// generated Prisma client (node_modules/.prisma/client) ships a WASM query
// compiler and platform binaries that esbuild can't discover through its
// static import/require graph - a plain bundle silently drops them, and the
// client crashes at runtime with "ENOENT ... query_compiler_bg.wasm".
// Amplify's default function bundling only exposes a `minify` option, no way
// to control externals or copy extra files, so we need the escape hatch.
// The fix: mark @prisma/client external (leave `require("@prisma/client")`
// unbundled) and copy the generated client directory into the bundle output
// verbatim via an afterBundling hook, so Node resolves it normally at
// runtime instead of esbuild trying (and failing) to inline it.
//
// DATABASE_URL/JWT_SECRET/etc and the CLOUD_STORAGE_* vars are wired onto
// this function from backend.ts via `addEnvironment`, not here - the
// provided-function form has no `environment` prop of its own.
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { defineFunction } from '@aws-amplify/backend';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/web/amplify/functions/api -> repo root
const repoRoot = path.join(dirname, '../../../../../');

export const apiFunction = defineFunction(
  (scope) =>
    new NodejsFunction(scope, 'api-lambda', {
      entry: path.join(repoRoot, 'apps/api/src/lambda.ts'),
      depsLockFilePath: path.join(repoRoot, 'package-lock.json'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      bundling: {
        format: OutputFormat.ESM,
        externalModules: ['@prisma/client', '.prisma/client'],
        commandHooks: {
          beforeInstall: () => [],
          beforeBundling: () => [],
          afterBundling: (inputDir: string, outputDir: string) => [
            `mkdir -p ${outputDir}/node_modules/.prisma`,
            `cp -r ${inputDir}/node_modules/.prisma/client ${outputDir}/node_modules/.prisma/client`,
            `mkdir -p ${outputDir}/node_modules/@prisma/client`,
            `cp -r ${inputDir}/node_modules/@prisma/client/. ${outputDir}/node_modules/@prisma/client/`,
          ],
        },
      },
    }),
  { resourceGroupName: 'storage' },
);
