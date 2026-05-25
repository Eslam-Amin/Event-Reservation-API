// src/database/migrate.ts
import fs from "fs";
import path from "path";
import pool from "../config/database";

export const runMigrations = async (): Promise<void> => {
  try {
    console.log("[Migration] Starting database synchronization schema run...");

    // Locate and read the structural raw SQL asset
    const sqlFilePath = path.join(__dirname, "init.sql");
    const sqlScript = fs.readFileSync(sqlFilePath, "utf8");

    // Run the script directly through the connection pool
    await pool.query(sqlScript);

    console.log(
      "[Migration] Database tables, types, and seed rows processed successfully."
    );
  } catch (error) {
    console.error("[Critical Migration Error] Database setup failed to run:");
    console.error(error);
    throw error; // Propagate exception back up to crash server startup safely
  }
};

// Enables execution directly via terminal command if called independently
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("[Migration] Run completed successfully.");
      process.exit(0);
    })
    .catch(() => {
      console.log("[Migration] Run aborted due to errors.");
      process.exit(1);
    });
}
