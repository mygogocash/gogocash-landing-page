/// <reference types="@cloudflare/workers-types" />

import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

type CmsEnv = {
  CMS_CONTAINER: DurableObjectNamespace<StrapiCmsContainer>;
  DATABASE_URL?: string;
  DATABASE_SSL?: string;
  DATABASE_SSL_REJECT_UNAUTHORIZED?: string;
  DATABASE_POOL_MIN?: string;
  DATABASE_POOL_MAX?: string;
  APP_KEYS?: string;
  API_TOKEN_SALT?: string;
  ADMIN_JWT_SECRET?: string;
  TRANSFER_TOKEN_SALT?: string;
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;
};

const workerEnv = env as CmsEnv;
const requiredSecretNames = [
  "DATABASE_URL",
  "APP_KEYS",
  "API_TOKEN_SALT",
  "ADMIN_JWT_SECRET",
  "TRANSFER_TOKEN_SALT",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
] as const;

export class StrapiCmsContainer extends Container {
  defaultPort = 1337;
  sleepAfter = "15m";
  envVars = {
    NODE_ENV: "production",
    HOST: "0.0.0.0",
    PORT: "1337",
    STRAPI_TELEMETRY_DISABLED: "true",
    DATABASE_CLIENT: "postgres",
    DATABASE_URL: workerEnv.DATABASE_URL ?? "",
    DATABASE_SSL: workerEnv.DATABASE_SSL ?? "true",
    DATABASE_SSL_REJECT_UNAUTHORIZED:
      workerEnv.DATABASE_SSL_REJECT_UNAUTHORIZED ?? "true",
    DATABASE_POOL_MIN: workerEnv.DATABASE_POOL_MIN ?? "0",
    DATABASE_POOL_MAX: workerEnv.DATABASE_POOL_MAX ?? "3",
    APP_KEYS: workerEnv.APP_KEYS ?? "",
    API_TOKEN_SALT: workerEnv.API_TOKEN_SALT ?? "",
    ADMIN_JWT_SECRET: workerEnv.ADMIN_JWT_SECRET ?? "",
    TRANSFER_TOKEN_SALT: workerEnv.TRANSFER_TOKEN_SALT ?? "",
    JWT_SECRET: workerEnv.JWT_SECRET ?? "",
    ENCRYPTION_KEY: workerEnv.ENCRYPTION_KEY ?? "",
  };

  override onStart() {
    console.log("GoGoCash Learn CMS container started");
  }

  override onStop({ exitCode }: { exitCode: number }) {
    console.log("GoGoCash Learn CMS container stopped", { exitCode });
  }

  override onError(error: unknown) {
    console.error("GoGoCash Learn CMS container error", error);
    throw error;
  }
}

const cmsWorker = {
  async fetch(request: Request, env: CmsEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok", {
        headers: {
          "cache-control": "no-store",
          "content-type": "text/plain; charset=utf-8",
        },
      });
    }

    const missingSecrets = requiredSecretNames.filter((name) => !env[name]);

    if (missingSecrets.length > 0) {
      return Response.json(
        {
          error: "CMS Cloudflare secrets are not configured",
          missing: missingSecrets,
        },
        { status: 503 },
      );
    }

    return getContainer(env.CMS_CONTAINER, "primary").fetch(request);
  },
};

export default cmsWorker;
