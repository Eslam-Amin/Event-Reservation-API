import {
  seatRepository,
  Seat,
  SeatStatus
} from "../repositories/seat.repository";
import { ApiError } from "../utils/ApiError";

class SeatService {
  private EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes lock

  private isExpired(reservedAt: Date | null): boolean {
    if (!reservedAt) return false;
    return (
      Date.now() - new Date(reservedAt).getTime() > this.EXPIRATION_TIME_MS
    );
  }

  // List seats with dynamic hybrid validation mapping
  async getEventsSeats(eventId: number): Promise<Seat[]> {
    const seats = await seatRepository.getSeatsByEventId(eventId);
    return seats;
  }

  // Lock a single targeted seat
  async reserveSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await seatRepository.tx(async (client) => {
      const seat = await seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound(
          "The requested seat does not exist for this event."
        );
      }

      // Check if seat is truly free or if its lock timer has already run down
      const isAvailable =
        seat.status === SeatStatus.AVAILABLE ||
        (seat.status === SeatStatus.RESERVED &&
          this.isExpired(seat.reserved_at));

      if (!isAvailable) {
        throw ApiError.badRequest(
          "This seat is already reserved by another user."
        );
      }

      // Assign structural asset reservation parameters securely
      await seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.RESERVED,
        userId,
        new Date()
      );
    });
  }

  // Release an active reservation
  async releaseSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await seatRepository.tx(async (client) => {
      const seat = await seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound("The requested seat does not exist.");
      }

      if (seat.status === SeatStatus.AVAILABLE) {
        throw ApiError.badRequest("This seat is already active and available.");
      }

      if (seat.status === SeatStatus.CONFIRMED) {
        throw ApiError.badRequest(
          "Cannot release a fully confirmed ticket purchase."
        );
      }

      if (seat.reserved_by !== userId) {
        throw ApiError.forbidden(
          "You do not have permission to release a seat reserved by someone else."
        );
      }

      await seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.AVAILABLE,
        null,
        null
      );
    });
  }

  async confirmSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await seatRepository.tx(async (client) => {
      const seat = await seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound("The requested seat does not exist.");
      }

      if (seat.status !== SeatStatus.RESERVED) {
        throw ApiError.badRequest("This seat is not reserved.");
      }

      if (seat.reserved_by !== userId) {
        throw ApiError.forbidden(
          "You do not have permission to confirm a seat reserved by someone else."
        );
      }

      await seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.CONFIRMED,
        userId,
        null,
        new Date()
      );
    });
  }
}

export const seatService = new SeatService();
