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
}

export const seatRepository = new SeatRepository();
