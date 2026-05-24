import { Client } from "pg";
import { config } from "../config/env.config";

export const bootstrapDatabase = async (): Promise<void> => {
  const targetDb = process.env.DB_NAME || "ticketing_db";

  // Connect to the default 'postgres' administrative database
  const client = new Client({
    user: config.database.user,
    password: config.database.password,
    host: config.database.host,
    port: parseInt(config.database.port || "5432", 10),
    database: "postgres" // Keep this as the root management database
  });

  try {
    await client.connect();

    // Check if the target database already exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const res = await client.query(checkDbQuery, [targetDb]);

    if (res.rowCount === 0) {
      console.log(
        `[Bootstrap] Database "${targetDb}" not found. Creating it now...`
      );

      // CREATE DATABASE cannot run inside a transaction or take parameterized variables
      await client.query(`CREATE DATABASE ${targetDb}`);

      console.log(`[Bootstrap] Database "${targetDb}" created successfully.`);
    } else {
      console.log(`[Bootstrap] Database "${targetDb}" already exists.`);
    }
  } catch (error) {
    console.error(
      "[Critical Bootstrap Error] Failed to verify or create database:"
    );
    console.error(error);
    throw error;
  } finally {
    // Ensure the management client connection is closed immediately
    await client.end();
  }
};

// Allows running independently via terminal
if (require.main === module) {
  bootstrapDatabase()
    .then(() => {
      console.log("[Bootstrap] Run completed successfully.");
      process.exit(0);
    })
    .catch(() => {
      console.log("[Bootstrap] Failed to bootstrap database.");
      process.exit(1);
    });
}
