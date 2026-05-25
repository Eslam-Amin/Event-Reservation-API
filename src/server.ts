import app from "./app";
import pool from "./config/database";
import { config } from "./config/env.config";

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    // Execute a quick, lightweight query to verify the connection pool is functional
    await pool.query("SELECT NOW()");
    console.log("[Server] Database connection verified successfully.");

    app.listen(PORT, () => {
      console.log(
        `[Server] Event Reservation API running on: http://localhost:${PORT}`
      );
      console.log(
        `[Server] Environment mode: ${config.nodeEnv || "development"}`
      );
    });
  } catch (error) {
    console.error(
      "[Critical Error] Failed to start server due to database connectivity issues:"
    );
    console.error(error);

    // Gracefully terminate the process with a failure exit code
    process.exit(1);
  }
};

startServer();
