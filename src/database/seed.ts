import pool from "../config/database";

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("[Seeder] Cleaning existing event and seat records...");
    // Truncate cascades down to wipe clean both events and seats tables safely
    await pool.query("TRUNCATE TABLE events RESTART IDENTITY CASCADE");

    console.log("[Seeder] Inserting mock events...");
    const eventQuery = `
      INSERT INTO events (id, name, date) VALUES 
      (1, 'Tech Conference 2026', '2026-09-15 09:00:00'),
      (2, 'Music Festival Live', '2026-10-22 18:30:00'),
      (3, 'Startup Pitch Night', '2026-11-05 19:00:00')
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(eventQuery);

    console.log("[Seeder] Inserting mock seats across multiple events...");
    const seatQuery = `
      INSERT INTO seats (event_id, seat_number, status, reserved_by, reserved_at) VALUES 
      -- Seats for Event 1 (Tech Conference 2026)
      (1, 'A-1', 'AVAILABLE', NULL, NULL),
      (1, 'A-2', 'RESERVED', 'developer@domain.com', NOW()), -- Reserved by email
      (1, 'A-3', 'AVAILABLE', NULL, NULL),
      (1, 'B-1', 'CONFIRMED', 'attendee@domain.com', NOW() - INTERVAL '15 minutes'),
      (1, 'B-2', 'AVAILABLE', NULL, NULL),

      -- Seats for Event 2 (Music Festival Live)
      (2, 'VIP-01', 'AVAILABLE', NULL, NULL),
      (2, 'VIP-02', 'RESERVED', 'musicfan@test.com', NOW() - INTERVAL '2 minutes'),
      (2, 'GA-01', 'AVAILABLE', NULL, NULL),
      (2, 'GA-02', 'AVAILABLE', NULL, NULL),

      -- Seats for Event 3 (Startup Pitch Night)
      (3, 'Row1-Seat1', 'AVAILABLE', NULL, NULL),
      (3, 'Row1-Seat2', 'AVAILABLE', NULL, NULL)
      ON CONFLICT (event_id, seat_number) DO NOTHING;
    `;
    await pool.query(seatQuery);

    console.log("[Seeder] Database mock elements populated completely.");
  } catch (error) {
    console.error(
      "[Seeder Error] Failed to execute database populate sequence:"
    );
    console.error(error);
    throw error;
  }
};

// Enables execution independently directly via terminal execution
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("[Seeder] Run completed successfully.");
      process.exit(0);
    })
    .catch(() => {
      console.error("[Seeder] Run aborted due to errors.");
      process.exit(1);
    });
}
