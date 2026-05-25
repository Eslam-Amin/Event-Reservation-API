// src/config/database.ts
import { Pool, PoolConfig } from "pg";
import { config } from "./env.config";

const isProduction = config.nodeEnv === "production";

const poolConfig: PoolConfig = {
  connectionString: config.database.url,
  // Maximum number of clients checking out from the pool at any given time
  max: 20,
  // How long a client is allowed to remain idle in the pool before being closed
  idleTimeoutMillis: 30000,
  // How long to wait before throwing an error when connecting a new client
  connectionTimeoutMillis: 2000,
  // SSL configuration for production environments
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

const pool = new Pool(poolConfig);

pool.on("connect", (client) => {
  if (config.nodeEnv === "development") {
    console.log(
      "[Database] New client successfully connected to PostgreSQL pool."
    );

    client.on("error", (err) => {
      console.error(
        "[Database Client Error] Unexpected runtime connection failure:",
        err
      );
    });
  }
});

pool.on("release", (err, client) => {
  if (err) {
    console.error("[Database Pool] Error during client release:", err);
  }
  if (config.nodeEnv === "development") {
    console.log(
      "[Database Pool] A client has safely returned to the idle pool."
    );
  }
});

pool.on("error", (err) => {
  if (config.nodeEnv === "development") {
    console.error("[Database Error] Unexpected connection error:", err);
  }
});

export default pool;
