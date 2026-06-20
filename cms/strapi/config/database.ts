import path from "node:path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");
  const databaseUrl = env("DATABASE_URL");

  const postgresConnection = databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: env.bool("DATABASE_SSL", false)
          ? {
              rejectUnauthorized: env.bool(
                "DATABASE_SSL_REJECT_UNAUTHORIZED",
                true,
              ),
            }
          : false,
      }
    : {
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "gogocash_cms"),
        user: env("DATABASE_USERNAME", "gogocash"),
        password: env("DATABASE_PASSWORD", "gogocash_dev_password"),
        ssl: env.bool("DATABASE_SSL", false)
          ? {
              rejectUnauthorized: env.bool(
                "DATABASE_SSL_REJECT_UNAUTHORIZED",
                true,
              ),
            }
          : false,
        schema: env("DATABASE_SCHEMA", "public"),
      };

  const connections = {
    postgres: {
      connection: postgresConnection,
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          "..",
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db"),
        ),
      },
      useNullAsDefault: true,
    },
  };

  if (!(client in connections)) {
    throw new Error(`Unsupported DATABASE_CLIENT: ${client}`);
  }

  return {
    connection: {
      client,
      ...connections[client as keyof typeof connections],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
