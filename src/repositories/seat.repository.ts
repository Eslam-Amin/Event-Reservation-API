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
}

export const seatRepository = new SeatRepository();
