// src/config/database.ts
import { Pool, PoolConfig } from "pg";
import { config } from "./env.config";

const isProduction = config.nodeEnv === "production";

const poolConfig: PoolConfig = {
  connectionString: config.dbUrl,
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

pool.on("connect", () => {
  console.log(
    "[Database] New client successfully connected to PostgreSQL pool."
  );
});

pool.on("error", (err) => {
  console.error("[Database Error] Unexpected idle client error:", err);
});

export default pool;
