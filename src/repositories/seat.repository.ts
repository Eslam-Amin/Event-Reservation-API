import { Pool } from "pg";
import pool from "../config/database";

export enum SeatStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  CONFIRMED = "CONFIRMED"
}

export interface Seat {
  id: number;
  event_id: number;
  seat_number: string;
  status: SeatStatus;
  reserved_by: number | null;
  reserved_at: Date | null;
}

class SeatRepository {
  private db: Pool = pool;

  // Fetch all seats tied to an event
  async getSeatsByEventId(eventId: number): Promise<Seat[]> {
    const query = `SELECT * FROM seats WHERE event_id = $1 and status != 'CONFIRMED' ORDER BY id ASC`;
    const { rows } = await this.db.query(query, [eventId]);
    return rows;
  }

  // Atomic state tracking update
  async updateSeatStatus(
    client: PoolClient,
    seatId: number,
    status: SeatStatus,
    reservedBy: number | null,
    reservedAt: Date | null
  ): Promise<void> {
    const query = `
      UPDATE seats 
      SET status = $1, reserved_by = $2, reserved_at = $3 
      WHERE id = $4
    `;
    await client.query(query, [status, reservedBy, reservedAt, seatId]);
  }
}

export const seatRepository = new SeatRepository();
