import { Pool, PoolClient } from "pg";
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
  reserved_by: string | null;
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

  // Database transaction wrapper utility
  async tx<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Row locking mechanism using Pessimistic Locking
  async getSeatForUpdate(
    client: PoolClient,
    eventId: number,
    seatId: number
  ): Promise<Seat | null> {
    const query = `
      SELECT * FROM seats 
      WHERE id = $1 AND event_id = $2 AND status != 'CONFIRMED'
      FOR UPDATE
    `;
    const { rows } = await client.query(query, [seatId, eventId]);
    return rows[0] || null;
  }

  // Atomic state tracking update
  async updateSeatStatus(
    client: PoolClient,
    seatId: number,
    status: SeatStatus,
    reservedBy: string | null,
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
